import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useProductStore } from "@/store";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const { products, mainCategories, subCategories, addProduct, updateProduct, removeProduct, addSubCategory, isAdmin, banners, addBanner, removeBanner, aboutInfo, contactInfo, updateAboutInfo, updateContactInfo } = useProductStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [, setLocation] = useLocation();

  const [newSubCategory, setNewSubCategory] = useState("");

  useEffect(() => {
    if (!isAdmin) {
      setLocation("/login");
    }
  }, [isAdmin, setLocation]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priceEUR: "",
    priceTRY: "",
    imageUrl: "",
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [aboutData, setAboutData] = useState(aboutInfo);
  const [contactData, setContactData] = useState(contactInfo);

  // Store'daki veriler değiştiğinde form verilerini güncelle
  useEffect(() => {
    setAboutData(aboutInfo);
  }, [aboutInfo]);

  useEffect(() => {
    setContactData(contactInfo);
  }, [contactInfo]);

  const handleUpdateAbout = (e: React.FormEvent) => {
    e.preventDefault();
    updateAboutInfo(aboutData);
    setIsEditingAbout(false);
    toast.success("Hakkımızda bilgileri güncellendi!");
  };

  const handleUpdateContact = (e: React.FormEvent) => {
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
    updateContactInfo(updatedContactData);
    setContactData(updatedContactData);
    setIsEditingContact(false);
    toast.success("İletişim bilgileri güncellendi!");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Dosya boyutu 5MB'dan küçük olmalıdır.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData({ ...formData, imageUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Video boyutu 10MB'dan küçük olmalıdır.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, videoUrl: base64String });
        toast.success("Video başarıyla yüklendi.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.priceEUR || !formData.priceTRY || !formData.imageUrl || !formData.mainCategory || !formData.subCategory || !formData.productCode || !formData.colorCode) {
      toast.error("Lütfen zorunlu alanları doldurun.");
      return;
    }

    if (editingProductId) {
      updateProduct(editingProductId, {
        name: formData.name,
        description: formData.description,
        priceEUR: parseFloat(formData.priceEUR),
        priceTRY: parseFloat(formData.priceTRY),
        imageUrl: formData.imageUrl,
        mainCategory: formData.mainCategory,
        subCategory: formData.subCategory,
        productCode: formData.productCode,
        colorCode: formData.colorCode,
        videoUrl: formData.videoUrl || undefined,
      });
      toast.success("Ürün başarıyla güncellendi.");
    } else {
      addProduct({
        name: formData.name,
        description: formData.description,
        priceEUR: parseFloat(formData.priceEUR),
        priceTRY: parseFloat(formData.priceTRY),
        imageUrl: formData.imageUrl,
        mainCategory: formData.mainCategory,
        subCategory: formData.subCategory,
        productCode: formData.productCode,
        colorCode: formData.colorCode,
        videoUrl: formData.videoUrl || undefined,
      });
      toast.success("Ürün başarıyla eklendi.");
    }

    setFormData({ name: "", description: "", priceEUR: "", priceTRY: "", imageUrl: "", mainCategory: mainCategories[0], subCategory: subCategories[0], productCode: "", colorCode: "", videoUrl: "" });
    setImagePreview(null);
    setIsAdding(false);
    setEditingProductId(null);
  };

  const handleEdit = (id: string) => {
    const productToEdit = products.find(p => p.id === id);
    if (productToEdit) {
      setFormData({
        name: productToEdit.name,
        description: productToEdit.description || "",
        priceEUR: productToEdit.priceEUR.toString(),
        priceTRY: productToEdit.priceTRY.toString(),
        imageUrl: productToEdit.imageUrl,
        mainCategory: productToEdit.mainCategory,
        subCategory: productToEdit.subCategory,
        productCode: productToEdit.productCode,
        colorCode: productToEdit.colorCode || "",
        videoUrl: productToEdit.videoUrl || "",
      });
      setImagePreview(productToEdit.imageUrl);
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

  const handleAddBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (banners.length >= 3) {
      toast.error("En fazla 3 banner ekleyebilirsiniz!");
      return;
    }
    
    addBanner({
      imageUrl: bannerData.imageUrl,
      title: bannerData.title || undefined,
    });
    
    setBannerData({ imageUrl: "", title: "" });
    setIsAddingBanner(false);
    toast.success("Banner başarıyla eklendi!");
  };

  const handleDelete = (id: string) => {
    removeProduct(id);
    toast.success("Ürün silindi.");
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
            <Button variant="outline" onClick={() => setIsAddingBanner(!isAddingBanner)} className="text-xs md:text-sm">
              <PlusCircle className="mr-1 md:mr-2 h-4 w-4" />
              {isAddingBanner ? "İptal" : "Banner Yönetimi"}
            </Button>
            <Button onClick={() => {
              if (isAdding) {
                setIsAdding(false);
                setEditingProductId(null);
                setFormData({ name: "", description: "", priceEUR: "", priceTRY: "", imageUrl: "", mainCategory: mainCategories[0], subCategory: subCategories[0], productCode: "", colorCode: "", videoUrl: "" });
                setImagePreview(null);
              } else {
                setIsAdding(true);
              }
            }} className="text-xs md:text-sm">
              <PlusCircle className="mr-1 md:mr-2 h-4 w-4" />
              {isAdding ? "İptal" : "Yeni Ürün Ekle"}
            </Button>
          </div>
        </div>

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
                      onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
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
                  <Label htmlFor="imageFile">Ürün Görseli *</Label>
                  <div className="flex flex-col gap-4">
                    <Input
                      id="imageFile"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                    {imagePreview && (
                      <div className="relative w-full h-40 rounded-md overflow-hidden border border-border">
                        <img 
                          src={imagePreview} 
                          alt="Önizleme" 
                          className="w-full h-full object-cover"
                        />
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
                <Label htmlFor="videoUrl">Video URL veya Dosya (İsteğe Bağlı)</Label>
                <div className="flex flex-col gap-2">
                  <Input
                    id="videoUrl"
                    value={formData.videoUrl || ""}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="Örn: https://youtube.com/watch?v=... veya doğrudan video linki"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">veya bilgisayardan yükle:</span>
                    <Input
                      id="videoFile"
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="cursor-pointer flex-1"
                    />
                  </div>
                  {formData.videoUrl && formData.videoUrl.startsWith('data:video') && (
                    <div className="text-xs text-green-600 font-medium">
                      ✓ Video dosyası yüklendi
                    </div>
                  )}
                </div>
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
