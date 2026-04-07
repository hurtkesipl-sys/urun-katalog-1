import { useState, useEffect } from "react";
import { useProductStore } from "@/store";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

import { useLocation } from "wouter";

export default function Home() {
  const { products, mainCategories, subCategories, banners } = useProductStore();
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);

  // URL parametrelerini oku
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const fabric = searchParams.get("fabric");
    const category = searchParams.get("category");
    
    if (fabric) {
      setSelectedMainCategory(fabric);
      setSelectedSubCategory(null);
    } else if (category) {
      setSelectedSubCategory(category);
      setSelectedMainCategory(null);
    } else {
      setSelectedMainCategory(null);
      setSelectedSubCategory(null);
    }
  }, [window.location.search]);

  const filteredProducts = products.filter((p) => {
    const matchMain = selectedMainCategory ? p.mainCategory === selectedMainCategory : true;
    const matchSub = selectedSubCategory ? p.subCategory === selectedSubCategory : true;
    return matchMain && matchSub;
  });

  // Ürünleri productCode'a göre gruplandır
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    if (!acc[product.productCode]) {
      acc[product.productCode] = [];
    }
    acc[product.productCode].push(product);
    return acc;
  }, {} as Record<string, typeof products>);

  // Her gruptan ilk ürünü al ve renk varyantlarını ekle
  const displayProducts = Object.values(groupedProducts).map(group => {
    const mainProduct = group[0];
    const colors = group.map(p => p.colorCode).filter(Boolean);
    return {
      ...mainProduct,
      colors: Array.from(new Set(colors)) // Benzersiz renkleri al
    };
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      {/* Kayan Banner Alanı */}
      {banners.length > 0 && (
        <div className="w-full mt-4 mb-8 overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {banners.map((banner) => (
              <div key={banner.id} className="flex-[0_0_100%] min-w-0 relative h-[400px] md:h-[500px]">
                <img 
                  src={banner.imageUrl} 
                  alt={banner.title || "Banner"} 
                  className="w-full h-full object-cover"
                />
                {banner.title && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <h2 className="text-white font-serif text-4xl md:text-6xl font-bold text-center px-4 drop-shadow-lg">
                      {banner.title}
                    </h2>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <main className="flex-1 container py-8">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Toptan Giyim Koleksiyonu</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            İtalya'dan özenle seçilmiş, yüksek kaliteli kumaşlarla üretilen toptan giyim ürünleri.
          </p>
        </div>

        {products.length > 0 && (
          <div className="flex flex-col items-center gap-4 mb-12">
            <div className="flex flex-wrap justify-center gap-2 px-4">
              <Button 
                variant={selectedMainCategory === null ? "default" : "outline"}
                onClick={() => setSelectedMainCategory(null)}
                className="rounded-full text-xs md:text-sm h-8 md:h-10"
              >
                Tümü
              </Button>
              {mainCategories.map(category => (
                <Button
                  key={category}
                  variant={selectedMainCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedMainCategory(category)}
                  className="rounded-full text-xs md:text-sm h-8 md:h-10"
                >
                  {category}
                </Button>
              ))}
            </div>
            
            {selectedMainCategory && (
              <div className="flex flex-wrap justify-center gap-2 mt-2 px-4">
                <Button 
                  variant={selectedSubCategory === null ? "secondary" : "outline"}
                  onClick={() => setSelectedSubCategory(null)}
                  size="sm"
                  className="rounded-full text-xs md:text-sm h-7 md:h-9"
                >
                  Tüm {selectedMainCategory}
                </Button>
                {subCategories.map(category => (
                  <Button
                    key={category}
                    variant={selectedSubCategory === category ? "secondary" : "outline"}
                    onClick={() => setSelectedSubCategory(category)}
                    size="sm"
                    className="rounded-full text-xs md:text-sm h-7 md:h-9"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 px-2 md:px-0">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Bu kategoride ürün bulunamadı.</p>
          </div>
        )}
      </main>
    </div>
  );
}
