import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';
import { mergeGuestCart, fetchUserCart, syncCartItemUpdate, type CartItem, type Product } from '../lib/cartSync';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  authLoading: boolean;
  cartLoading: boolean;
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product) => Promise<void>;
  updateQuantity: (productId: string, delta: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  signOut: () => Promise<void>;
  triggerCartMerge: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_CART_KEY = 'lume_guest_cart';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Expose total item count
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Expose cart subtotal
  const cartSubtotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  // Helper to load guest cart from localStorage
  const loadGuestCart = () => {
    try {
      const stored = localStorage.getItem(GUEST_CART_KEY);
      if (stored) {
        setCart(JSON.parse(stored));
      } else {
        setCart([]);
      }
    } catch (err) {
      console.error('Failed to load guest cart:', err);
      setCart([]);
    } finally {
      setCartLoading(false);
    }
  };

  // Helper to save guest cart to localStorage
  const saveGuestCart = (items: CartItem[]) => {
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('Failed to save guest cart:', err);
    }
  };

  // Trigger merging local cart into Supabase
  const triggerCartMerge = useCallback(async (userId: string) => {
    setCartLoading(true);
    try {
      const stored = localStorage.getItem(GUEST_CART_KEY);
      const guestItems: CartItem[] = stored ? JSON.parse(stored) : [];
      
      const merged = await mergeGuestCart(userId, guestItems);
      setCart(merged);
      
      // Clear guest cart once merged
      localStorage.removeItem(GUEST_CART_KEY);
    } catch (err) {
      console.error('Error during cart merging:', err);
      // Fallback: fetch user's cart anyway
      const userCart = await fetchUserCart(userId);
      setCart(userCart);
    } finally {
      setCartLoading(false);
    }
  }, []);

  // Initialize Auth & Cart
  useEffect(() => {
    let active = true;

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        triggerCartMerge(currentUser.id);
      } else {
        loadGuestCart();
      }
      setAuthLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) return;
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (event === 'SIGNED_IN' && currentUser) {
        await triggerCartMerge(currentUser.id);
      } else if (event === 'SIGNED_OUT') {
        setCart([]);
        localStorage.removeItem(GUEST_CART_KEY);
        setCartLoading(false);
      }
      setAuthLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [triggerCartMerge]);

  // Cart operations
  const addToCart = useCallback(async (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find(item => item.product.id === product.id);
      let newCart: CartItem[];
      if (existing) {
        newCart = prevCart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newCart = [...prevCart, { product, quantity: 1 }];
      }

      if (user) {
        syncCartItemUpdate(user.id, product.id, existing ? existing.quantity + 1 : 1);
      } else {
        saveGuestCart(newCart);
      }

      return newCart;
    });
    setIsCartOpen(true);
  }, [user]);

  const updateQuantity = useCallback(async (productId: string, delta: number) => {
    setCart((prevCart) => {
      const updated = prevCart.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty > 0) {
            if (user) {
              syncCartItemUpdate(user.id, productId, newQty);
            }
            return { ...item, quantity: newQty };
          } else {
            if (user) {
              syncCartItemUpdate(user.id, productId, 0);
            }
            return null;
          }
        }
        return item;
      }).filter((item): item is CartItem => item !== null);

      if (!user) {
        saveGuestCart(updated);
      }

      return updated;
    });
  }, [user]);

  const removeFromCart = useCallback(async (productId: string) => {
    setCart((prevCart) => {
      const updated = prevCart.filter(item => item.product.id !== productId);
      if (user) {
        syncCartItemUpdate(user.id, productId, 0);
      } else {
        saveGuestCart(updated);
      }
      return updated;
    });
  }, [user]);

  const clearCart = useCallback(async () => {
    setCart([]);
    if (user) {
      // Fetch user's cart to clear items
      const { data: cartObj } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (cartObj) {
        await supabase.from('cart_items').delete().eq('cart_id', cartObj.id);
      }
    } else {
      localStorage.removeItem(GUEST_CART_KEY);
    }
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        authLoading,
        cartLoading,
        cart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        signOut,
        triggerCartMerge
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
