import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from './types';

interface ProductStore {
  products: Product[];
  mainCategories: string[];
  subCategories: string[];
  isAdmin: boolean;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  removeProduct: (id: string) => void;
  addSubCategory: (category: string) => void;
  setAdmin: (status: boolean) => void;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      products: [],
      mainCategories: ["İpek", "Keten", "Viskon", "Pamuk"],
      subCategories: ["Elbise", "Takım", "Bluz", "Gömlek", "Etek", "Pantolon"],
      isAdmin: false,
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
    }),
    {
      name: 'product-storage',
    }
  )
);
