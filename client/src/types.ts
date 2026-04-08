export interface Product {
  id: string;
  name: string;
  description: string;
  priceEUR: number;
  priceTRY: number;
  imageUrl: string; // Ana görsel (ilk görsel)
  imageUrls?: string[]; // Ek görseller (maksimum 4)
  mainCategory: string;
  subCategory: string;
  productCode: string;
  colorCode: string;
  videoUrl?: string;
  createdAt: number;
}

export interface Banner {
  id: string;
  imageUrl: string;
  title?: string;
  link?: string;
}

export interface AboutInfo {
  title: string;
  content: string;
  imageUrl?: string;
}

export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  mapUrl: string;
  instagramUrl: string;
  whatsappNumber: string;
  telegramUrl: string;
  facebookUrl: string;
}
