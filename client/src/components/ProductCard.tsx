import { Product } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Heart, Edit, PlayCircle } from "lucide-react";
import { SiWhatsapp } from "@icons-pack/react-simple-icons";
import { Link, useLocation } from "wouter";
import { useProductStore } from "@/store";
import { getWhatsAppLink } from "@/lib/whatsapp";

interface ProductCardProps {
  product: Product;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export default function ProductCard({ product, isAdmin, onDelete, onEdit }: ProductCardProps) {
  const { favorites, toggleFavorite, contactInfo } = useProductStore();
  const [, setLocation] = useLocation();
  const isFavorite = favorites.includes(product.productCode);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.productCode);
  };

  const cardContent = (
    <Card 
      className="overflow-hidden group border-border/50 hover:border-border transition-all duration-300 hover:shadow-md bg-card h-full flex flex-col cursor-pointer relative"
      onClick={() => setLocation(`/product/${product.id}`)}
    >
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
        {product.videoUrl && (
          <div className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur-sm rounded-full z-10">
            <PlayCircle className="w-6 h-6 text-red-600 fill-red-600/20" />
          </div>
        )}
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
      <CardContent className="p-1 md:p-2 flex-1 flex flex-col justify-between">
        <div className="hidden md:flex items-center justify-between mb-0.5">
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
        <h3 className="font-serif text-sm md:text-base font-semibold mb-0 line-clamp-2 leading-tight">{product.name}</h3>
        <div className="flex flex-col mt-auto" translate="no">
          <span className="text-sm md:text-base font-medium text-foreground leading-none">
            ₺{product.priceTRY.toFixed(2)}
          </span>
          <span className="text-[10px] md:text-xs text-muted-foreground mt-0">
            €{product.priceEUR.toFixed(2)}
          </span>
        </div>
        
        {/* Stok Sor Butonu */}
        <div className="mt-3 pt-2 border-t border-border/50">
          <a 
            href={getWhatsAppLink(
              contactInfo.whatsappNumber, 
              encodeURIComponent(`Merhaba, bu ürünün stoğunu sormak istiyorum:\n\nÜrün Adı: ${product.name}\nÜrün Kodu: ${product.productCode}\nRenk: ${product.colorCode}\nFiyat: ₺${product.priceTRY.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\nÜrün Linki: ${window.location.origin}/product/${product.id}`)
            )}
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1.5 w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] py-1.5 px-2 rounded transition-colors font-medium text-xs"
          >
            <SiWhatsapp className="w-3.5 h-3.5" />
            Stok Sor
          </a>
        </div>
      </CardContent>
    </Card>
  );

  return cardContent;
}
