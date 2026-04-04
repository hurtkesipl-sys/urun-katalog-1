import { useProductStore } from "@/store";
import { useRoute, Link } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ProductDetail() {
  const [match, params] = useRoute("/product/:id");
  const { products } = useProductStore();
  
  const product = match ? products.find(p => p.id === params.id) : null;

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container py-12 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Ürün bulunamadı</h1>
          <Link href="/">
            <Button variant="outline">Kataloğa Dön</Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-12">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kataloğa Dön
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Sol Taraf: Resim */}
          <div className="rounded-xl overflow-hidden border border-border bg-card shadow-sm">
            <div className="aspect-[4/5] relative">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Sağ Taraf: Detaylar */}
          <div className="flex flex-col space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                  {product.mainCategory}
                </span>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {product.subCategory}
                </span>
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-primary">
                  €{product.priceEUR.toFixed(2)}
                </span>
                <span className="text-lg text-muted-foreground">
                  (₺{product.priceTRY.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b border-border pb-2">Ürün Açıklaması</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description || "Bu ürün için henüz bir açıklama girilmemiş."}
              </p>
            </div>

            {product.colors && product.colors.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-border pb-2">Renk Seçenekleri</h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color, index) => (
                    <div 
                      key={index}
                      className="w-10 h-10 rounded-full border-2 border-border shadow-sm cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
