import { supabase } from './supabaseClient';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  tag: string | null;
  stone: string;
  intention: string;
  isFeatured: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

/**
 * Merges a local guest cart into the database for a logged-in user.
 */
export async function mergeGuestCart(userId: string, guestItems: CartItem[]): Promise<CartItem[]> {
  try {
    // 1. Get or create user's cart
    let { data: cart, error: cartError } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (cartError) {
      console.error('Error fetching cart:', cartError);
      return guestItems;
    }

    if (!cart) {
      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert({ user_id: userId })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating cart:', createError);
        return guestItems;
      }
      cart = newCart;
    }

    const cartId = cart.id;

    // 2. Fetch existing database cart items
    const { data: dbItems, error: itemsError } = await supabase
      .from('cart_items')
      .select('product_id, quantity, products(*)')
      .eq('cart_id', cartId);

    if (itemsError) {
      console.error('Error fetching db cart items:', itemsError);
      return guestItems;
    }

    // 3. Perform the merge
    const mergedItemsMap = new Map<string, number>();

    // Seed with database items
    dbItems?.forEach(item => {
      mergedItemsMap.set(item.product_id, item.quantity);
    });

    // Add guest items
    for (const guestItem of guestItems) {
      const prodId = guestItem.product.id;
      const currentQty = mergedItemsMap.get(prodId) || 0;
      mergedItemsMap.set(prodId, currentQty + guestItem.quantity);
    }

    // 4. Update the database with the merged values
    for (const [prodId, finalQty] of mergedItemsMap.entries()) {
      const dbExists = dbItems?.some(item => item.product_id === prodId);
      if (dbExists) {
        // Update
        await supabase
          .from('cart_items')
          .update({ quantity: finalQty })
          .eq('cart_id', cartId)
          .eq('product_id', prodId);
      } else {
        // Insert
        await supabase
          .from('cart_items')
          .insert({
            cart_id: cartId,
            product_id: prodId,
            quantity: finalQty
          });
      }
    }

    // 5. Fetch and return the final merged cart list from the DB
    return await fetchUserCart(userId);
  } catch (err) {
    console.error('Failed to merge cart:', err);
    return guestItems;
  }
}

/**
 * Fetches the user's cart from Supabase.
 */
export async function fetchUserCart(userId: string): Promise<CartItem[]> {
  try {
    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!cart) return [];

    const { data: items, error } = await supabase
      .from('cart_items')
      .select('quantity, products(*)')
      .eq('cart_id', cart.id);

    if (error || !items) {
      console.error('Error fetching user cart items:', error);
      return [];
    }

    return items.map((item: any) => ({
      product: {
        id: item.products.id,
        name: item.products.name,
        description: item.products.description,
        price: Number(item.products.price),
        tag: item.products.tag,
        stone: item.products.stone,
        intention: item.products.intention,
        isFeatured: item.products.is_featured,
      },
      quantity: item.quantity
    }));
  } catch (err) {
    console.error('Failed to fetch user cart:', err);
    return [];
  }
}

/**
 * Syncs a single cart update to Supabase if the user is logged in.
 */
export async function syncCartItemUpdate(userId: string, productId: string, quantity: number): Promise<void> {
  try {
    let { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!cart) {
      const { data: newCart } = await supabase
        .from('carts')
        .insert({ user_id: userId })
        .select('id')
        .single();
      cart = newCart;
    }

    if (!cart) return;

    if (quantity <= 0) {
      // Remove
      await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cart.id)
        .eq('product_id', productId);
    } else {
      // Upsert
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id')
        .eq('cart_id', cart.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('cart_id', cart.id)
          .eq('product_id', productId);
      } else {
        await supabase
          .from('cart_items')
          .insert({
            cart_id: cart.id,
            product_id: productId,
            quantity
          });
      }
    }
  } catch (err) {
    console.error('Failed to sync cart item update:', err);
  }
}
