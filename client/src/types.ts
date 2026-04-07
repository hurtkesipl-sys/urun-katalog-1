export interface Product {
  id: string;
  name: string;
  description: string;
  priceEUR: number;
  priceTRY: number;
  imageUrl: string;
  mainCategory: string;
  subCategory: string;
  productCode: string;
  colorCode: string;
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
