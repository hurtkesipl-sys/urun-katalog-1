import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { getLoginUrl } from "@/const";

export default function Login() {
  const [, setLocation] = useLocation();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Eğer kullanıcı giriş yapmışsa ve admin ise admin paneline yönlendir
    if (!loading && isAuthenticated && user?.role === "admin") {
      setLocation("/admin");
    }
  }, [loading, isAuthenticated, user, setLocation]);

  const handleLogin = () => {
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="font-serif text-2xl font-bold mb-2">Yönetim Paneli Girişi</h1>
            <p className="text-muted-foreground text-sm">
              Devam etmek için Manus hesabınızla giriş yapın.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : isAuthenticated ? (
            <div className="text-center space-y-4">
              {user?.role === "admin" ? (
                <p className="text-green-600 font-medium">Admin olarak giriş yapıldı. Yönlendiriliyor...</p>
              ) : (
                <p className="text-destructive font-medium">Bu hesabın yönetici yetkisi bulunmuyor.</p>
              )}
            </div>
          ) : (
            <Button onClick={handleLogin} className="w-full">
              Manus ile Giriş Yap
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
