import { Product } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ProductCardProps {
  product: Product;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
}

export default function ProductCard({ product, isAdmin, onDelete }: ProductCardProps) {
  return (
    <Card className="overflow-hidden group border-border/50 hover:border-border transition-all duration-300 hover:shadow-md bg-card">
      <div className="aspect-square overflow-hidden bg-muted relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        {isAdmin && onDelete && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onDelete(product.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <CardContent className="p-5">
        <h3 className="font-serif text-lg font-semibold mb-2 line-clamp-1">{product.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {product.description}
        </p>
      </CardContent>
      <CardFooter className="p-5 pt-0 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-lg font-medium text-foreground">
            €{product.priceEUR.toFixed(2)}
          </span>
          <span className="text-sm text-muted-foreground">
            ₺{product.priceTRY.toFixed(2)}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
