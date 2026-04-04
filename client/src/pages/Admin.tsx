import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useProductStore } from "@/store";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const { products, mainCategories, subCategories, addProduct, removeProduct, addSubCategory, isAdmin } = useProductStore();
  const [isAdding, setIsAdding] = useState(false);
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
    mainCategory: "",
    subCategory: "",
    productCode: "",
    colorCode: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.priceEUR || !formData.priceTRY || !formData.imageUrl || !formData.mainCategory || !formData.subCategory || !formData.productCode || !formData.colorCode) {
      toast.error("Lütfen zorunlu alanları doldurun.");
      return;
    }

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
    });

    toast.success("Ürün başarıyla eklendi.");
    setFormData({ name: "", description: "", priceEUR: "", priceTRY: "", imageUrl: "", mainCategory: "", subCategory: "", productCode: "", colorCode: "" });
    setImagePreview(null);
    setIsAdding(false);
  };

  const handleAddSubCategory = () => {
    if (!newSubCategory.trim()) return;
    addSubCategory(newSubCategory.trim());
    setFormData({ ...formData, subCategory: newSubCategory.trim() });
    setNewSubCategory("");
    toast.success("Ürün tipi eklendi.");
  };

  const handleDelete = (id: string) => {
    removeProduct(id);
    toast.success("Ürün silindi.");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground">Yönetim Paneli</h1>
          <Button onClick={() => setIsAdding(!isAdding)} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            {isAdding ? "İptal" : "Yeni Ürün Ekle"}
          </Button>
        </div>

        {isAdding && (
          <div className="bg-card border border-border rounded-lg p-6 mb-12 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Yeni Ürün Detayları</h2>
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
                    <Label htmlFor="colorCode">Renk Kodu *</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="colorCode"
                        value={formData.colorCode || "#000000"}
                        onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                        className="h-9 w-12 rounded cursor-pointer border-0 p-0"
                      />
                      <Input
                        value={formData.colorCode}
                        onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
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
                Ürünü Kaydet
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
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
