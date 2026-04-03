import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from './types';

interface ProductStore {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  removeProduct: (id: string) => void;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      products: [],
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
    }),
    {
      name: 'product-storage',
    }
  )
);
