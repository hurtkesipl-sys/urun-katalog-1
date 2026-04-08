import { useState, useEffect } from "react";
import { useProductStore } from "@/store";
import { Link } from "wouter";
import { Menu, Search, ShoppingBag, User, X, Instagram, Send, Facebook, Heart } from "lucide-react";
import { SiWhatsapp } from "@icons-pack/react-simple-icons";
import { getWhatsAppLink } from "@/lib/whatsapp";

export default function Navbar() {
  const { isAdmin, setAdmin, favorites, contactInfo, subCategories, isTranslationEnabled } = useProductStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const changeLanguage = (langCode: string) => {
    // Google Translate çerezini doğrudan ayarla
    document.cookie = `googtrans=/tr/${langCode}; path=/; domain=${window.location.hostname}`;
    document.cookie = `googtrans=/tr/${langCode}; path=/; domain=.${window.location.hostname}`;
    
    // Sayfayı yenile ki çeviri uygulansın
    window.location.reload();
  };

  useEffect(() => {
    if (isTranslationEnabled) {
      // Script zaten eklenmiş mi kontrol et
      if (!document.getElementById('google-translate-script')) {
        const script = document.createElement('script');
        script.id = 'google-translate-script';
        script.type = 'text/javascript';
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        document.body.appendChild(script);

        // Init fonksiyonunu global window objesine ekle
        (window as any).googleTranslateElementInit = () => {
          if (document.getElementById('google_translate_element')) {
            // Önceki içeriği temizle (sayfa geçişlerinde çift yüklenmeyi önlemek için)
            document.getElementById('google_translate_element')!.innerHTML = '';
            new (window as any).google.translate.TranslateElement({
              pageLanguage: 'tr',
              includedLanguages: 'tr,en,ar,ru',
              layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false
            }, 'google_translate_element');
          }
        };
      } else {
        // Script zaten varsa ve sayfa değiştiyse, init fonksiyonunu tekrar çağır
        if ((window as any).googleTranslateElementInit) {
          setTimeout(() => {
            (window as any).googleTranslateElementInit();
          }, 100);
        }
      }

      // İnatçı Google Translate şeridini (banner) DOM'dan zorla silmek için DAHA AGRESİF MutationObserver
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(() => {
          // Tüm olası şerit öğelerini bul ve sil
          const elementsToRemove = [
            '.goog-te-banner-frame',
            '.skiptranslate > iframe.goog-te-banner-frame',
            '.goog-te-balloon-frame',
            '#goog-gt-tt',
            'iframe[name="google_translate_banner_frame"]'
          ];
          
          elementsToRemove.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => el.remove());
          });
          
          // Body ve HTML'in top, padding ve margin değerlerini zorla sıfırla
          const resetStyles = (el: HTMLElement) => {
            if (el.style.top !== '0px' && el.style.top !== '') el.style.top = '0px';
            if (el.style.marginTop !== '0px' && el.style.marginTop !== '') el.style.marginTop = '0px';
            if (el.style.paddingTop !== '0px' && el.style.paddingTop !== '') el.style.paddingTop = '0px';
          };
          
          resetStyles(document.body);
          resetStyles(document.documentElement);
          
          // Google'ın eklediği skiptranslate sınıfını body'den kaldır (boşluk yapmasını engeller)
          if (document.body.classList.contains('skiptranslate')) {
            document.body.classList.remove('skiptranslate');
          }
        });
      });

      // Sadece body'yi değil, tüm HTML'i (documentElement) gözlemle
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });

      // Ayrıca düzenli aralıklarla kontrol et (Observer'ın kaçırdığı durumlar için)
      const intervalId = setInterval(() => {
        const banner = document.querySelector('.goog-te-banner-frame');
        if (banner) banner.remove();
        
        if (document.body.style.top !== '0px' && document.body.style.top !== '') {
          document.body.style.top = '0px';
        }
      }, 500);

      return () => {
        observer.disconnect();
        clearInterval(intervalId);
      };
    }
  }, [isTranslationEnabled]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Sadece mobilde çalışsın (md breakpoint altı)
      if (window.innerWidth < 768) {
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          // Aşağı kaydırırken gizle
          setIsVisible(false);
          setIsMobileMenuOpen(false); // Menü açıksa kapat
        } else {
          // Yukarı kaydırırken veya en üstteyken göster
          setIsVisible(true);
        }
      } else {
        // Masaüstünde her zaman görünür
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <nav className={`border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="container flex flex-col items-center py-2 md:py-4 relative">
        {/* Üst Kısım: Logo ve Sağ Üst Menü */}
        <div className="w-full flex justify-between items-center mb-2 md:mb-4">
          {/* Mobil Menü Butonu (Sadece mobilde görünür) */}
          <div className="w-auto md:w-24 flex md:hidden">
            <button onClick={toggleMobileMenu} className="p-1 md:p-2 -ml-1 md:-ml-2 text-foreground">
              {isMobileMenuOpen ? <X className="w-5 h-5 md:w-6 md:h-6" /> : <Menu className="w-5 h-5 md:w-6 md:h-6" />}
            </button>
          </div>
          
          {/* Sol boşluk dengeleyici ve Sosyal Medya İkonları (Sadece masaüstünde görünür) */}
          <div className="w-32 hidden md:flex items-center gap-4 text-muted-foreground">
            <a href={contactInfo.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href={getWhatsAppLink(contactInfo.whatsappNumber)} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              <SiWhatsapp className="w-5 h-5" />
            </a>
            <a href={contactInfo.telegramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              <Send className="w-5 h-5" />
            </a>
            <a href={contactInfo.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
          </div>
          
          {/* Logo ve İtalyan Bayrağı */}
          <div className="flex flex-col items-start md:items-center ml-2 md:ml-0 flex-1 md:flex-none">
            <Link href="/" className="flex items-baseline md:items-center gap-1 md:gap-2 mb-0.5 md:mb-1">
              <span className="font-serif text-xl md:text-3xl font-bold tracking-tight whitespace-nowrap">Moda İtalya</span>
              <span className="text-muted-foreground text-[10px] md:text-sm font-medium md:mt-2">Toptan</span>
            </Link>
            {/* İtalyan Bayrağı Çizgisi */}
            <div className="flex w-24 md:w-full h-1.5 md:h-2 rounded-full overflow-hidden mt-0.5">
              <div className="w-1/3 bg-green-600"></div>
              <div className="w-1/3 bg-white border-y border-gray-200"></div>
              <div className="w-1/3 bg-red-600"></div>
            </div>
          </div>

          {/* Sağ Üst Menü (Favoriler, Hakkımızda, İletişim ve Admin) */}
          <div className="flex items-center gap-2 md:gap-4 w-auto md:w-24 justify-end">
            {isTranslationEnabled && (
              <div className="flex items-center gap-2 mr-2 md:mr-4 relative z-50">
                <div id="google_translate_element" className="hidden"></div>
                <button onClick={() => changeLanguage('tr')} className="text-2xl md:text-3xl hover:scale-110 transition-transform cursor-pointer" title="Türkçe">🇹🇷</button>
                <button onClick={() => changeLanguage('en')} className="text-2xl md:text-3xl hover:scale-110 transition-transform cursor-pointer" title="English">🇬🇧</button>
                <button onClick={() => changeLanguage('ar')} className="text-2xl md:text-3xl hover:scale-110 transition-transform cursor-pointer" title="العربية">🇸🇦</button>
                <button onClick={() => changeLanguage('ru')} className="text-2xl md:text-3xl hover:scale-110 transition-transform cursor-pointer" title="Русский">🇷🇺</button>
              </div>
            )}
            <div className="flex flex-col items-end gap-1 md:gap-2">
              <Link href="/favorites" className="relative text-muted-foreground hover:text-foreground transition-colors self-end">
                <Heart className="w-5 h-5 md:w-6 md:h-6" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 bg-red-500 text-white text-[8px] md:text-[10px] font-bold w-3.5 h-3.5 md:w-4 md:h-4 rounded-full flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Link>
              <div className="hidden md:flex gap-3 text-xs font-medium text-muted-foreground">
                <Link href="/about" className="hover:text-foreground transition-colors">Hakkımızda</Link>
                <Link href="/contact" className="hover:text-foreground transition-colors">İletişim</Link>
              </div>
            </div>
            
            {isAdmin ? (
              <div className="flex flex-col items-end gap-1 ml-2">
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
              <Link href="/login" className="text-xs font-medium text-muted-foreground opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity ml-2">
                Admin
              </Link>
            )}
          </div>
        </div>

        {/* Alt Kısım: İki Satırlı Menü (Masaüstü) */}
        <div className="w-full hidden md:flex flex-col items-center gap-2">
          {/* Üst Menü: Ürün Tipleri */}
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium tracking-wide">
            <Link href="/category/yenilik" className="hover:text-primary transition-colors">YENİLİK</Link>
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
              <Link href="/category/yenilik" onClick={toggleMobileMenu} className="w-full text-center py-2 hover:bg-muted transition-colors block">YENİLİK</Link>
              <Link href="/category/en-iyi-satanlar" onClick={toggleMobileMenu} className="w-full text-center py-2 hover:bg-muted transition-colors block">EN İYİ SATANLAR</Link>
              <div className="w-1/2 h-px bg-border/50 my-1"></div>
              {subCategories.map((category) => (
                <Link key={category} href={`/category/${category}`} onClick={toggleMobileMenu} className="w-full text-center py-2 hover:bg-muted transition-colors block uppercase">
                  {category}
                </Link>
              ))}

              <div className="w-1/2 h-px bg-border/50 my-1"></div>
              <div className="flex justify-center gap-6 text-sm font-medium w-full py-2">
                <Link href="/about" onClick={toggleMobileMenu} className="hover:text-primary transition-colors">Hakkımızda</Link>
                <Link href="/contact" onClick={toggleMobileMenu} className="hover:text-primary transition-colors">İletişim</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
