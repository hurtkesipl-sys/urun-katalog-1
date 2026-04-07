import { Link } from "wouter";
import { Instagram, Send, Facebook } from "lucide-react";
import { SiWhatsapp } from "@icons-pack/react-simple-icons";
import { getWhatsAppLink } from "@/lib/whatsapp";

import { useProductStore } from "@/store";

export default function Footer() {
  const { contactInfo } = useProductStore();

  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="container py-6 md:py-8">
        <div className="flex flex-col items-center justify-center gap-4">
          {/* Sosyal Medya İkonları (Sadece mobilde görünür) */}
          <div className="flex md:hidden items-center gap-6 text-muted-foreground">
            <a href={contactInfo.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              <Instagram className="w-6 h-6" />
            </a>
            <a href={getWhatsAppLink(contactInfo.whatsappNumber)} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              <SiWhatsapp className="w-6 h-6" />
            </a>
            <a href={contactInfo.telegramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              <Send className="w-6 h-6" />
            </a>
            <a href={contactInfo.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              <Facebook className="w-6 h-6" />
            </a>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Moda İtalya. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
