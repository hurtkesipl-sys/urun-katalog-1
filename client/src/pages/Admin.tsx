import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useProductStore } from "@/hooks/useStore";
import { useAuth } from "@/_core/hooks/useAuth";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const { products, mainCategories, subCategories, addProduct, updateProduct, removeProduct, addSubCategory, removeSubCategory, banners, addBanner, removeBanner, aboutInfo, contactInfo, updateAboutInfo, updateContactInfo, isTranslationEnabled, toggleTranslation } = useProductStore();
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.role === "admin";
  const [isAdding, setIsAdding] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [, setLocation] = useLocation();

  const [newSubCategory, setNewSubCategory] = useState("");

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      setLocation("/login");
    }
  }, [authLoading, isAdmin, setLocation]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priceEUR: "",
    priceTRY: "",
    imageUrl: "",
    imageUrls: [] as string[],
    mainCategory: mainCategories[0],
    subCategory: subCategories[0],
    productCode: "",
    colorCode: "",
    videoUrl: "",
  });

  const [bannerData, setBannerData] = useState({
    imageUrl: "",
    title: "",
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [aboutData, setAboutData] = useState(aboutInfo);
  const [contactData, setContactData] = useState(contactInfo);

  // Store'daki veriler değiştiğinde form verilerini güncelle
  useEffect(() => {
    setAboutData(aboutInfo);
  }, [aboutInfo]);

  useEffect(() => {
    setContactData(contactInfo);
  }, [contactInfo]);

  const handleUpdateAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateAboutInfo(aboutData);
      setIsEditingAbout(false);
      toast.success("Hakkımızda bilgileri güncellendi!");
    } catch (err) {
      toast.error("Güncelleme sırasında hata oluştu.");
    }
  };

  const handleUpdateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Harita URL'sini kontrol et ve gerekirse iframe içinden src'yi çıkar
    let finalMapUrl = contactData.mapUrl;
    if (finalMapUrl.includes('<iframe') && finalMapUrl.includes('src="')) {
      const srcMatch = finalMapUrl.match(/src="([^"]+)"/);
      if (srcMatch && srcMatch[1]) {
        finalMapUrl = srcMatch[1];
      }
    }
    
    const updatedContactData = { ...contactData, mapUrl: finalMapUrl };
    try {
      await updateContactInfo(updatedContactData);
      setContactData(updatedContactData);
      setIsEditingContact(false);
      toast.success("İletişim bilgileri güncellendi!");
    } catch (err) {
      toast.error("Güncelleme sırasında hata oluştu.");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Maksimum 4 görsel kontrolü
    if (imagePreviews.length + files.length > 4) {
      toast.error("En fazla 4 görsel yükleyebilirsiniz.");
      return;
    }

    const newPreviews: string[] = [];
    let processedCount = 0;

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} boyutu 5MB'dan küçük olmalıdır.`);
        processedCount++;
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        newPreviews.push(base64String);
        processedCount++;

        if (processedCount === files.length) {
          const updatedPreviews = [...imagePreviews, ...newPreviews];
          setImagePreviews(updatedPreviews);
          setFormData({ 
            ...formData, 
            imageUrl: updatedPreviews[0] || "", // İlk görsel ana görsel
            imageUrls: updatedPreviews.slice(1) // Geri kalanlar ek görseller
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(updatedPreviews);
    setFormData({ 
      ...formData, 
      imageUrl: updatedPreviews[0] || "", 
      imageUrls: updatedPreviews.slice(1) 
    });
  };

  const handleProductCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCode = e.target.value;
    setFormData({ ...formData, productCode: newCode });

    // Eğer yeni ürün ekleniyorsa (düzenleme modunda değilse) ve girilen kodla eşleşen bir ürün varsa
    if (!editingProductId && newCode.trim() !== "") {
      const existingProduct = products.find(p => p.productCode === newCode.trim());
      if (existingProduct) {
        setFormData(prev => ({
          ...prev,
          name: existingProduct.name,
          description: existingProduct.description || "",
          priceEUR: existingProduct.priceEUR.toString(),
          priceTRY: existingProduct.priceTRY.toString(),
          mainCategory: existingProduct.mainCategory ?? "",
          subCategory: existingProduct.subCategory ?? "",
          videoUrl: existingProduct.videoUrl || "",
          productCode: newCode
        }));
        toast.success("Mevcut ürün bilgileri otomatik dolduruldu. Lütfen yeni renk ismini ve görselini girin.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.priceEUR || !formData.priceTRY || !formData.imageUrl || !formData.mainCategory || !formData.subCategory || !formData.productCode || !formData.colorCode) {
      toast.error("Lütfen zorunlu alanları doldurun.");
      return;
    }

    try {
      if (editingProductId) {
        await updateProduct(editingProductId, {
          name: formData.name,
          description: formData.description,
          priceEUR: parseFloat(formData.priceEUR),
          priceTRY: parseFloat(formData.priceTRY),
          imageUrl: formData.imageUrl,
          imageUrls: formData.imageUrls,
          mainCategory: formData.mainCategory,
          subCategory: formData.subCategory,
          productCode: formData.productCode,
          colorCode: formData.colorCode,
          videoUrl: formData.videoUrl || undefined,
        });
        toast.success("Ürün başarıyla güncellendi.");
      } else {
        await addProduct({
          name: formData.name,
          description: formData.description,
          priceEUR: parseFloat(formData.priceEUR),
          priceTRY: parseFloat(formData.priceTRY),
          imageUrl: formData.imageUrl,
          imageUrls: formData.imageUrls,
          mainCategory: formData.mainCategory,
          subCategory: formData.subCategory,
          productCode: formData.productCode,
          colorCode: formData.colorCode,
          videoUrl: formData.videoUrl || undefined,
        });
        toast.success("Ürün başarıyla eklendi.");
      }

      setFormData({ name: "", description: "", priceEUR: "", priceTRY: "", imageUrl: "", imageUrls: [], mainCategory: mainCategories[0], subCategory: subCategories[0], productCode: "", colorCode: "", videoUrl: "" });
      setImagePreviews([]);
      setIsAdding(false);
      setEditingProductId(null);
    } catch (err) {
      toast.error("İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  const handleEdit = (id: string) => {
    const productToEdit = products.find(p => p.id === id);
    if (productToEdit) {
      setFormData({
        name: productToEdit.name,
        description: productToEdit.description || "",
        priceEUR: productToEdit.priceEUR.toString(),
        priceTRY: productToEdit.priceTRY.toString(),
        imageUrl: productToEdit.imageUrl ?? "",
        imageUrls: productToEdit.imageUrls || [],
        mainCategory: productToEdit.mainCategory ?? "",
        subCategory: productToEdit.subCategory ?? "",
        productCode: productToEdit.productCode ?? "",
        colorCode: productToEdit.colorCode || "",
        videoUrl: productToEdit.videoUrl || "",
      });
      
      const allImages = [productToEdit.imageUrl ?? ""];
      if (productToEdit.imageUrls && productToEdit.imageUrls.length > 0) {
        allImages.push(...productToEdit.imageUrls);
      }
      setImagePreviews(allImages);
      
      setEditingProductId(id);
      setIsAdding(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAddSubCategory = () => {
    if (newSubCategory.trim()) {
      addSubCategory(newSubCategory.trim());
      setFormData({ ...formData, subCategory: newSubCategory.trim() });
      setNewSubCategory("");
      toast.success("Yeni ürün tipi eklendi!");
    }
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (banners.length >= 3) {
      toast.error("En fazla 3 banner ekleyebilirsiniz!");
      return;
    }
    
    try {
      await addBanner({
        imageUrl: bannerData.imageUrl,
        title: bannerData.title || undefined,
      });
      setBannerData({ imageUrl: "", title: "" });
      setIsAddingBanner(false);
      toast.success("Banner başarıyla eklendi!");
    } catch (err) {
      toast.error("Banner eklenirken hata oluştu.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeProduct(id);
      toast.success("Ürün silindi.");
    } catch (err) {
      toast.error("Ürün silinirken hata oluştu.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-serif text-3xl font-bold">Yönetim Paneli</h1>
          <div className="flex flex-wrap gap-2 md:gap-4">
            <Button variant="outline" onClick={() => setIsEditingAbout(!isEditingAbout)} className="text-xs md:text-sm">
              {isEditingAbout ? "İptal" : "Hakkımızda Düzenle"}
            </Button>
            <Button variant="outline" onClick={() => setIsEditingContact(!isEditingContact)} className="text-xs md:text-sm">
              {isEditingContact ? "İptal" : "İletişim Düzenle"}
            </Button>
            <Button variant="outline" onClick={() => setIsManagingCategories(!isManagingCategories)} className="text-xs md:text-sm">
              {isManagingCategories ? "İptal" : "Kategori Yönetimi"}
            </Button>
            <Button variant="outline" onClick={() => setIsAddingBanner(!isAddingBanner)} className="text-xs md:text-sm">
              <PlusCircle className="mr-1 md:mr-2 h-4 w-4" />
              {isAddingBanner ? "İptal" : "Banner Yönetimi"}
            </Button>
            <Button onClick={() => {
              if (isAdding) {
                setIsAdding(false);
                setEditingProductId(null);
                setFormData({ name: "", description: "", priceEUR: "", priceTRY: "", imageUrl: "", imageUrls: [], mainCategory: mainCategories[0], subCategory: subCategories[0], productCode: "", colorCode: "", videoUrl: "" });
                setImagePreviews([]);
              } else {
                setIsAdding(true);
              }
            }} className="text-xs md:text-sm">
              <PlusCircle className="mr-1 md:mr-2 h-4 w-4" />
              {isAdding ? "İptal" : "Yeni Ürün Ekle"}
            </Button>
          </div>
        </div>

        {isManagingCategories && (
          <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-xl font-semibold">Kategori ve Dil Yönetimi</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Otomatik Çeviri (Google Translate):</span>
                <Button 
                  variant={isTranslationEnabled ? "default" : "outline"} 
                  onClick={toggleTranslation}
                  className={isTranslationEnabled ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {isTranslationEnabled ? "Açık" : "Kapalı"}
                </Button>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-4">Mevcut Ürün Tipleri (Kategoriler)</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {subCategories.map((category) => (
                    <div key={category} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-sm">
                      <span>{category}</span>
                      <button 
                        onClick={() => {
                          removeSubCategory(category);
                          toast.success(`${category} kategorisi silindi.`);
                        }}
                        className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2 max-w-md">
                  <Input
                    value={newSubCategory}
                    onChange={(e) => setNewSubCategory(e.target.value)}
                    placeholder="Yeni ürün tipi (Örn: Ceket)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubCategory();
                      }
                    }}
                  />
                  <Button onClick={handleAddSubCategory} type="button">Ekle</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isEditingAbout && (
          <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
            <h2 className="font-serif text-xl font-semibold mb-6">Hakkımızda Bilgilerini Düzenle</h2>
            <form onSubmit={handleUpdateAbout} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="aboutTitle">Başlık</Label>
                <Input
                  id="aboutTitle"
                  value={aboutData.title}
                  onChange={(e) => setAboutData({ ...aboutData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aboutContent">İçerik</Label>
                <Textarea
                  id="aboutContent"
                  value={aboutData.content}
                  onChange={(e) => setAboutData({ ...aboutData, content: e.target.value })}
                  rows={5}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aboutImage">Görsel URL (İsteğe Bağlı)</Label>
                <Input
                  id="aboutImage"
                  value={aboutData.imageUrl || ""}
                  onChange={(e) => setAboutData({ ...aboutData, imageUrl: e.target.value })}
                />
              </div>
              <Button type="submit">Kaydet</Button>
            </form>
          </div>
        )}

        {isEditingContact && (
          <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
            <h2 className="font-serif text-xl font-semibold mb-6">İletişim Bilgilerini Düzenle</h2>
            <form onSubmit={handleUpdateContact} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contactAddress">Adres</Label>
                  <Input
                    id="contactAddress"
                    value={contactData.address}
                    onChange={(e) => setContactData({ ...contactData, address: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Telefon</Label>
                  <Input
                    id="contactPhone"
                    value={contactData.phone}
                    onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">E-posta</Label>
                  <Input
                    id="contactEmail"
                    value={contactData.email}
                    onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactMap">Google Haritalar Embed Kodu veya URL'si</Label>
                  <Input
                    id="contactMap"
                    value={contactData.mapUrl}
                    onChange={(e) => setContactData({ ...contactData, mapUrl: e.target.value })}
                    placeholder='<iframe src="..." veya sadece link'
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactInstagram">Instagram URL</Label>
                  <Input
                    id="contactInstagram"
                    value={contactData.instagramUrl}
                    onChange={(e) => setContactData({ ...contactData, instagramUrl: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactWhatsapp">WhatsApp Numarası (Örn: 905551234567)</Label>
                  <Input
                    id="contactWhatsapp"
                    value={contactData.whatsappNumber}
                    onChange={(e) => setContactData({ ...contactData, whatsappNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactTelegram">Telegram URL</Label>
                  <Input
                    id="contactTelegram"
                    value={contactData.telegramUrl}
                    onChange={(e) => setContactData({ ...contactData, telegramUrl: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactFacebook">Facebook URL</Label>
                  <Input
                    id="contactFacebook"
                    value={contactData.facebookUrl}
                    onChange={(e) => setContactData({ ...contactData, facebookUrl: e.target.value })}
                    required
                  />
                </div>
              </div>
              <Button type="submit">Kaydet</Button>
            </form>
          </div>
        )}

        {isAddingBanner && (
          <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
            <h2 className="font-serif text-xl font-semibold mb-6">Banner Yönetimi (Maksimum 3)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {banners.map((banner) => (
                <div key={banner.id} className="relative rounded-lg overflow-hidden border border-border aspect-video">
                  <img src={banner.imageUrl} alt={banner.title || "Banner"} className="w-full h-full object-cover" />
                  {banner.title && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="text-white font-bold text-center px-2">{banner.title}</span>
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => removeBanner(banner.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {banners.length < 3 && (
              <form onSubmit={handleAddBanner} className="space-y-6 border-t border-border pt-6">
                <h3 className="font-medium">Yeni Banner Ekle</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bannerImage">Görsel URL</Label>
                    <Input
                      id="bannerImage"
                      value={bannerData.imageUrl}
                      onChange={(e) => setBannerData({ ...bannerData, imageUrl: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bannerTitle">Başlık (İsteğe Bağlı)</Label>
                    <Input
                      id="bannerTitle"
                      value={bannerData.title}
                      onChange={(e) => setBannerData({ ...bannerData, title: e.target.value })}
                      placeholder="Yeni Sezon Koleksiyonu"
                    />
                  </div>
                </div>
                <Button type="submit">Banner Ekle</Button>
              </form>
            )}
          </div>
        )}

        {isAdding && (
          <div className="bg-card border border-border rounded-lg p-6 mb-12 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">{editingProductId ? "Ürünü Düzenle" : "Yeni Ürün Detayları"}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Ürün Adı *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Örn: İtalyan İpek Elbise"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productCode">Ürün Kodu *</Label>
                    <Input
                      id="productCode"
                      value={formData.productCode}
                      onChange={handleProductCodeChange}
                      placeholder="Örn: ELB-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="colorCode">Renk İsmi *</Label>
                    <Input
                      id="colorCode"
                      value={formData.colorCode}
                      onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                      placeholder="Örn: Siyah, Kırmızı, Mavi"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageFile">Ürün Görselleri (Maksimum 4) *</Label>
                  <div className="flex flex-col gap-4">
                    <Input
                      id="imageFile"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="cursor-pointer"
                      disabled={imagePreviews.length >= 4}
                    />
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative w-full aspect-square rounded-md overflow-hidden border border-border group">
                            <img 
                              src={preview} 
                              alt={`Önizleme ${index + 1}`} 
                              className="w-full h-full object-cover"
                            />
                            {index === 0 && (
                              <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded">
                                Ana Görsel
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceEUR">Fiyat (EUR) *</Label>
                  <Input
                    id="priceEUR"
                    type="number"
                    step="0.01"
                    value={formData.priceEUR}
                    onChange={(e) => setFormData({ ...formData, priceEUR: e.target.value })}
                    placeholder="Örn: 149.99"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceTRY">Fiyat (TRY) *</Label>
                  <Input
                    id="priceTRY"
                    type="number"
                    step="0.01"
                    value={formData.priceTRY}
                    onChange={(e) => setFormData({ ...formData, priceTRY: e.target.value })}
                    placeholder="Örn: 4500.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mainCategory">Kumaş Türü *</Label>
                  <select
                    id="mainCategory"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.mainCategory}
                    onChange={(e) => setFormData({ ...formData, mainCategory: e.target.value })}
                  >
                    <option value="" disabled>Kumaş Seçin</option>
                    {mainCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subCategory">Ürün Tipi *</Label>
                  <div className="flex gap-2">
                    <select
                      id="subCategory"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.subCategory}
                      onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    >
                      <option value="" disabled>Ürün Tipi Seçin</option>
                      {subCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Yeni ürün tipi ekle"
                      value={newSubCategory}
                      onChange={(e) => setNewSubCategory(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubCategory())}
                    />
                    <Button type="button" variant="outline" onClick={handleAddSubCategory}>Ekle</Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL (İsteğe Bağlı)</Label>
                <Input
                  id="videoUrl"
                  value={formData.videoUrl || ""}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="Örn: https://youtube.com/watch?v=... veya https://vimeo.com/..."
                />
                <p className="text-xs text-muted-foreground">
                  YouTube, Vimeo veya doğrudan video linkini yapıştırın. Bilgisayardan video yükleme desteklenmemektedir.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ürün hakkında detaylı bilgi..."
                    rows={3}
                  />
              </div>

              <Button type="submit" className="w-full md:w-auto">
                {editingProductId ? "Değişiklikleri Kaydet" : "Ürünü Kaydet"}
              </Button>
            </form>
          </div>
        )}

        <div className="space-y-6">
          <h2 className="text-2xl font-serif font-semibold">Mevcut Ürünler ({products.length})</h2>
          {products.length === 0 ? (
            <p className="text-muted-foreground">Henüz ürün bulunmuyor.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isAdmin={true}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
