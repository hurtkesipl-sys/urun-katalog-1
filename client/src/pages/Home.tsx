import { useState } from "react";
import { useProductStore } from "@/store";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { products, categories } = useProductStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-12">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Yeni Koleksiyon
          </h1>
          <p className="text-muted-foreground text-lg">
            Özenle seçilmiş, minimalist ve işlevsel tasarımlar. İskandinav sadeliğini yaşam alanlarınıza taşıyın.
          </p>
        </div>

        {products.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className="rounded-full"
            >
              Tümü
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-border rounded-lg bg-card/50">
            <p className="text-muted-foreground text-lg">Henüz ürün eklenmemiş.</p>
            <p className="text-sm text-muted-foreground mt-2">Yönetim panelinden yeni ürünler ekleyebilirsiniz.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
