import { useState } from "react";
import { useProductStore } from "@/store";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const { products, categories, addProduct, removeProduct, addCategory } = useProductStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priceEUR: "",
    priceTRY: "",
    imageUrl: "",
    category: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.priceEUR || !formData.priceTRY || !formData.imageUrl || !formData.category) {
      toast.error("Lütfen zorunlu alanları doldurun.");
      return;
    }

    addProduct({
      name: formData.name,
      description: formData.description,
      priceEUR: parseFloat(formData.priceEUR),
      priceTRY: parseFloat(formData.priceTRY),
      imageUrl: formData.imageUrl,
      category: formData.category,
    });

    toast.success("Ürün başarıyla eklendi.");
    setFormData({ name: "", description: "", priceEUR: "", priceTRY: "", imageUrl: "", category: "" });
    setIsAdding(false);
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    addCategory(newCategory.trim());
    setFormData({ ...formData, category: newCategory.trim() });
    setNewCategory("");
    toast.success("Kategori eklendi.");
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
                    placeholder="Örn: İskandinav Ahşap Sandalye"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Görsel URL *</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
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
                  <Label htmlFor="category">Kategori *</Label>
                  <div className="flex gap-2">
                    <select
                      id="category"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="" disabled>Kategori Seçin</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Yeni kategori ekle"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                    />
                    <Button type="button" variant="outline" onClick={handleAddCategory}>Ekle</Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ürün hakkında detaylı bilgi..."
                  rows={4}
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
