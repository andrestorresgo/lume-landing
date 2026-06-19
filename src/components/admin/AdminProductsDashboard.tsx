import * as React from "react";
import { useState, useMemo, useCallback } from "react";
import { supabase } from "../../lib/supabaseClient";
import ProductForm from "./ProductForm";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import { 
  Plus, 
  PencilSimple, 
  Trash, 
  MagnifyingGlass, 
  CaretLeft, 
  CaretRight, 
  SignOut,
  Sparkle
} from "@phosphor-icons/react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  tag: string | null;
  stone: string;
  intention: string;
  is_featured: boolean;
}

interface AdminProductsDashboardProps {
  initialProducts: Product[];
  userEmail?: string;
}

const ITEMS_PER_PAGE = 8;

export default function AdminProductsDashboard({
  initialProducts,
  userEmail = "admin@lume.com",
}: AdminProductsDashboardProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Delete Modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return products;

    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.stone.toLowerCase().includes(query) ||
        p.intention.toLowerCase().includes(query) ||
        (p.tag && p.tag.toLowerCase().includes(query)) ||
        p.description.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Adjust page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Add or Update product
  const handleSaveProduct = async (productData: any) => {
    if (productData.id) {
      // Edit mode
      const { data, error } = await supabase
        .from("products")
        .update({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          tag: productData.tag,
          stone: productData.stone,
          intention: productData.intention,
          is_featured: productData.is_featured,
        })
        .eq("id", productData.id)
        .select()
        .single();

      if (error) throw error;

      setProducts((prev) =>
        prev.map((p) => (p.id === productData.id ? { ...p, ...data, price: Number(data.price) } : p))
      );
    } else {
      // Create mode
      const { data, error } = await supabase
        .from("products")
        .insert({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          tag: productData.tag,
          stone: productData.stone,
          intention: productData.intention,
          is_featured: productData.is_featured,
        })
        .select()
        .single();

      if (error) throw error;

      setProducts((prev) => [{ ...data, price: Number(data.price) }, ...prev]);
    }
  };

  // Delete product
  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", deletingProduct.id);

    if (error) throw error;

    setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
    setDeletingProduct(null);
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteOpen(true);
  };

  const handleAddClick = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#1C1917] font-sans flex flex-col antialiased">
      {/* Admin Header */}
      <header className="bg-white border-b border-[#78716C]/10 px-6 py-4 md:px-12 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <a href="/" className="font-heading text-2xl tracking-tighter text-[#1C1917] hover:opacity-85 transition-opacity">
            LUMÉ
          </a>
          <span className="h-4 w-px bg-[#78716C]/20"></span>
          <span className="text-[10px] uppercase tracking-widest font-semibold text-[#78716C] bg-[#78716C]/5 px-2.5 py-1">
            Panel de Control
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="hidden sm:inline text-[#78716C]/80 font-normal">Sesión: {userEmail}</span>
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-[#7C0A12] hover:text-[#560006] transition-colors font-semibold uppercase tracking-wider text-[10px] cursor-pointer"
          >
            <SignOut size={14} />
            Salir
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 md:px-12 flex flex-col gap-6">
        
        {/* Page Title & Desc */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#78716C]/10 pb-6">
          <div className="flex flex-col gap-1.5">
            <h1 className="font-heading text-3xl md:text-4xl font-medium tracking-tight text-[#1C1917]">
              Gestión de Productos
            </h1>
            <p className="text-xs text-[#78716C] font-light leading-relaxed">
              Administra las piezas de tu catálogo, edita sus detalles, agrega nuevas intenciones y configura destacados.
            </p>
          </div>
          <button
            onClick={handleAddClick}
            className="bg-[#1C1917] hover:bg-[#7C0A12] text-white text-[10px] uppercase tracking-widest font-semibold px-5 py-3.5 transition-all duration-300 rounded-none flex items-center gap-2 cursor-pointer self-start md:self-auto shadow-sm"
          >
            <Plus size={14} weight="bold" />
            Agregar Pieza
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex items-center bg-white border border-[#78716C]/15 px-4 py-3 rounded-none shadow-sm">
          <MagnifyingGlass size={18} className="text-[#78716C]/60 mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Buscar por nombre, gema, intención, etiqueta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none text-xs outline-none placeholder-[#78716C]/40 text-[#1C1917] font-light"
          />
        </div>

        {/* Data Table */}
        <div className="bg-white border border-[#78716C]/15 rounded-none overflow-hidden shadow-sm flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fcfbf9] border-b border-[#78716C]/10 text-[9px] uppercase tracking-widest text-[#78716C] font-semibold">
                  <th className="px-6 py-4">Pieza</th>
                  <th className="px-6 py-4">Gema / Piedra</th>
                  <th className="px-6 py-4">Intención</th>
                  <th className="px-6 py-4">Precio</th>
                  <th className="px-6 py-4">Etiqueta</th>
                  <th className="px-6 py-4 text-center">Destacado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#78716C]/10 text-xs">
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-[#78716C] font-light">
                      No se encontraron productos en el catálogo.
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-[#fbf9f6]/30 transition-colors">
                      <td className="px-6 py-4.5 font-medium text-[#1C1917]">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-heading text-sm font-medium">{product.name}</span>
                          <span className="text-[10px] text-[#78716C] font-light line-clamp-1 max-w-sm">
                            {product.description}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4.5 text-[#625d5b]">{product.stone}</td>
                      <td className="px-6 py-4.5 text-[#625d5b]">
                        <span className="inline-flex items-center gap-1">
                          <Sparkle size={10} className="text-[#7C0A12]" />
                          {product.intention}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 font-semibold text-[#1C1917]">Bs. {product.price}</td>
                      <td className="px-6 py-4.5">
                        {product.tag ? (
                          <span className="bg-[#7C0A12]/5 text-[#7C0A12] border border-[#7C0A12]/15 text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5">
                            {product.tag}
                          </span>
                        ) : (
                          <span className="text-[#78716C]/40">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4.5 text-center">
                        {product.is_featured ? (
                          <span className="bg-[#1C1917] text-white text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 border border-[#1C1917]">
                            Sí
                          </span>
                        ) : (
                          <span className="text-[#78716C]/40">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4.5 text-right font-medium">
                        <div className="flex items-center justify-end gap-3.5">
                          <button
                            onClick={() => handleEditClick(product)}
                            className="text-[#78716C] hover:text-[#1C1917] transition-colors p-1 cursor-pointer"
                            title="Editar pieza"
                          >
                            <PencilSimple size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(product)}
                            className="text-[#78716C] hover:text-[#7C0A12] transition-colors p-1 cursor-pointer"
                            title="Eliminar pieza"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {filteredProducts.length > 0 && (
            <div className="bg-[#fcfbf9] border-t border-[#78716C]/10 px-6 py-4 flex flex-row items-center justify-between gap-4 text-xs">
              <span className="text-[#78716C] font-light">
                Mostrando{" "}
                <span className="font-semibold text-[#1C1917]">
                  {Math.min(filteredProducts.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}
                </span>{" "}
                a{" "}
                <span className="font-semibold text-[#1C1917]">
                  {Math.min(filteredProducts.length, currentPage * ITEMS_PER_PAGE)}
                </span>{" "}
                de <span className="font-semibold text-[#1C1917]">{filteredProducts.length}</span> piezas
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border border-[#78716C]/15 bg-white p-2 text-[#78716C] hover:text-[#1C1917] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#78716C]/5 transition-colors cursor-pointer"
                >
                  <CaretLeft size={14} />
                </button>
                <span className="text-[#78716C] px-1 font-light">
                  Pág. {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border border-[#78716C]/15 bg-white p-2 text-[#78716C] hover:text-[#1C1917] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#78716C]/5 transition-colors cursor-pointer"
                >
                  <CaretRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Forms & Dialogs */}
      <ProductForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteProduct}
        productName={deletingProduct?.name || ""}
      />
    </div>
  );
}
