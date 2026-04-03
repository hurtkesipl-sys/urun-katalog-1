import { Link } from "wouter";

export default function Navbar() {
  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/">
          <a className="flex items-center gap-2">
            <span className="font-serif text-xl font-bold tracking-tight">Lumina</span>
            <span className="text-muted-foreground text-sm font-medium">Katalog</span>
          </a>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <a className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Yönetim Paneli
            </a>
          </Link>
        </div>
      </div>
    </nav>
  );
}
