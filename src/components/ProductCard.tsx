import * as React from "react"
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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

interface ProductCardProps {
  product: Product;
  placeholderImage: string;
  onAddToCart: (product: Product) => void;
}

const ProductCard = React.memo(function ProductCard({ 
  product, 
  placeholderImage, 
  onAddToCart 
}: ProductCardProps) {
  const handleAdd = React.useCallback(() => {
    onAddToCart(product);
  }, [onAddToCart, product]);

  return (
    <Card className="group border-0 bg-transparent flex flex-col relative overflow-hidden ring-0 shadow-none gap-0">
      <div className="relative overflow-hidden aspect-[3/4] bg-[#efeeeb] mb-4 border border-[#78716C]/15 card-image-container">
        {/* Image Layer */}
        <img 
          src={placeholderImage} 
          alt={product.name} 
          className="w-full h-full object-cover card-image"
          loading="lazy"
        />
        
        {/* Overlay background for storytelling depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Tag Badge */}
        {product.tag ? (
          <div className="absolute top-4 left-4 z-20">
            <Badge className="bg-[#fbf9f6] text-[#1C1917] hover:bg-[#fbf9f6] border border-[#78716C]/20 px-3 py-1 font-semibold text-[10px] uppercase tracking-widest">
              {product.tag}
            </Badge>
          </div>
        ) : null}

        {/* Quick Add Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-4 quick-add-container z-20">
          <Button 
            onClick={handleAdd}
            className="w-full bg-[#1C1917] hover:bg-[#7C0A12] text-white py-5 text-[10px] uppercase tracking-wider font-semibold rounded-none quick-add-button"
          >
            Agregar a Bolsa - ${product.price}
          </Button>
        </div>
      </div>

      <CardHeader className="p-0 gap-1 flex flex-row items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <CardTitle className="font-heading text-lg text-[#1C1917] font-medium leading-tight card-title-link">
            {product.name}
          </CardTitle>
          <CardDescription className="text-xs text-[#78716C] font-light">
            {product.description}
          </CardDescription>
        </div>
        <span className="font-heading text-base font-semibold text-[#1C1917] shrink-0 mt-0.5">
          ${product.price}
        </span>
      </CardHeader>
    </Card>
  );
});

export default ProductCard;
