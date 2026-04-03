import { useState } from "react";
import { useProductStore } from "@/store";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { products, mainCategories, subCategories } = useProductStore();
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

  const filteredProducts = products.filter((p) => {
    const matchMain = selectedMainCategory ? p.mainCategory === selectedMainCategory : true;
    const matchSub = selectedSubCategory ? p.subCategory === selectedSubCategory : true;
    return matchMain && matchSub;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-12">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Toptan Giyim Koleksiyonu
          </h1>
          <p className="text-muted-foreground text-lg">
            İtalya'dan özenle seçilmiş, yüksek kaliteli kumaşlarla üretilen toptan giyim ürünleri.
          </p>
        </div>

        {products.length > 0 && (
          <div className="flex flex-col items-center gap-4 mb-12">
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant={selectedMainCategory === null ? "default" : "outline"}
                onClick={() => setSelectedMainCategory(null)}
                className="rounded-full"
              >
                Tüm Kumaşlar
              </Button>
              {mainCategories.map((category) => (
                <Button
                  key={category}
                  variant={selectedMainCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedMainCategory(category)}
                  className="rounded-full"
                >
                  {category}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant={selectedSubCategory === null ? "default" : "outline"}
                onClick={() => setSelectedSubCategory(null)}
                className="rounded-full"
                size="sm"
              >
                Tüm Ürünler
              </Button>
              {subCategories.map((category) => (
                <Button
                  key={category}
                  variant={selectedSubCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedSubCategory(category)}
                  className="rounded-full"
                  size="sm"
                >
                  {category}
                </Button>
              ))}
            </div>
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
