import { Link } from "wouter";
import { useProductStore } from "@/store";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { isAdmin, setAdmin } = useProductStore();

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-xl font-bold tracking-tight">Moda İtalya</span>
          <span className="text-muted-foreground text-sm font-medium">Toptan</span>
        </Link>
        <div className="flex items-center gap-4">
          {isAdmin ? (
            <>
              <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Yönetim Paneli
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setAdmin(false)}
                className="text-xs h-8"
              >
                Çıkış Yap
              </Button>
            </>
          ) : (
            <Link href="/login" className="text-sm font-medium text-muted-foreground opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity">
              Admin
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
