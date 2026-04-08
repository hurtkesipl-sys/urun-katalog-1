import { useProductStore } from "@/hooks/useStore";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export default function Favorites() {
  const { products, favorites } = useProductStore();

  // Favori ürünleri filtrele (ürün koduna göre gruplandırılmış)
  const favoriteProducts = products.filter(p => favorites.includes(p.productCode));

  // Benzersiz ürün kodlarına göre gruplandır
  const groupedFavorites = favoriteProducts.reduce((acc, product) => {
    if (!acc[product.productCode]) {
      acc[product.productCode] = [];
    }
    acc[product.productCode].push(product);
    return acc;
  }, {} as Record<string, typeof products>);

  // Her gruptan ilk ürünü al ve renkleri ekle
  const displayFavorites = Object.values(groupedFavorites).map(group => {
    const mainProduct = group[0];
    const colors = group.map(p => p.colorCode);
    return {
      ...mainProduct,
      colors: Array.from(new Set(colors))
    };
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-12">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          <h1 className="font-serif text-3xl font-bold">Favorilerim</h1>
        </div>

        {displayFavorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayFavorites.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-serif font-semibold mb-2">Henüz favori ürününüz yok</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Beğendiğiniz ürünleri favorilerinize ekleyerek daha sonra kolayca bulabilirsiniz.
            </p>
            <Link href="/">
              <Button size="lg">Alışverişe Başla</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
