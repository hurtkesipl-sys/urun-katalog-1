import { useProductStore } from "@/store";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";

export default function Home() {
  const { products } = useProductStore();

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

        {products.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-border rounded-lg bg-card/50">
            <p className="text-muted-foreground text-lg">Henüz ürün eklenmemiş.</p>
            <p className="text-sm text-muted-foreground mt-2">Yönetim panelinden yeni ürünler ekleyebilirsiniz.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
