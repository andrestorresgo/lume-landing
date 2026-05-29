import * as React from "react"
import { Minus, Plus, Trash } from "@phosphor-icons/react"

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

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartItemRowProps {
  item: CartItem;
  placeholderImage: string;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
}

const CartItemRow = React.memo(function CartItemRow({
  item,
  placeholderImage,
  onUpdateQuantity,
  onRemove
}: CartItemRowProps) {
  const [isRemoving, setIsRemoving] = React.useState(false);

  const handleDecrease = React.useCallback(() => {
    onUpdateQuantity(item.product.id, -1);
  }, [onUpdateQuantity, item.product.id]);

  const handleIncrease = React.useCallback(() => {
    onUpdateQuantity(item.product.id, 1);
  }, [onUpdateQuantity, item.product.id]);

  const handleRemove = React.useCallback(() => {
    setIsRemoving(true);
  }, []);

  const handleAnimationEnd = React.useCallback((e: React.AnimationEvent<HTMLDivElement>) => {
    // Only trigger removal if the exit animation itself finished
    if (isRemoving && e.animationName === 'row-exit') {
      onRemove(item.product.id);
    }
  }, [isRemoving, onRemove, item.product.id]);

  return (
    <div 
      onAnimationEnd={handleAnimationEnd}
      className={`flex gap-4 items-center pb-6 border-b border-[#78716C]/10 ${isRemoving ? 'animate-row-exit' : 'animate-row-enter'}`}
    >
      <div className="size-20 bg-[#efeeeb] overflow-hidden border border-[#78716C]/10 shrink-0">
        <img 
          src={placeholderImage} 
          alt={item.product.name} 
          className="w-full h-full object-cover grayscale opacity-90 transition-transform duration-500 hover:scale-105"
        />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <span className="font-heading text-base text-[#1C1917] truncate">{item.product.name}</span>
        <span className="text-xs text-[#78716C] mt-0.5 truncate">{item.product.description}</span>
        
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center border border-[#78716C]/30 bg-[#fbf9f6]">
            <button 
              onClick={handleDecrease}
              className="px-2 py-1 text-[#1C1917] hover:bg-[#efeeeb] transition-[transform,background-color] duration-150 active:scale-75 flex items-center justify-center"
              aria-label="Disminuir cantidad"
            >
              <Minus size={12} />
            </button>
            <span key={item.quantity} className="px-3 text-xs font-semibold text-[#1C1917] inline-block animate-qty-bump">
              {item.quantity}
            </span>
            <button 
              onClick={handleIncrease}
              className="px-2 py-1 text-[#1C1917] hover:bg-[#efeeeb] transition-[transform,background-color] duration-150 active:scale-75 flex items-center justify-center"
              aria-label="Aumentar cantidad"
            >
              <Plus size={12} />
            </button>
          </div>
          <button 
            onClick={handleRemove}
            className="text-[#78716C] hover:text-[#7C0A12] trash-button ml-auto"
            aria-label="Eliminar producto"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>
      <div className="text-right shrink-0">
        <span key={item.quantity * item.product.price} className="font-heading text-sm font-semibold text-[#1C1917] inline-block animate-qty-bump">
          ${item.product.price * item.quantity}
        </span>
        {item.quantity > 1 ? (
          <span className="block text-[10px] text-[#78716C] mt-0.5">${item.product.price} c/u</span>
        ) : null}
      </div>
    </div>
  );
});

export default CartItemRow;
