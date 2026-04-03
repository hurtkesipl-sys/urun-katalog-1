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
  const { products, addProduct, removeProduct } = useProductStore();
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priceEUR: "",
    priceTRY: "",
    imageUrl: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.priceEUR || !formData.priceTRY || !formData.imageUrl) {
      toast.error("Lütfen zorunlu alanları doldurun.");
      return;
    }

    addProduct({
      name: formData.name,
      description: formData.description,
      priceEUR: parseFloat(formData.priceEUR),
      priceTRY: parseFloat(formData.priceTRY),
      imageUrl: formData.imageUrl,
    });

    toast.success("Ürün başarıyla eklendi.");
    setFormData({ name: "", description: "", priceEUR: "", priceTRY: "", imageUrl: "" });
    setIsAdding(false);
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
