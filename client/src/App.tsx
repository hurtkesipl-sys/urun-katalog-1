import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/login"} component={Login} />
      <Route path={"/product/:id"} component={ProductDetail} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  useEffect(() => {
    // Seed data if empty
    const storage = localStorage.getItem('product-storage');
    if (!storage || !JSON.parse(storage).state.products[0]?.productCode) {
      const seedData = {"state":{"products":[{"id":"1","name":"İtalyan İpek Elbise (Siyah)","description":"%100 saf ipekten üretilmiş, zarif dökümlü yazlık elbise. Toptan alımlar için özel fiyat.","priceEUR":45.00,"priceTRY":1575.00,"imageUrl":"https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800","mainCategory":"İpek","subCategory":"Elbise","productCode":"ELB-001","colorCode":"#000000","createdAt":1775254171547},{"id":"1-2","name":"İtalyan İpek Elbise (Beyaz)","description":"%100 saf ipekten üretilmiş, zarif dökümlü yazlık elbise. Toptan alımlar için özel fiyat.","priceEUR":45.00,"priceTRY":1575.00,"imageUrl":"https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800","mainCategory":"İpek","subCategory":"Elbise","productCode":"ELB-001","colorCode":"#ffffff","createdAt":1775254171548},{"id":"2","name":"Keten Klasik Takım","description":"Nefes alabilen İtalyan keteninden üretilmiş, yazlık klasik takım elbise.","priceEUR":85.00,"priceTRY":2975.00,"imageUrl":"https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&q=80&w=800","mainCategory":"Keten","subCategory":"Takım","productCode":"TKM-001","colorCode":"#f5f5dc","createdAt":1775254170547},{"id":"3","name":"Viskon Dökümlü Bluz","description":"Yumuşak dokulu viskon kumaştan, günlük kullanıma uygun şık bluz.","priceEUR":18.50,"priceTRY":647.50,"imageUrl":"https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&q=80&w=800","mainCategory":"Viskon","subCategory":"Bluz","productCode":"BLZ-001","colorCode":"#ff0000","createdAt":1775254169547},{"id":"4","name":"Pamuklu Basic Gömlek","description":"Yüksek kaliteli İtalyan pamuğundan üretilmiş, her dolapta bulunması gereken basic gömlek.","priceEUR":22.00,"priceTRY":770.00,"imageUrl":"https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=800","mainCategory":"Pamuk","subCategory":"Gömlek","productCode":"GMK-001","colorCode":"#ffffff","createdAt":1775254168547}],"mainCategories":["İpek","Keten","Viskon","Pamuk"],"subCategories":["Elbise","Takım","Bluz","Gömlek","Etek","Pantolon"]},"version":0};
      localStorage.setItem('product-storage', JSON.stringify(seedData));
      window.location.reload();
    }
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
