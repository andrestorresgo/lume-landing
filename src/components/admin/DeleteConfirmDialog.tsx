import * as React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  productName: string;
}

export default function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  productName,
}: DeleteConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error("Failed to delete product:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#fbf9f6] border border-[#78716C]/20 p-8 max-w-sm rounded-none text-[#1C1917] font-sans">
        <DialogHeader className="gap-2 mb-4">
          <DialogTitle className="font-heading text-xl font-medium tracking-tight text-center">
            ¿Eliminar producto?
          </DialogTitle>
          <DialogDescription className="text-xs text-[#78716C] text-center font-light leading-relaxed">
            ¿Estás seguro de que deseas eliminar el producto{" "}
            <span className="font-semibold text-[#1C1917]">"{productName}"</span>? 
            Esta acción no se puede deshacer y lo removerá permanentemente de la tienda.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-row gap-2 mt-4 sm:justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1 border-[#78716C]/20 text-[#78716C] hover:bg-[#78716C]/5 rounded-none text-[10px] uppercase tracking-wider font-semibold h-10"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 bg-[#7C0A12] hover:bg-[#560006] text-white rounded-none text-[10px] uppercase tracking-wider font-semibold h-10"
          >
            {loading ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
