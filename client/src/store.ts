import { create } from 'zustand';
import { persist, StateStorage, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { Product, Banner, AboutInfo, ContactInfo } from './types';

// IndexedDB storage adapter for Zustand
const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    // Önce IndexedDB'den almayı dene
    const value = await get(name);
    if (value) return value;
    
    // Eğer IndexedDB'de yoksa, localStorage'dan alıp IndexedDB'ye taşı (Migrasyon)
    const localValue = localStorage.getItem(name);
    if (localValue) {
      try {
        await set(name, localValue);
        return localValue;
      } catch (e) {
        console.error("Migration failed:", e);
        return localValue;
      }
    }
    
    return null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
    // Yeni veriler IndexedDB'ye yazıldıkça localStorage'ı temizle (Quota hatasını önlemek için)
    try {
      localStorage.removeItem(name);
    } catch (e) {
      // Ignore
    }
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
    try {
      localStorage.removeItem(name);
    } catch (e) {
      // Ignore
    }
  },
};

interface ProductStore {
  products: Product[];
  mainCategories: string[];
  subCategories: string[];
  isAdmin: boolean;
  favorites: string[];
  banners: Banner[];
  aboutInfo: AboutInfo;
  contactInfo: ContactInfo;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Omit<Product, 'id' | 'createdAt'>>) => void;
  removeProduct: (id: string) => void;
  addSubCategory: (category: string) => void;
  setAdmin: (status: boolean) => void;
  toggleFavorite: (productCode: string) => void;
  addBanner: (banner: Omit<Banner, 'id'>) => void;
  removeBanner: (id: string) => void;
  updateAboutInfo: (info: AboutInfo) => void;
  updateContactInfo: (info: ContactInfo) => void;
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
      aboutInfo: {
        title: "Hakkımızda",
        content: "Moda İtalya Toptan olarak, İtalya'nın en seçkin kumaşlarını ve en yeni moda trendlerini sizlerle buluşturuyoruz. Yılların verdiği tecrübe ile toptan giyim sektöründe kalite ve güvenin adresi olmaya devam ediyoruz.",
        imageUrl: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=2000"
      },
      contactInfo: {
        address: "Sanayi Mah, Şahlan Sk. no:6, 34165 Güngören/İstanbul, Türkiye",
        phone: "+90 555 123 45 67",
        email: "info@modaitalyatoptan.com",
        mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3010.244688285884!2d28.874148!3d41.020381!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cabb7151042571%3A0x6b1c2a0d1d4d0b1a!2sSanayi%2C%20%C5%9Eahlan%20Sk.%20No%3A6%2C%2034165%20G%C3%BCng%C3%B6ren%2F%C4%B0stanbul!5e0!3m2!1str!2str!4v1712496000000!5m2!1str!2str",
        instagramUrl: "https://instagram.com",
        whatsappNumber: "905551234567",
        telegramUrl: "https://t.me/modaitalya",
        facebookUrl: "https://facebook.com"
      },
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
      updateProduct: (id: string, updatedProduct: Partial<Omit<Product, 'id' | 'createdAt'>>) =>
        set((state: ProductStore) => ({
          products: state.products.map((p: Product) => 
            p.id === id ? { ...p, ...updatedProduct } : p
          ),
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
      updateAboutInfo: (info: AboutInfo) =>
        set(() => ({
          aboutInfo: info,
        })),
      updateContactInfo: (info: ContactInfo) =>
        set(() => ({
          contactInfo: info,
        })),
    }),
    {
      name: 'product-storage',
      storage: createJSONStorage(() => storage),
    }
  )
);
