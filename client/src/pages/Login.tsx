import { useState } from "react";
import { useLocation } from "wouter";
import { useProductStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

export default function Login() {
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { setAdmin } = useProductStore();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basit bir şifre kontrolü (Gerçek bir uygulamada backend'de yapılmalıdır)
    if (password === "admin123") {
      setAdmin(true);
      toast.success("Giriş başarılı!");
      setLocation("/admin");
    } else {
      toast.error("Hatalı şifre!");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="font-serif text-2xl font-bold mb-2">Yönetim Paneli Girişi</h1>
            <p className="text-muted-foreground text-sm">
              Devam etmek için lütfen yönetici şifrenizi girin.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifrenizi girin"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full">
              Giriş Yap
            </Button>
          </form>
          
          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>Not: Test için şifre "admin123" olarak belirlenmiştir.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
