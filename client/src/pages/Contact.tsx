import { useProductStore } from "@/hooks/useStore";
import Navbar from "@/components/Navbar";
import { MapPin, Phone, Mail, Instagram, MessageCircle, Send, Facebook } from "lucide-react";
import { getWhatsAppLink } from "@/lib/whatsapp";

export default function Contact() {
  const { contactInfo } = useProductStore();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-center mb-12">
            İletişim
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Sol Taraf: İletişim Bilgileri */}
            <div className="space-y-8">
              <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-semibold mb-6">Bize Ulaşın</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full text-primary">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Adres</h3>
                      <p className="text-muted-foreground">{contactInfo.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full text-primary">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Telefon</h3>
                      <a href={`tel:${contactInfo.phone.replace(/\s+/g, '')}`} className="text-muted-foreground hover:text-primary transition-colors">
                        {contactInfo.phone}
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full text-primary">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">E-posta</h3>
                      <a href={`mailto:${contactInfo.email}`} className="text-muted-foreground hover:text-primary transition-colors">
                        {contactInfo.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sosyal Medya */}
              <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-semibold mb-6">Sosyal Medya</h2>
                <div className="flex flex-wrap gap-4">
                  <a 
                    href={contactInfo.instagramUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white px-6 py-3 rounded-full hover:opacity-90 transition-opacity font-medium"
                  >
                    <Instagram className="w-5 h-5" />
                    Instagram
                  </a>
                  
                  <a 
                    href={getWhatsAppLink(contactInfo.whatsappNumber)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full hover:opacity-90 transition-opacity font-medium"
                  >
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp
                  </a>
                  
                  <a 
                    href={contactInfo.telegramUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#0088cc] text-white px-6 py-3 rounded-full hover:opacity-90 transition-opacity font-medium"
                  >
                    <Send className="w-5 h-5" />
                    Telegram
                  </a>
                  
                  <a 
                    href={contactInfo.facebookUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#1877F2] text-white px-6 py-3 rounded-full hover:opacity-90 transition-opacity font-medium"
                  >
                    <Facebook className="w-5 h-5" />
                    Facebook
                  </a>
                </div>
              </div>
            </div>

            {/* Sağ Taraf: Harita */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm h-[400px] lg:h-auto min-h-[400px]">
              {contactInfo.mapUrl ? (
                <iframe 
                  src={contactInfo.mapUrl} 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Maps Konumumuz"
                ></iframe>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                  Harita konumu eklenmemiş.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
