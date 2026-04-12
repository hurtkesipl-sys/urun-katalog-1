import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { Loader2, Lock, Mail } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { user, loading, isAuthenticated, refresh } = useAuth();
  const isAdmin = user?.role === "admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await refresh();
      toast.success("Giriş başarılı! Yönetim paneline yönlendiriliyorsunuz...");
      setLocation("/admin");
    },
    onError: (err) => {
      toast.error(err.message || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
    },
  });

  useEffect(() => {
    if (!loading && isAuthenticated && isAdmin) {
      setLocation("/admin");
    }
  }, [loading, isAuthenticated, isAdmin, setLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("E-posta ve şifre alanları boş bırakılamaz.");
      return;
    }
    loginMutation.mutate({ email: email.trim(), password });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <h1 className="font-serif text-2xl font-bold mb-2">Yönetim Paneli Girişi</h1>
            <p className="text-muted-foreground text-sm">
              Devam etmek için yönetici hesabınızla giriş yapın.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : isAuthenticated && isAdmin ? (
            <div className="text-center">
              <p className="text-green-600 font-medium">Admin olarak giriş yapıldı. Yönlendiriliyor...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Kullanıcı Adı veya E-posta</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="text"
                    placeholder="Kullanıcı adı veya e-posta"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    autoComplete="email"
                    disabled={loginMutation.isPending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Şifre</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    autoComplete="current-password"
                    disabled={loginMutation.isPending}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Giriş yapılıyor...
                  </>
                ) : (
                  "Giriş Yap"
                )}
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
