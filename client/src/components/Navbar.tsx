import { useState, useEffect, useRef } from "react";
import { useProductStore } from "@/hooks/useStore";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { Menu, X, Instagram, Send, Facebook, Heart } from "lucide-react";
import { SiWhatsapp } from "@icons-pack/react-simple-icons";
import { getWhatsAppLink } from "@/lib/whatsapp";

export default function Navbar() {
  const { favorites, contactInfo, subCategories, isTranslationEnabled } = useProductStore();
  const { user, isAuthenticated, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  // Masaüstünde aşağı kaydırınca logo kısmı kaybolur
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const clearGoogTransCookies = () => {
    const h = window.location.hostname;
    const domains = [
      '',
      h,
      '.' + h,
      h.split('.').slice(1).join('.'),
      '.' + h.split('.').slice(1).join('.'),
      h.split('.').slice(2).join('.'),
      '.' + h.split('.').slice(2).join('.'),
    ].filter(Boolean);
    
    domains.forEach(d => {
      const domainPart = d ? `; domain=${d}` : '';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/${domainPart}`;
    });
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
  };

  const setGoogTransCookie = (langCode: string) => {
    const h = window.location.hostname;
    const val = `/tr/${langCode}`;
    const domains = [
      '',
      h,
      '.' + h,
      h.split('.').slice(1).join('.'),
      '.' + h.split('.').slice(1).join('.'),
    ].filter(Boolean);
    
    domains.forEach(d => {
      const domainPart = d ? `; domain=${d}` : '';
      document.cookie = `googtrans=${val}; path=/${domainPart}; SameSite=None; Secure`;
    });
    document.cookie = `googtrans=${val}; path=/; SameSite=None; Secure`;
  };

  const changeLanguage = (langCode: string) => {
    if (langCode === 'tr') {
      clearGoogTransCookies();
    } else {
      clearGoogTransCookies();
      setGoogTransCookie(langCode);
    }
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const lastY = lastScrollYRef.current;

      if (window.innerWidth < 768) {
        // Mobilde: aşağı kaydırınca navbar tamamen gizlenir
        if (currentScrollY > lastY && currentScrollY > 100) {
          setIsVisible(false);
          setIsMobileMenuOpen(false);
        } else {
          setIsVisible(true);
        }
        setIsScrolled(false);
      } else {
        // Masaüstünde: titreme önlemek için histerezis (aşağı 90px, yukarı 60px)
        setIsVisible(true);
        setIsScrolled(prev => {
          if (!prev && currentScrollY > 90) return true;  // Küçül
          if (prev && currentScrollY < 60) return false;  // Büyü
          return prev; // Değiştirme
        });
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []); // Boş bağımlılık — sadece bir kez kaydedilir, ref ile son değeri okur

  return (
    <nav className={`border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="container flex flex-col items-center relative">

        {/* ÜST KISIM: Logo + Sosyal Medya + Diller + Favoriler (Masaüstünde scroll ile kaybolur) */}
        <div
          className={`w-full hidden md:flex justify-between items-center overflow-hidden transition-all duration-300 ease-in-out ${
            isScrolled ? 'max-h-0 opacity-0 py-0 mb-0' : 'max-h-24 opacity-100 py-2 mb-1'
          }`}
        >
          {/* Sol: Sosyal Medya İkonları */}
          <div className="w-28 flex items-center gap-3">
            <a href={contactInfo.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-[#E1306C] hover:opacity-80 transition-opacity" title="Instagram">
              <Instagram className="w-4 h-4" />
            </a>
            <a href={getWhatsAppLink(contactInfo.whatsappNumber)} target="_blank" rel="noopener noreferrer" className="text-[#25D366] hover:opacity-80 transition-opacity" title="WhatsApp">
              <SiWhatsapp className="w-4 h-4" />
            </a>
            <a href={contactInfo.telegramUrl} target="_blank" rel="noopener noreferrer" className="text-[#0088cc] hover:opacity-80 transition-opacity" title="Telegram">
              <Send className="w-4 h-4" />
            </a>
            <a href={contactInfo.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-[#1877F2] hover:opacity-80 transition-opacity" title="Facebook">
              <Facebook className="w-4 h-4" />
            </a>
          </div>

          {/* Orta: Logo */}
          <div className="flex flex-col items-center">
            <Link href="/" className="flex flex-col items-center mb-0.5">
              <span className="font-serif text-2xl font-bold tracking-tight whitespace-nowrap" translate="no">Moda İtalya</span>
              <div className="flex w-full h-1.5 rounded-full overflow-hidden mt-0.5 mb-0.5">
                <div className="w-1/3 bg-green-600"></div>
                <div className="w-1/3 bg-white border-y border-gray-200"></div>
                <div className="w-1/3 bg-red-600"></div>
              </div>
              <span className="text-muted-foreground text-xs font-medium">Toptan</span>
            </Link>
          </div>

          {/* Sağ: Dil Bayrakları + Favoriler + Hakkımızda/İletişim */}
          <div className="w-28 flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              {isTranslationEnabled && (
                <div className="flex items-center gap-1.5 mr-2 relative z-50">
                  <button onClick={() => changeLanguage('tr')} className="w-7 h-7 hover:scale-110 transition-transform cursor-pointer flex items-center justify-center" title="Türkçe">
                    <img src="https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f1f9-1f1f7.svg" alt="Türkçe" className="w-full h-full object-contain drop-shadow-sm" />
                  </button>
                  <button onClick={() => changeLanguage('en')} className="w-7 h-7 hover:scale-110 transition-transform cursor-pointer flex items-center justify-center" title="English">
                    <img src="https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f1ec-1f1e7.svg" alt="English" className="w-full h-full object-contain drop-shadow-sm" />
                  </button>
                  <button onClick={() => changeLanguage('ar')} className="w-7 h-7 hover:scale-110 transition-transform cursor-pointer flex items-center justify-center" title="العربية">
                    <img src="https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f1f8-1f1e6.svg" alt="العربية" className="w-full h-full object-contain drop-shadow-sm" />
                  </button>
                  <button onClick={() => changeLanguage('ru')} className="w-7 h-7 hover:scale-110 transition-transform cursor-pointer flex items-center justify-center" title="Русский">
                    <img src="https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f1f7-1f1fa.svg" alt="Русский" className="w-full h-full object-contain drop-shadow-sm" />
                  </button>
                </div>
              )}
              <Link href="/favorites" className="relative text-muted-foreground hover:text-foreground transition-colors">
                <Heart className="w-5 h-5" />
                {favorites.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Link>
            </div>
            <div className="flex gap-2 text-[11px] font-medium text-muted-foreground items-center">
              <Link href="/about" className="hover:text-foreground transition-colors">Hakkımızda</Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">İletişim</Link>
            </div>
            <div className="flex justify-end w-full">
              {isAdmin ? (
                <div className="flex items-center gap-2 opacity-0 hover:opacity-100 transition-opacity text-[10px] text-muted-foreground">
                  <Link href="/admin" className="hover:text-foreground transition-colors">Yönetim</Link>
                  <button onClick={() => logout()} className="hover:text-destructive transition-colors">Çıkış</button>
                </div>
              ) : (
                <Link href="/login" className="opacity-0 hover:opacity-100 transition-opacity text-[10px] text-muted-foreground">Admin</Link>
              )}
            </div>
          </div>
        </div>

        {/* MOBİL ÜST KISIM */}
        <div className="w-full flex md:hidden justify-between items-center py-1.5">
          <button onClick={toggleMobileMenu} className="p-1 -ml-1 text-foreground">
            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
          <div className="flex flex-col items-center flex-1 overflow-hidden">
            <Link href="/" className="flex flex-col items-center mb-0.5">
              <span className="font-serif text-xl font-bold tracking-tight whitespace-nowrap" translate="no">Moda İtalya</span>
              <div className="flex w-24 h-1 rounded-full overflow-hidden mt-0.5 mb-0.5">
                <div className="w-1/3 bg-green-600"></div>
                <div className="w-1/3 bg-white border-y border-gray-200"></div>
                <div className="w-1/3 bg-red-600"></div>
              </div>
              <span className="text-muted-foreground text-[10px] font-medium truncate">Toptan</span>
            </Link>
          </div>
          <Link href="/favorites" className="relative text-muted-foreground hover:text-foreground transition-colors p-1">
            <Heart className="w-6 h-6" />
            {favorites.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </Link>
        </div>

        {/* ALT KISIM: Kategori Menüsü (Masaüstü) — scroll sonrası ince çizgi olarak kalır */}
        <div className={`w-full hidden md:flex flex-col items-center transition-all duration-300 ease-in-out ${
          isScrolled ? 'py-2' : 'pb-2'
        }`}>
          {/* Scroll sonrası ince çizgide dil bayrakları da göster */}
          {isScrolled && isTranslationEnabled && (
            <div className="flex items-center gap-1.5 absolute right-4 top-1/2 -translate-y-1/2 z-50">
              <button onClick={() => changeLanguage('tr')} className="w-5 h-5 hover:scale-110 transition-transform cursor-pointer flex items-center justify-center" title="Türkçe">
                <img src="https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f1f9-1f1f7.svg" alt="Türkçe" className="w-full h-full object-contain drop-shadow-sm" />
              </button>
              <button onClick={() => changeLanguage('en')} className="w-5 h-5 hover:scale-110 transition-transform cursor-pointer flex items-center justify-center" title="English">
                <img src="https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f1ec-1f1e7.svg" alt="English" className="w-full h-full object-contain drop-shadow-sm" />
              </button>
              <button onClick={() => changeLanguage('ar')} className="w-5 h-5 hover:scale-110 transition-transform cursor-pointer flex items-center justify-center" title="العربية">
                <img src="https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f1f8-1f1e6.svg" alt="العربية" className="w-full h-full object-contain drop-shadow-sm" />
              </button>
              <button onClick={() => changeLanguage('ru')} className="w-5 h-5 hover:scale-110 transition-transform cursor-pointer flex items-center justify-center" title="Русский">
                <img src="https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f1f7-1f1fa.svg" alt="Русский" className="w-full h-full object-contain drop-shadow-sm" />
              </button>
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-5 text-xs font-medium tracking-wide">
            <Link href="/category/yeniler" className="hover:text-primary transition-colors">YENİLER</Link>
            <Link href="/category/en-iyi-satanlar" className="hover:text-primary transition-colors">EN İYİ SATANLAR</Link>
            {subCategories.map((category) => (
              <Link key={category} href={`/category/${category}`} className="hover:text-primary transition-colors uppercase">
                {category}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobil Menü (Açılır Kapanır) */}
        {isMobileMenuOpen && (
          <div className="w-full md:hidden flex flex-col items-center gap-4 pt-4 pb-2 border-t border-border mt-2 animate-in slide-in-from-top-2">
            <div className="flex flex-col items-center gap-3 text-sm font-medium w-full">
              <Link href="/category/yeniler" onClick={toggleMobileMenu} className="w-full text-center py-2 hover:bg-muted transition-colors block">YENİLER</Link>
              <Link href="/category/en-iyi-satanlar" onClick={toggleMobileMenu} className="w-full text-center py-2 hover:bg-muted transition-colors block">EN İYİ SATANLAR</Link>
              <div className="w-1/2 h-px bg-border/50 my-1"></div>
              {subCategories.map((category) => (
                <Link key={category} href={`/category/${category}`} onClick={toggleMobileMenu} className="w-full text-center py-2 hover:bg-muted transition-colors block uppercase">
                  {category}
                </Link>
              ))}
              <div className="w-1/2 h-px bg-border/50 my-1"></div>
              {isTranslationEnabled && (
                <div className="flex items-center justify-center gap-3 py-2">
                  <button onClick={() => changeLanguage('tr')} className="w-8 h-8 hover:scale-110 transition-transform cursor-pointer flex items-center justify-center" title="Türkçe">
                    <img src="https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f1f9-1f1f7.svg" alt="Türkçe" className="w-full h-full object-contain drop-shadow-sm" />
                  </button>
                  <button onClick={() => changeLanguage('en')} className="w-8 h-8 hover:scale-110 transition-transform cursor-pointer flex items-center justify-center" title="English">
                    <img src="https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f1ec-1f1e7.svg" alt="English" className="w-full h-full object-contain drop-shadow-sm" />
                  </button>
                  <button onClick={() => changeLanguage('ar')} className="w-8 h-8 hover:scale-110 transition-transform cursor-pointer flex items-center justify-center" title="العربية">
                    <img src="https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f1f8-1f1e6.svg" alt="العربية" className="w-full h-full object-contain drop-shadow-sm" />
                  </button>
                  <button onClick={() => changeLanguage('ru')} className="w-8 h-8 hover:scale-110 transition-transform cursor-pointer flex items-center justify-center" title="Русский">
                    <img src="https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f1f7-1f1fa.svg" alt="Русский" className="w-full h-full object-contain drop-shadow-sm" />
                  </button>
                </div>
              )}
              <div className="w-1/2 h-px bg-border/50 my-1"></div>
              <div className="flex justify-center items-center gap-6 text-sm font-medium w-full py-2 relative">
                <Link href="/about" onClick={toggleMobileMenu} className="hover:text-primary transition-colors">Hakkımızda</Link>
                <Link href="/contact" onClick={toggleMobileMenu} className="hover:text-primary transition-colors">İletişim</Link>
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {isAdmin ? (
                    <div className="flex items-center gap-4 opacity-0 hover:opacity-100 transition-opacity">
                      <Link href="/admin" onClick={toggleMobileMenu} className="hover:text-primary transition-colors">Yönetim</Link>
                      <button onClick={() => { logout(); toggleMobileMenu(); }} className="hover:text-destructive transition-colors">Çıkış</button>
                    </div>
                  ) : (
                    <Link href="/login" onClick={toggleMobileMenu} className="opacity-0 hover:opacity-100 transition-opacity">Admin</Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
