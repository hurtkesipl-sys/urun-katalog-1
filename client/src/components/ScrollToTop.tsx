import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Rota her değiştiğinde sayfayı en üste kaydırır.
 * wouter SPA navigasyonunda scroll pozisyonunu sıfırlamadığı için bu bileşen gereklidir.
 */
export default function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location]);

  return null;
}
