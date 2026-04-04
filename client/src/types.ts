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
