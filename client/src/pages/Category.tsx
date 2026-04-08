import { useProductStore } from "@/store";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { useRoute } from "wouter";

export default function Category() {
  const { products } = useProductStore();
  const [match, params] = useRoute("/category/:id");
  
  const categoryId = params?.id;
  
  // Kategori adına göre filtreleme (büyük/küçük harf duyarsız)
  const filteredProducts = products.filter((p) => {
    if (!categoryId) return false;
    
    const searchCategory = categoryId.toLowerCase();
    
    // Yeniler ve En İyi Satanlar özel filtreleri
    if (searchCategory === "yeniler") {
      // Son 7 gün içinde eklenen ürünler (örnek mantık)
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return p.createdAt > oneWeekAgo;
    }
    
    if (searchCategory === "en-iyi-satanlar") {
      // Örnek mantık: Tüm ürünleri göster (gerçekte satış verisine göre filtrelenmeli)
      return true;
    }
    
    // Normal kategori filtrelemesi
    return p.subCategory.toLowerCase() === searchCategory || 
           p.mainCategory.toLowerCase() === searchCategory;
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

  // Kategori başlığını formatla
  const formatCategoryTitle = (id: string) => {
    if (id === "yeniler") return "Yeniler";
    if (id === "en-iyi-satanlar") return "En İyi Satanlar";
    return id.charAt(0).toUpperCase() + id.slice(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            {categoryId ? formatCategoryTitle(categoryId) : "Kategori"}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            İtalya'dan özenle seçilmiş, yüksek kaliteli {categoryId ? formatCategoryTitle(categoryId).toLowerCase() : "giyim"} koleksiyonu.
          </p>
        </div>

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
