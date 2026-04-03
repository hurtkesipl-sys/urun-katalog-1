import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const products = [
  {
    id: "1",
    name: "İskandinav Ahşap Sandalye",
    description: "Doğal meşe ağacından üretilmiş, minimalist ve ergonomik tasarım. Uzun süreli oturumlar için ideal konfor sağlar.",
    priceEUR: 149.99,
    priceTRY: 4500.00,
    imageUrl: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&q=80&w=800",
    createdAt: Date.now()
  },
  {
    id: "2",
    name: "Modern Seramik Vazo",
    description: "El yapımı, mat yüzeyli seramik vazo. Kuru çiçekler veya tek başına dekoratif bir obje olarak kullanılabilir.",
    priceEUR: 45.50,
    priceTRY: 1365.00,
    imageUrl: "https://images.unsplash.com/photo-1612152505361-25808db15efa?auto=format&fit=crop&q=80&w=800",
    createdAt: Date.now() - 1000
  },
  {
    id: "3",
    name: "Minimalist Masa Lambası",
    description: "Pirinç detaylı, ayarlanabilir başlıklı çalışma masası lambası. Sıcak ve odaklanmış bir ışık sunar.",
    priceEUR: 89.00,
    priceTRY: 2670.00,
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800",
    createdAt: Date.now() - 2000
  },
  {
    id: "4",
    name: "Keten Kırlent Kılıfı",
    description: "%100 doğal keten kumaştan üretilmiş, gizli fermuarlı kırlent kılıfı. Yıkanabilir ve dayanıklıdır.",
    priceEUR: 24.90,
    priceTRY: 747.00,
    imageUrl: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=800",
    createdAt: Date.now() - 3000
  }
];

const state = {
  state: {
    products: products
  },
  version: 0
};

// localStorage'a yazmak için (tarayıcıda çalışacak)
console.log("Bu veriyi tarayıcı konsolunda çalıştırarak örnek ürünleri ekleyebilirsiniz:");
console.log(`localStorage.setItem('product-storage', JSON.stringify(${JSON.stringify(state)}));`);
console.log("Ardından sayfayı yenileyin.");
