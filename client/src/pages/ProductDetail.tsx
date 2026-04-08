import { useState } from "react";
import { useProductStore } from "@/store";
import { useRoute, Link } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ZoomIn, X, Send, PlayCircle } from "lucide-react";
import { SiWhatsapp } from "@icons-pack/react-simple-icons";
import { getWhatsAppLink } from "@/lib/whatsapp";

export default function ProductDetail() {
  const [match, params] = useRoute("/product/:id");
  const [isZoomed, setIsZoomed] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { products, contactInfo } = useProductStore();
  
  const product = match ? products.find(p => p.id === params.id) : null;
  
  // Aynı ürün koduna sahip diğer renk varyantlarını bul
  const colorVariants = product 
    ? products.filter(p => p.productCode === product.productCode)
    : [];

  // Tüm görselleri birleştir (ana görsel + ek görseller)
  const allImages = product ? [product.imageUrl, ...(product.imageUrls || [])] : [];

  const getMessageText = () => {
    if (!product) return "";
    // iOS cihazlarda WhatsApp'ın görsel linkini önizlemeye çevirirken metni yutmasını engellemek için
    // görsel linkini tamamen çıkarıp yerine ürünün web sayfasının linkini ekliyoruz.
    const productUrl = `${window.location.origin}/product/${product.id}`;
    return encodeURIComponent(`Merhaba, bu ürünün stoğunu sormak istiyorum:\n\nÜrün Adı: ${product.name}\nÜrün Kodu: ${product.productCode}\nRenk: ${product.colorCode}\nFiyat: ₺${product.priceTRY.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\nÜrün Linki: ${productUrl}`);
  };

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
      <main className="flex-1 container py-6 md:py-12">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 md:mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kataloğa Dön
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Sol Taraf: Resim Galerisi */}
          <div className="relative flex flex-col items-center justify-start gap-4">
            {/* Ana Büyük Görsel */}
            <div 
              className="aspect-[3/4] relative w-full max-w-md cursor-zoom-in overflow-hidden rounded-xl group"
              onClick={() => setIsZoomed(true)}
            >
              <img 
                src={allImages[activeImageIndex]} 
                alt={`${product.name} - Görsel ${activeImageIndex + 1}`} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="bg-background/80 backdrop-blur-sm p-3 rounded-full text-foreground">
                  <ZoomIn className="w-6 h-6" />
                </div>
              </div>
            </div>
            
            {/* Küçük Görseller (Thumbnails) */}
            {allImages.length > 1 && (
              <div className="flex gap-3 w-full max-w-md overflow-x-auto pb-2 snap-x">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative w-20 h-28 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all snap-center ${
                      activeImageIndex === index 
                        ? 'border-primary ring-2 ring-primary/20 scale-105' 
                        : 'border-transparent hover:border-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`${product.name} küçük görsel ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
            
            {product.videoUrl && (
              <Button 
                variant="outline" 
                className="w-full max-w-md flex items-center justify-center gap-2 border-red-200 hover:bg-red-50 hover:text-red-600 text-red-500 mt-2"
                onClick={() => setIsVideoModalOpen(true)}
              >
                <PlayCircle className="w-5 h-5" />
                Ürün Videosunu İzle
              </Button>
            )}
          </div>

          {/* Tam Ekran Resim Modalı */}
          {isZoomed && (
            <div 
              className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
              onClick={() => setIsZoomed(false)}
            >
              <button 
                className="absolute top-4 right-4 p-2 bg-background/50 hover:bg-background rounded-full transition-colors z-[101]"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsZoomed(false);
                }}
              >
                <X className="w-6 h-6" />
              </button>
              <div 
                className="relative w-full h-full max-w-5xl max-h-[90vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <img 
                  src={allImages[activeImageIndex]} 
                  alt={product.name} 
                  className="max-w-full max-h-full object-contain rounded-md"
                />
                
                {/* Tam ekran modunda önceki/sonraki görsel butonları */}
                {allImages.length > 1 && (
                  <>
                    <button 
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-background/50 hover:bg-background rounded-full transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
                      }}
                    >
                      <ArrowLeft className="w-6 h-6" />
                    </button>
                    <button 
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-background/50 hover:bg-background rounded-full transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
                      }}
                    >
                      <ArrowLeft className="w-6 h-6 rotate-180" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Video Modalı */}
          {isVideoModalOpen && product.videoUrl && (
            <div 
              className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
              onClick={() => setIsVideoModalOpen(false)}
            >
              <button 
                className="absolute top-4 right-4 p-2 bg-background/50 hover:bg-background rounded-full transition-colors z-[101]"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsVideoModalOpen(false);
                }}
              >
                <X className="w-6 h-6" />
              </button>
              <div 
                className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {product.videoUrl.includes('youtube.com') || product.videoUrl.includes('youtu.be') ? (
                  <iframe 
                    src={product.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')} 
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                ) : product.videoUrl.includes('vimeo.com') ? (
                  <iframe 
                    src={product.videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')} 
                    className="w-full h-full border-0"
                    allow="autoplay; fullscreen; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video 
                    src={product.videoUrl} 
                    controls 
                    autoPlay 
                    className="w-full h-full object-contain"
                  >
                    Tarayıcınız video etiketini desteklemiyor.
                  </video>
                )}
              </div>
            </div>
          )}

          {/* Sağ Taraf: Detaylar */}
          <div className="flex flex-col space-y-6 md:space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                  {product.mainCategory}
                </span>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {product.subCategory}
                </span>
              </div>
              <h1 className="font-serif text-2xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3" translate="no">
                <span className="text-xl md:text-2xl font-bold text-primary">
                  ₺{product.priceTRY.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-base md:text-lg text-muted-foreground">
                  (€{product.priceEUR.toFixed(2)})
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b border-border pb-2">Ürün Açıklaması</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description || "Bu ürün için henüz bir açıklama girilmemiş."}
              </p>
            </div>

            {colorVariants.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-border pb-2">Renk Seçenekleri</h3>
                <div className="flex flex-wrap gap-3">
                  {colorVariants.map((variant) => (
                    <Link key={variant.id} href={`/product/${variant.id}`}>
                      <div 
                        className={`w-12 h-16 rounded-md overflow-hidden border-2 shadow-sm cursor-pointer hover:scale-105 transition-transform ${
                          variant.id === product.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                        }`}
                        title={variant.colorCode || variant.name}
                      >
                        <img src={variant.imageUrl} alt={variant.colorCode || variant.name} className="w-full h-full object-cover" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Masaüstü Stok Sor Butonu */}
            <div className="hidden md:block pt-6 border-t border-border">
              <h3 className="text-lg font-semibold mb-4">Bu Ürünle İlgileniyor Musunuz?</h3>
              <a 
                href={getWhatsAppLink(contactInfo.whatsappNumber, getMessageText())}
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white py-3 px-6 rounded-md transition-colors font-medium text-base w-full sm:w-auto cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                <SiWhatsapp className="w-5 h-5" />
                WhatsApp'tan Stok Sor
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Mobil Alt Bar (Stok Sor) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-50 flex items-center justify-between gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <span className="font-semibold text-sm whitespace-nowrap">Stok Sor:</span>
        <div className="flex gap-2 flex-1">
          <a 
            href={getWhatsAppLink(contactInfo.whatsappNumber, getMessageText())}
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white py-2.5 px-4 rounded-md transition-colors font-medium text-sm"
          >
            <SiWhatsapp className="w-4 h-4" />
            WhatsApp
          </a>
        </div>
      </div>
      
      {/* Mobilde alt barın içeriği kapatmaması için boşluk */}
      <div className="h-20 md:hidden"></div>
    </div>
  );
}
