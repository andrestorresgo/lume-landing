import * as React from "react"
import { useState, useMemo, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet"
import { 
  ShoppingBag, 
  Sparkle
} from "@phosphor-icons/react"
import mockData from "@/data/mockData.json"
import { Skeleton } from "@/components/ui/skeleton"

// Refactored Reusable Components
import ProductCard from "./ProductCard"
import CartItemRow from "./CartItemRow"
import FilterSortBar from "./FilterSortBar"
import StorytellingBlock from "./StorytellingBlock"
import AuthModal from "./AuthModal"
import { AuthProvider, useAuth } from "../context/AuthContext"
import { supabase } from "../lib/supabaseClient"

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  tag: string | null;
  stone: string;
  intention: string;
  isFeatured: boolean;
}

interface CollectionsPageProps {
  placeholderImage: string;
  initialStone?: string | null;
  initialIntention?: string | null;
  customHeroTitle?: string;
  customHeroDescription?: string;
  customPretitle?: string;
}

function CollectionsPageContent({ 
  placeholderImage,
  initialStone = null,
  initialIntention = null,
  customHeroTitle,
  customHeroDescription,
  customPretitle
}: CollectionsPageProps) {
  // Auth and Cart Context
  const { 
    user, 
    cart, 
    cartCount, 
    cartSubtotal, 
    isCartOpen, 
    setIsCartOpen, 
    addToCart, 
    updateQuantity, 
    removeFromCart,
    clearCart
  } = useAuth()

  // Local States
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [selectedStone, setSelectedStone] = useState<string | null>(initialStone)
  const [selectedIntention, setSelectedIntention] = useState<string | null>(initialIntention)
  const [sortBy, setSortBy] = useState<string>("featured")
  const [shouldBump, setShouldBump] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [shouldCheckoutAfterLogin, setShouldCheckoutAfterLogin] = useState(false)

  // Fetch products from database
  useEffect(() => {
    async function loadProducts() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: true })

        if (error) throw error

        if (data && data.length > 0) {
          setProducts(
            data.map((p: any) => ({
              id: p.id,
              name: p.name,
              description: p.description,
              price: Number(p.price),
              tag: p.tag,
              stone: p.stone,
              intention: p.intention,
              isFeatured: p.is_featured,
            }))
          )
        } else {
          // Seeding fallback
          setProducts(mockData.products as Product[])
        }
      } catch (err) {
        console.error("Failed to load products from Supabase:", err)
        // Fallback to local mock data
        setProducts(mockData.products as Product[])
      } finally {
        setLoadingProducts(false)
      }
    }
    loadProducts()
  }, [])

  // Animate cart floating button when count increases
  useEffect(() => {
    if (cartCount > 0) {
      setShouldBump(true)
    }
  }, [cartCount])

  const handleAnimationEnd = useCallback(() => {
    setShouldBump(false)
  }, [])

  // Checkout Gate
  const handleCheckout = useCallback(async (activeUser = user) => {
    if (!activeUser) {
      setShouldCheckoutAfterLogin(true)
      setIsAuthModalOpen(true)
      return
    }

    setIsCartOpen(false)
    window.location.href = "/checkout"
  }, [user, setIsCartOpen])

  const handleAuthSuccess = useCallback(() => {
    if (shouldCheckoutAfterLogin) {
      setShouldCheckoutAfterLogin(false)
      // Retrieve the freshly logged in user to bypass context sync delay
      supabase.auth.getUser().then(({ data: { user: freshlyLoggedInUser } }) => {
        if (freshlyLoggedInUser) {
          handleCheckout(freshlyLoggedInUser)
        }
      })
    }
  }, [shouldCheckoutAfterLogin, handleCheckout])

  // Stable setters for Filters and Sort
  const handleSetStone = useCallback((stone: string | null) => {
    setSelectedStone(stone)
  }, [])

  const handleSetIntention = useCallback((intention: string | null) => {
    setSelectedIntention(intention)
  }, [])

  const handleSetSortBy = useCallback((sort: string) => {
    setSortBy(sort)
  }, [])

  // Filtering and Sorting
  const filteredProducts = useMemo(() => {
    let result = [...products]

    if (selectedStone) {
      result = result.filter(p => p.stone === selectedStone)
    }

    if (selectedIntention) {
      result = result.filter(p => p.intention === selectedIntention)
    }

    // Sort
    if (sortBy === "price-low-high") {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-high-low") {
      result.sort((a, b) => b.price - a.price)
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name))
    }

    return result
  }, [products, selectedStone, selectedIntention, sortBy])

  // Split into normal products and featured layout
  const normalProducts = useMemo(() => {
    return filteredProducts.filter(p => !p.isFeatured)
  }, [filteredProducts])

  const featuredProduct = useMemo(() => {
    return filteredProducts.find(p => p.isFeatured)
  }, [filteredProducts])

  // Handler for adding the featured set
  const handleAddFeatured = useCallback(() => {
    if (featuredProduct) {
      addToCart(featuredProduct)
    }
  }, [featuredProduct, addToCart])

  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#1C1917] font-sans antialiased pb-24 selection:bg-[#7C0A12] selection:text-white">
      {/* Floating Cart Trigger */}
      <button 
        onClick={() => setIsCartOpen(true)}
        onAnimationEnd={handleAnimationEnd}
        className={`fixed bottom-8 right-8 z-50 flex items-center justify-center bg-[#7C0A12] hover:bg-[#560006] text-white size-14 rounded-full shadow-2xl transition-[transform,background-color] duration-200 ease-out active:scale-95 group ${shouldBump ? 'animate-cart-bump' : 'hover:scale-105'}`}
        aria-label="Ver bolsa de compras"
      >
        <div className="relative">
          <ShoppingBag size={24} className="group-hover-bag-wiggle" />
          {cartCount > 0 ? (
            <span className="absolute -top-2 -right-2 bg-[#1C1917] text-white text-[10px] font-bold size-5 rounded-full flex items-center justify-center border border-[#fbf9f6] animate-badge-pop">
              {cartCount}
            </span>
          ) : null}
        </div>
      </button>

      {/* Cart Drawer */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent className="w-full sm:max-w-md bg-[#fbf9f6] border-l border-[#78716C]/20 flex flex-col h-full p-0">
          <SheetHeader className="p-6 border-b border-[#78716C]/10 flex flex-row items-center justify-between">
            <div>
              <SheetTitle className="font-heading text-2xl text-[#1C1917]">Tu Bolsa</SheetTitle>
              <SheetDescription className="text-xs text-[#78716C] mt-1">
                {cartCount === 1 ? '1 artículo seleccionado' : `${cartCount} artículos seleccionados`}
              </SheetDescription>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-12">
                <ShoppingBag size={48} className="text-[#78716C]/40" />
                <p className="font-heading text-lg text-[#78716C]">Tu bolsa está vacía</p>
                <p className="text-xs text-[#78716C]/80 max-w-[240px]">Agrega piezas atemporales de nuestra colección permanente.</p>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 border-[#1C1917] text-[#1C1917] hover:bg-[#1C1917] hover:text-white"
                >
                  Seguir comprando
                </Button>
              </div>
            ) : (
              cart.map((item) => (
                <CartItemRow
                  key={item.product.id}
                  item={item}
                  placeholderImage={placeholderImage}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))
            )}
          </div>

          {cart.length > 0 ? (
            <SheetFooter className="p-6 border-t border-[#78716C]/10 bg-[#f5f3f0] flex flex-col gap-4">
              <div className="flex justify-between items-center w-full">
                <span className="font-heading text-lg text-[#1C1917] font-semibold">Subtotal</span>
                <span className="font-heading text-xl text-[#7C0A12] font-bold">Bs. {cartSubtotal}</span>
              </div>
              <p className="text-[10px] text-[#78716C] text-left">
                Envío gratuito en todas las piezas de la colección. Las tarifas de impuestos se calcularán en el pago.
              </p>
              <Button 
                onClick={() => handleCheckout()}
                className="w-full bg-[#1C1917] hover:bg-[#7C0A12] text-white py-6 text-xs uppercase tracking-widest font-semibold transition-all duration-300 rounded-none h-auto cursor-pointer"
              >
                Proceder al Pago
              </Button>
            </SheetFooter>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Editorial Header */}
      <section className="px-6 md:px-16 pt-32 pb-16 flex flex-col items-center text-center max-w-5xl mx-auto">
        <span className="text-xs uppercase tracking-widest text-[#78716C] font-semibold mb-4 flex items-center gap-1.5 justify-center">
          <Sparkle size={12} className="text-[#7C0A12]" />
          {customPretitle || mockData.hero.pretitle}
        </span>
        <h1 className="font-heading text-4xl md:text-6xl text-[#1C1917] mb-6 leading-tight max-w-4xl tracking-tight whitespace-pre-line">
          {customHeroTitle ? customHeroTitle : <>Hecho a mano. <br className="hidden md:block"/>Hecho para ti.</>}
        </h1>
        <div className="w-12 h-0.5 bg-[#7C0A12] mb-6"></div>
        <p className="text-base md:text-lg text-[#625d5b] max-w-2xl mx-auto font-light leading-relaxed">
          {customHeroDescription || mockData.hero.description}
        </p>
      </section>

      {/* Filter & Sort Bar (Memoized Component) */}
      <FilterSortBar
        selectedStone={selectedStone}
        setSelectedStone={handleSetStone}
        selectedIntention={selectedIntention}
        setSelectedIntention={handleSetIntention}
        sortBy={sortBy}
        setSortBy={handleSetSortBy}
        stones={mockData.stones}
        intentions={mockData.intentions}
      />

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-6 md:px-16 flex flex-col gap-16">
        {loadingProducts ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex flex-col">
                {/* Realistic Card Image Skeleton */}
                <div className="relative overflow-hidden aspect-[3/4] bg-[#efeeeb] mb-4 border border-[#78716C]/15">
                  <Skeleton className="w-full h-full rounded-none bg-[#78716C]/5" />
                </div>
                
                {/* Details Skeleton aligning with CardHeader */}
                <div className="flex flex-row items-start justify-between p-0 gap-1">
                  <div className="flex flex-col gap-1 w-2/3">
                    <Skeleton className="h-5 w-10/12 rounded-none bg-[#78716C]/15" />
                    <Skeleton className="h-3 w-7/12 rounded-none bg-[#78716C]/10 mt-1" />
                  </div>
                  <Skeleton className="h-5 w-12 rounded-none bg-[#78716C]/15 shrink-0 mt-0.5" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#78716C]/30 bg-[#f5f3f0] flex flex-col items-center gap-4">
            <p className="font-heading text-xl text-[#78716C]">No se encontraron piezas</p>
            <p className="text-xs text-[#78716C]/85">Intenta cambiar tus filtros o criterios de búsqueda.</p>
            <Button 
              onClick={() => { setSelectedStone(null); setSelectedIntention(null); setSortBy("featured"); }}
              className="bg-[#1C1917] hover:bg-[#7C0A12] text-white text-xs uppercase tracking-wider px-6 rounded-none h-auto cursor-pointer"
            >
              Restablecer todo
            </Button>
          </div>
        ) : (
          <>
            {/* Products grid */}
            {normalProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {normalProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    placeholderImage={placeholderImage}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>
            ) : null}

            {/* Editorial Storytelling Block (Memoized) */}
            <StorytellingBlock
              placeholderImage={placeholderImage}
              storytelling={mockData.storytelling}
            />

            {/* Asymmetrical Featured Products Row */}
            {featuredProduct ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-4">
                <div className="lg:col-span-7 group flex flex-col">
                  <div className="relative overflow-hidden aspect-[4/5] bg-[#efeeeb] border border-[#78716C]/15 card-image-container">
                    <img 
                      src={placeholderImage} 
                      alt={featuredProduct.name} 
                      className="w-full h-full object-cover card-image"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="absolute bottom-0 left-0 w-full p-6 quick-add-container z-20">
                      <Button 
                        onClick={handleAddFeatured}
                        className="w-full bg-[#1C1917] hover:bg-[#7C0A12] text-white py-6 text-xs uppercase tracking-wider font-semibold rounded-none quick-add-button h-auto"
                      >
                        Agregar Set - Bs. {featuredProduct.price}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-start mt-6">
                    <div className="flex flex-col gap-1">
                      <h3 className="font-heading text-2xl text-[#1C1917] font-medium leading-tight card-title-link">
                        {featuredProduct.name}
                      </h3>
                      <p className="text-sm text-[#78716C] max-w-md font-light leading-relaxed">
                        {featuredProduct.description}
                      </p>
                    </div>
                    <span className="font-heading text-lg font-bold text-[#1C1917] shrink-0 mt-1">
                      Bs. {featuredProduct.price}
                    </span>
                  </div>
                </div>

                {/* Editorial text companion or second slot */}
                <div className="lg:col-span-5 flex flex-col justify-center items-start lg:pl-12 gap-6 h-full py-8">
                  <span className="text-xs uppercase tracking-widest text-[#7C0A12] font-bold">Edición Especial</span>
                  <h3 className="font-heading text-3xl text-[#1C1917] leading-tight">
                    Equilibrio perfecto de intenciones y texturas.
                  </h3>
                  <p className="text-sm text-[#625d5b] leading-relaxed font-light">
                    Esta pieza destacada reúne las piedras principales de nuestra colección en una composición armónica. Roca de lava para el arraigo, ojo de tigre para la fuerza interna, y cuarzo para la amplificación de energía.
                  </p>
                  <div className="flex flex-col gap-2 w-full max-w-xs mt-4">
                    <div className="flex justify-between text-xs py-2 border-b border-[#78716C]/10 text-[#1C1917]">
                      <span className="font-semibold">Piedra Principal</span>
                      <span>Ágata & Roca Volcánica</span>
                    </div>
                    <div className="flex justify-between text-xs py-2 border-b border-[#78716C]/10 text-[#1C1917]">
                      <span className="font-semibold">Metal</span>
                      <span>Plata de Ley .925</span>
                    </div>
                    <div className="flex justify-between text-xs py-2 border-b border-[#78716C]/10 text-[#1C1917]">
                      <span className="font-semibold">Origen</span>
                      <span>Hecho a mano en Bolivia</span>
                    </div>
                  </div>
                  <Button 
                    onClick={handleAddFeatured}
                    className="bg-[#1C1917] hover:bg-[#7C0A12] text-white text-xs uppercase tracking-widest px-8 py-5 h-auto rounded-none mt-4 transition-colors duration-300 cursor-pointer"
                  >
                    Adquirir Set - Bs. {featuredProduct.price}
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </main>
    </div>
  )
}

export default function CollectionsPage(props: CollectionsPageProps) {
  return (
    <AuthProvider>
      <CollectionsPageContent {...props} />
    </AuthProvider>
  )
}
