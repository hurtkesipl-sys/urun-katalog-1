import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Banner } from './types';

interface ProductStore {
  products: Product[];
  mainCategories: string[];
  subCategories: string[];
  isAdmin: boolean;
  favorites: string[];
  banners: Banner[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  removeProduct: (id: string) => void;
  addSubCategory: (category: string) => void;
  setAdmin: (status: boolean) => void;
  toggleFavorite: (productCode: string) => void;
  addBanner: (banner: Omit<Banner, 'id'>) => void;
  removeBanner: (id: string) => void;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      products: [],
      mainCategories: ["İpek", "Keten", "Viskon", "Pamuk"],
      subCategories: ["Elbise", "Takım", "Bluz", "Gömlek", "Etek", "Pantolon"],
      isAdmin: false,
      favorites: [],
      banners: [
        {
          id: "1",
          imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000",
          title: "Yeni Sezon İtalyan Koleksiyonu"
        },
        {
          id: "2",
          imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=2000",
          title: "Özel Keten Serisi"
        }
      ],
      addProduct: (product: Omit<Product, 'id' | 'createdAt'>) =>
        set((state: ProductStore) => ({
          products: [
            {
              ...product,
              id: crypto.randomUUID(),
              createdAt: Date.now(),
            },
            ...state.products,
          ],
        })),
      removeProduct: (id: string) =>
        set((state: ProductStore) => ({
          products: state.products.filter((p: Product) => p.id !== id),
        })),
      addSubCategory: (category: string) =>
        set((state: ProductStore) => ({
          subCategories: state.subCategories.includes(category) 
            ? state.subCategories 
            : [...state.subCategories, category],
        })),
      setAdmin: (status: boolean) =>
        set(() => ({
          isAdmin: status,
        })),
      toggleFavorite: (productCode: string) =>
        set((state: ProductStore) => ({
          favorites: state.favorites.includes(productCode)
            ? state.favorites.filter(code => code !== productCode)
            : [...state.favorites, productCode],
        })),
      addBanner: (banner: Omit<Banner, 'id'>) =>
        set((state: ProductStore) => ({
          banners: [
            ...state.banners,
            {
              ...banner,
              id: Date.now().toString(),
            },
          ],
        })),
      removeBanner: (id: string) =>
        set((state: ProductStore) => ({
          banners: state.banners.filter((b: Banner) => b.id !== id),
        })),
    }),
    {
      name: 'product-storage',
    }
  )
);
