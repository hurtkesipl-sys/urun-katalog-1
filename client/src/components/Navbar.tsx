import { useState } from "react";
import { Link } from "wouter";
import { useProductStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Heart, Menu, X } from "lucide-react";

export default function Navbar() {
  const { isAdmin, setAdmin, favorites } = useProductStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex flex-col items-center py-4 relative">
        {/* Üst Kısım: Logo ve Sağ Üst Menü */}
        <div className="w-full flex justify-between items-center mb-4">
          {/* Mobil Menü Butonu (Sadece mobilde görünür) */}
          <div className="w-24 flex md:hidden">
            <button onClick={toggleMobileMenu} className="p-2 -ml-2 text-foreground">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          
          {/* Sol boşluk dengeleyici (Sadece masaüstünde görünür) */}
          <div className="w-24 hidden md:block"></div>
          
          {/* Logo ve İtalyan Bayrağı */}
          <div className="flex flex-col items-center">
            <Link href="/" className="flex items-center gap-2 mb-1">
              <span className="font-serif text-3xl font-bold tracking-tight">Moda İtalya</span>
              <span className="text-muted-foreground text-sm font-medium mt-2">Toptan</span>
            </Link>
            {/* İtalyan Bayrağı Çizgisi */}
            <div className="flex w-16 h-1 rounded-full overflow-hidden">
              <div className="w-1/3 bg-green-600"></div>
              <div className="w-1/3 bg-white border-y border-gray-200"></div>
              <div className="w-1/3 bg-red-600"></div>
            </div>
          </div>

          {/* Sağ Üst Menü (Favoriler ve Admin) */}
          <div className="flex items-center gap-4 w-24 justify-end">
            <Link href="/favorites" className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Heart className="w-6 h-6" />
              {favorites.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>
            
            {isAdmin ? (
              <div className="flex flex-col items-end gap-1">
                <Link href="/admin" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Yönetim
                </Link>
                <button 
                  onClick={() => setAdmin(false)}
                  className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
                >
                  Çıkış
                </button>
              </div>
            ) : (
              <Link href="/login" className="text-xs font-medium text-muted-foreground opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity">
                Admin
              </Link>
            )}
          </div>
        </div>

        {/* Alt Kısım: İki Satırlı Menü (Masaüstü) */}
        <div className="w-full hidden md:flex flex-col items-center gap-2">
          {/* Üst Menü: Ürün Tipleri */}
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium tracking-wide">
            <Link href="/?filter=yenilik" className="hover:text-primary transition-colors">YENİLİK</Link>
            <Link href="/?filter=en-iyi-satanlar" className="hover:text-primary transition-colors">EN İYİ SATANLAR</Link>
            <Link href="/?category=Elbise" className="hover:text-primary transition-colors">ELBİSE</Link>
            <Link href="/?category=Takım" className="hover:text-primary transition-colors">TAKIM</Link>
            <Link href="/?category=Bluz" className="hover:text-primary transition-colors">BLUZ</Link>
            <Link href="/?category=Gömlek" className="hover:text-primary transition-colors">GÖMLEK</Link>
            <Link href="/?category=Pantolon" className="hover:text-primary transition-colors">PANTOLON</Link>
            <Link href="/?category=Etek" className="hover:text-primary transition-colors">ETEK</Link>
          </div>
          
          {/* İnce Ayırıcı Çizgi */}
          <div className="w-full max-w-3xl h-px bg-border/50 my-1"></div>
          
          {/* Alt Menü: Kumaş Tipleri */}
          <div className="flex flex-wrap justify-center gap-8 text-xs font-medium text-muted-foreground tracking-wider">
            <Link href="/?fabric=Keten" className="hover:text-foreground transition-colors">KETEN</Link>
            <Link href="/?fabric=İpek" className="hover:text-foreground transition-colors">İPEK</Link>
            <Link href="/?fabric=Pamuk" className="hover:text-foreground transition-colors">PAMUK</Link>
            <Link href="/?fabric=Viskon" className="hover:text-foreground transition-colors">VİSKON</Link>
          </div>
        </div>

        {/* Mobil Menü (Açılır Kapanır) */}
        {isMobileMenuOpen && (
          <div className="w-full md:hidden flex flex-col items-center gap-4 pt-4 pb-2 border-t border-border mt-2 animate-in slide-in-from-top-2">
            <div className="flex flex-col items-center gap-3 text-sm font-medium w-full">
              <Link href="/?filter=yenilik" onClick={toggleMobileMenu} className="w-full text-center py-2 hover:bg-muted transition-colors">YENİLİK</Link>
              <Link href="/?filter=en-iyi-satanlar" onClick={toggleMobileMenu} className="w-full text-center py-2 hover:bg-muted transition-colors">EN İYİ SATANLAR</Link>
              <div className="w-1/2 h-px bg-border/50 my-1"></div>
              <Link href="/?category=Elbise" onClick={toggleMobileMenu} className="w-full text-center py-2 hover:bg-muted transition-colors">ELBİSE</Link>
              <Link href="/?category=Takım" onClick={toggleMobileMenu} className="w-full text-center py-2 hover:bg-muted transition-colors">TAKIM</Link>
              <Link href="/?category=Bluz" onClick={toggleMobileMenu} className="w-full text-center py-2 hover:bg-muted transition-colors">BLUZ</Link>
              <Link href="/?category=Gömlek" onClick={toggleMobileMenu} className="w-full text-center py-2 hover:bg-muted transition-colors">GÖMLEK</Link>
              <Link href="/?category=Pantolon" onClick={toggleMobileMenu} className="w-full text-center py-2 hover:bg-muted transition-colors">PANTOLON</Link>
              <Link href="/?category=Etek" onClick={toggleMobileMenu} className="w-full text-center py-2 hover:bg-muted transition-colors">ETEK</Link>
              <div className="w-1/2 h-px bg-border/50 my-1"></div>
              <div className="flex justify-center gap-6 text-xs text-muted-foreground w-full py-2">
                <Link href="/?fabric=Keten" onClick={toggleMobileMenu}>KETEN</Link>
                <Link href="/?fabric=İpek" onClick={toggleMobileMenu}>İPEK</Link>
                <Link href="/?fabric=Pamuk" onClick={toggleMobileMenu}>PAMUK</Link>
                <Link href="/?fabric=Viskon" onClick={toggleMobileMenu}>VİSKON</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
