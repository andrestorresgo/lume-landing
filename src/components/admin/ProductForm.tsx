import * as React from "react";
import { useState, useEffect } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  tag: string | null;
  stone: string;
  intention: string;
  is_featured: boolean;
}

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: any) => Promise<void>;
  product?: Product | null;
}

const productSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().min(5, "La descripción debe tener al menos 5 caracteres"),
  price: z.number({ invalid_type_error: "El precio debe ser un número" }).min(0, "El precio no puede ser negativo"),
  stone: z.string().min(2, "La gema/piedra es obligatoria"),
  intention: z.string().min(2, "La intención es obligatoria"),
  tag: z.string().nullable().optional(),
  is_featured: z.boolean().default(false),
});

export default function ProductForm({
  isOpen,
  onClose,
  onSave,
  product,
}: ProductFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stone, setStone] = useState("");
  const [intention, setIntention] = useState("");
  const [tag, setTag] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Sync form state with product prop when opened/changed
  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setDescription(product.description || "");
      setPrice(product.price ? String(product.price) : "");
      setStone(product.stone || "");
      setIntention(product.intention || "");
      setTag(product.tag || "");
      setIsFeatured(product.is_featured || false);
    } else {
      setName("");
      setDescription("");
      setPrice("");
      setStone("");
      setIntention("");
      setTag("");
      setIsFeatured(false);
    }
    setErrors({});
  }, [product, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const dataToValidate = {
      name,
      description,
      price: parseFloat(price),
      stone,
      intention,
      tag: tag || null,
      is_featured: isFeatured,
    };

    const validation = productSchema.safeParse(dataToValidate);

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    try {
      await onSave({
        ...dataToValidate,
        id: product?.id, // include ID if editing
      });
      onClose();
    } catch (err: any) {
      console.error("Save error:", err);
      setErrors({ form: err.message || "Ocurrió un error al guardar el producto." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#fbf9f6] border border-[#78716C]/20 p-8 max-w-lg rounded-none text-[#1C1917] font-sans overflow-y-auto max-h-[90vh]">
        <DialogHeader className="mb-4">
          <DialogTitle className="font-heading text-2xl font-medium tracking-tight text-center">
            {product ? "Editar Producto" : "Nuevo Producto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {errors.form && (
            <div className="text-[11px] text-[#7C0A12] bg-[#7C0A12]/5 border border-[#7C0A12]/15 px-3 py-2 text-center font-medium">
              {errors.form}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-[10px] uppercase tracking-widest font-semibold text-[#78716C]">
              Nombre de la pieza
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="w-full bg-[#f5f3f0] border border-[#78716C]/20 px-3 py-2 text-xs outline-none focus:border-[#1C1917] transition-colors rounded-none"
              placeholder="Ej. Claridad Absoluta"
            />
            {errors.name && <span className="text-[10px] text-[#7C0A12]">{errors.name}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="price" className="text-[10px] uppercase tracking-widest font-semibold text-[#78716C]">
                Precio (Bs.)
              </label>
              <input
                id="price"
                type="number"
                step="any"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={loading}
                className="w-full bg-[#f5f3f0] border border-[#78716C]/20 px-3 py-2 text-xs outline-none focus:border-[#1C1917] transition-colors rounded-none"
                placeholder="0.00"
              />
              {errors.price && <span className="text-[10px] text-[#7C0A12]">{errors.price}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="tag" className="text-[10px] uppercase tracking-widest font-semibold text-[#78716C]">
                Etiqueta (Opcional)
              </label>
              <input
                id="tag"
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                disabled={loading}
                className="w-full bg-[#f5f3f0] border border-[#78716C]/20 px-3 py-2 text-xs outline-none focus:border-[#1C1917] transition-colors rounded-none"
                placeholder="Ej. Nuevo, Más Vendido"
              />
              {errors.tag && <span className="text-[10px] text-[#7C0A12]">{errors.tag}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="stone" className="text-[10px] uppercase tracking-widest font-semibold text-[#78716C]">
                Gema / Piedra
              </label>
              <input
                id="stone"
                type="text"
                value={stone}
                onChange={(e) => setStone(e.target.value)}
                disabled={loading}
                className="w-full bg-[#f5f3f0] border border-[#78716C]/20 px-3 py-2 text-xs outline-none focus:border-[#1C1917] transition-colors rounded-none"
                placeholder="Ej. Cuarzo Claro"
              />
              {errors.stone && <span className="text-[10px] text-[#7C0A12]">{errors.stone}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="intention" className="text-[10px] uppercase tracking-widest font-semibold text-[#78716C]">
                Intención
              </label>
              <input
                id="intention"
                type="text"
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                disabled={loading}
                className="w-full bg-[#f5f3f0] border border-[#78716C]/20 px-3 py-2 text-xs outline-none focus:border-[#1C1917] transition-colors rounded-none"
                placeholder="Ej. Claridad"
              />
              {errors.intention && <span className="text-[10px] text-[#7C0A12]">{errors.intention}</span>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-[10px] uppercase tracking-widest font-semibold text-[#78716C]">
              Descripción
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              className="w-full bg-[#f5f3f0] border border-[#78716C]/20 px-3 py-2 text-xs outline-none focus:border-[#1C1917] transition-colors rounded-none resize-none font-sans"
              placeholder="Describe los detalles de la pieza, materiales..."
            />
            {errors.description && <span className="text-[10px] text-[#7C0A12]">{errors.description}</span>}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input
              id="isFeatured"
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              disabled={loading}
              className="size-4 rounded-none accent-[#7C0A12] cursor-pointer"
            />
            <label htmlFor="isFeatured" className="text-[10px] uppercase tracking-widest font-semibold text-[#78716C] cursor-pointer select-none">
              Destacar producto en la página principal
            </label>
          </div>

          <div className="flex flex-row gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border-[#78716C]/20 text-[#78716C] hover:bg-[#78716C]/5 rounded-none text-[10px] uppercase tracking-wider font-semibold h-11"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#1C1917] hover:bg-[#7C0A12] text-white rounded-none text-[10px] uppercase tracking-wider font-semibold h-11"
            >
              {loading ? "Guardando..." : "Guardar Producto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
