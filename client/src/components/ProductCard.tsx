import { Product } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Heart, Edit } from "lucide-react";
import { Link } from "wouter";
import { useProductStore } from "@/store";

interface ProductCardProps {
  product: Product;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export default function ProductCard({ product, isAdmin, onDelete, onEdit }: ProductCardProps) {
  const { favorites, toggleFavorite } = useProductStore();
  const isFavorite = favorites.includes(product.productCode);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.productCode);
  };

  const cardContent = (
    <Card className="overflow-hidden group border-border/50 hover:border-border transition-all duration-300 hover:shadow-md bg-card h-full flex flex-col cursor-pointer relative">
      <div className="aspect-[3/4] overflow-hidden bg-muted relative flex items-center justify-center">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <button 
          onClick={handleFavoriteClick}
          className="absolute top-2 left-2 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors z-10"
        >
          <Heart 
            className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-foreground'}`} 
          />
        </button>
        {isAdmin && (
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            {onEdit && (
              <Button
                variant="secondary"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit(product.id);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(product.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
      <CardContent className="p-1.5 md:p-3 flex-1 flex flex-col justify-between">
        <div className="hidden md:flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
              {product.mainCategory}
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {product.subCategory}
            </span>
          </div>
          {product.colorCode && (
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full overflow-hidden border border-border">
                <img src={product.imageUrl} alt={product.colorCode} className="w-full h-full object-cover" />
              </div>
              <span className="text-[10px] text-muted-foreground">{product.colorCode}</span>
            </div>
          )}
        </div>
        <h3 className="font-serif text-sm md:text-base font-semibold mb-0.5 line-clamp-2 leading-tight">{product.name}</h3>
        <p className="hidden md:block text-xs text-muted-foreground line-clamp-1 mb-1">
          {product.description}
        </p>
        <div className="flex flex-col mt-auto">
          <span className="text-sm md:text-base font-medium text-foreground leading-none">
            €{product.priceEUR.toFixed(2)}
          </span>
          <span className="text-[10px] md:text-xs text-muted-foreground mt-0.5">
            ₺{product.priceTRY.toFixed(2)}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Link href={`/product/${product.id}`}>
      {cardContent}
    </Link>
  );
}
