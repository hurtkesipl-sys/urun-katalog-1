import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from './types';

interface ProductStore {
  products: Product[];
  categories: string[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  removeProduct: (id: string) => void;
  addCategory: (category: string) => void;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      products: [],
      categories: ['Mobilya', 'Aydınlatma', 'Dekorasyon', 'Tekstil'],
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
      addCategory: (category: string) =>
        set((state: ProductStore) => ({
          categories: state.categories.includes(category) 
            ? state.categories 
            : [...state.categories, category],
        })),
    }),
    {
      name: 'product-storage',
    }
  )
);
