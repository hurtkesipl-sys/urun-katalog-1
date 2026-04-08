/**
 * useStore: Replaces the old Zustand/LocalStorage store with tRPC-backed API calls.
 * Provides the same interface as the old store for easy migration.
 */
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";

// Default values
const DEFAULT_CONTACT_INFO = {
  address: "Sanayi Mah, Şahlan Sk. no:6, 34165 Güngören/İstanbul, Türkiye",
  phone: "+90 555 123 45 67",
  email: "info@modaitalyatoptan.com",
  mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3010.244688285884!2d28.874148!3d41.020381!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cabb7151042571%3A0x6b1c2a0d1d4d0b1a!2sSanayi%2C%20%C5%9Eahlan%20Sk.%20No%3A6%2C%2034165%20G%C3%BCng%C3%B6ren%2F%C4%B0stanbul!5e0!3m2!1str!2str!4v1712496000000!5m2!1str!2str",
  instagramUrl: "https://instagram.com",
  whatsappNumber: "905551234567",
  telegramUrl: "https://t.me/modaitalya",
  facebookUrl: "https://facebook.com",
};

const DEFAULT_ABOUT_INFO = {
  title: "Hakkımızda",
  content: "Moda İtalya Toptan olarak, İtalya'nın en seçkin kumaşlarını ve en yeni moda trendlerini sizlerle buluşturuyoruz. Yılların verdiği tecrübe ile toptan giyim sektöründe kalite ve güvenin adresi olmaya devam ediyoruz.",
  imageUrl: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=2000",
};

const DEFAULT_MAIN_CATEGORIES = ["İpek", "Keten", "Viskon", "Pamuk"];
const DEFAULT_SUB_CATEGORIES = ["Elbise", "Takım", "Bluz", "Gömlek", "Etek", "Pantolon"];

const DEFAULT_BANNERS = [
  {
    id: "default-1",
    imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000",
    title: "Yeni Sezon İtalyan Koleksiyonu",
  },
  {
    id: "default-2",
    imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=2000",
    title: "Özel Keten Serisi",
  },
];

export function useProductStore() {
  const utils = trpc.useUtils();

  // Products
  const productsQuery = trpc.products.list.useQuery();
  // Normalize null values from DB to match the Product interface
  const products = (productsQuery.data ?? []).map(p => ({
    ...p,
    description: p.description ?? "",
    imageUrl: p.imageUrl ?? "",
    imageUrls: (p.imageUrls ?? []) as string[],
    mainCategory: p.mainCategory ?? "",
    subCategory: p.subCategory ?? "",
    productCode: p.productCode ?? "",
    colorCode: p.colorCode ?? "",
    videoUrl: p.videoUrl ?? undefined,
  }));

  // Banners
  const bannersQuery = trpc.banners.list.useQuery();
  const banners = bannersQuery.data?.length ? bannersQuery.data : DEFAULT_BANNERS;

  // Settings
  const settingsQuery = trpc.settings.getAll.useQuery();
  const settings = settingsQuery.data ?? {};

  const mainCategories = (settings["mainCategories"] as string[]) ?? DEFAULT_MAIN_CATEGORIES;
  const subCategories = (settings["subCategories"] as string[]) ?? DEFAULT_SUB_CATEGORIES;
  const aboutInfo = (settings["aboutInfo"] as typeof DEFAULT_ABOUT_INFO) ?? DEFAULT_ABOUT_INFO;
  const contactInfo = (settings["contactInfo"] as typeof DEFAULT_CONTACT_INFO) ?? DEFAULT_CONTACT_INFO;

  // Favorites (still local, per device - this is intentional)
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("favorites");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Admin state (still local session)
  const [isAdmin, setIsAdminState] = useState<boolean>(() => {
    return sessionStorage.getItem("isAdmin") === "true";
  });

  const setAdmin = (status: boolean) => {
    setIsAdminState(status);
    if (status) {
      sessionStorage.setItem("isAdmin", "true");
    } else {
      sessionStorage.removeItem("isAdmin");
    }
  };

  // Translation state (still local)
  const isTranslationEnabled = true;
  const toggleTranslation = () => {};

  // Mutations
  const createProductMutation = trpc.products.create.useMutation({
    onSuccess: () => utils.products.list.invalidate(),
  });

  const updateProductMutation = trpc.products.update.useMutation({
    onSuccess: () => utils.products.list.invalidate(),
  });

  const deleteProductMutation = trpc.products.delete.useMutation({
    onSuccess: () => utils.products.list.invalidate(),
  });

  const createBannerMutation = trpc.banners.create.useMutation({
    onSuccess: () => utils.banners.list.invalidate(),
  });

  const deleteBannerMutation = trpc.banners.delete.useMutation({
    onSuccess: () => utils.banners.list.invalidate(),
  });

  const setContactInfoMutation = trpc.settings.setContactInfo.useMutation({
    onSuccess: () => utils.settings.getAll.invalidate(),
  });

  const setAboutInfoMutation = trpc.settings.setAboutInfo.useMutation({
    onSuccess: () => utils.settings.getAll.invalidate(),
  });

  const setMainCategoriesMutation = trpc.settings.setMainCategories.useMutation({
    onSuccess: () => utils.settings.getAll.invalidate(),
  });

  const setSubCategoriesMutation = trpc.settings.setSubCategories.useMutation({
    onSuccess: () => utils.settings.getAll.invalidate(),
  });

  // Actions
  const addProduct = async (product: {
    name: string;
    description?: string;
    priceEUR: number;
    priceTRY: number;
    imageUrl?: string;
    imageUrls?: string[];
    mainCategory?: string;
    subCategory?: string;
    productCode?: string;
    colorCode?: string;
    videoUrl?: string;
  }) => {
    await createProductMutation.mutateAsync({
      name: product.name,
      description: product.description ?? "",
      priceEUR: Math.round(product.priceEUR),
      priceTRY: Math.round(product.priceTRY),
      imageUrl: product.imageUrl ?? "",
      imageUrls: product.imageUrls ?? [],
      mainCategory: product.mainCategory ?? "",
      subCategory: product.subCategory ?? "",
      productCode: product.productCode ?? "",
      colorCode: product.colorCode ?? "",
      videoUrl: product.videoUrl ?? "",
    });
  };

  const updateProduct = async (id: string, data: Partial<{
    name: string;
    description: string;
    priceEUR: number;
    priceTRY: number;
    imageUrl: string;
    imageUrls: string[];
    mainCategory: string;
    subCategory: string;
    productCode: string;
    colorCode: string;
    videoUrl: string;
  }>) => {
    const updateData: Record<string, unknown> = { id };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priceEUR !== undefined) updateData.priceEUR = Math.round(data.priceEUR);
    if (data.priceTRY !== undefined) updateData.priceTRY = Math.round(data.priceTRY);
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.imageUrls !== undefined) updateData.imageUrls = data.imageUrls;
    if (data.mainCategory !== undefined) updateData.mainCategory = data.mainCategory;
    if (data.subCategory !== undefined) updateData.subCategory = data.subCategory;
    if (data.productCode !== undefined) updateData.productCode = data.productCode;
    if (data.colorCode !== undefined) updateData.colorCode = data.colorCode;
    if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
    await updateProductMutation.mutateAsync(updateData as any);
  };

  const removeProduct = async (id: string) => {
    await deleteProductMutation.mutateAsync({ id });
  };

  const addBanner = async (banner: { imageUrl: string; title?: string; link?: string }) => {
    await createBannerMutation.mutateAsync({
      imageUrl: banner.imageUrl,
      title: banner.title,
      link: banner.link,
      sortOrder: 0,
    });
  };

  const removeBanner = async (id: string) => {
    await deleteBannerMutation.mutateAsync({ id });
  };

  const updateAboutInfo = async (info: { title: string; content: string; imageUrl?: string }) => {
    await setAboutInfoMutation.mutateAsync(info);
  };

  const updateContactInfo = async (info: typeof DEFAULT_CONTACT_INFO) => {
    await setContactInfoMutation.mutateAsync(info);
  };

  const addSubCategory = async (category: string) => {
    const updated = [...subCategories, category].filter((v, i, a) => a.indexOf(v) === i);
    await setSubCategoriesMutation.mutateAsync({ categories: updated });
  };

  const removeSubCategory = async (category: string) => {
    const updated = subCategories.filter(c => c !== category);
    await setSubCategoriesMutation.mutateAsync({ categories: updated });
  };

  const toggleFavorite = (productCode: string) => {
    setFavorites(prev =>
      prev.includes(productCode)
        ? prev.filter(code => code !== productCode)
        : [...prev, productCode]
    );
  };

  return {
    products,
    mainCategories,
    subCategories,
    isAdmin,
    isTranslationEnabled,
    favorites,
    banners,
    aboutInfo,
    contactInfo,
    addProduct,
    updateProduct,
    removeProduct,
    addSubCategory,
    removeSubCategory,
    setAdmin,
    toggleFavorite,
    addBanner,
    removeBanner,
    updateAboutInfo,
    updateContactInfo,
    toggleTranslation,
    // Loading states
    isLoading: productsQuery.isLoading || settingsQuery.isLoading,
  };
}
