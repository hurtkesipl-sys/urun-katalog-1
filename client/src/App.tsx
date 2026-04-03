import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/admin"} component={Admin} />
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
    if (!storage || !JSON.parse(storage).state.products[0]?.mainCategory) {
      const seedData = {"state":{"products":[{"id":"1","name":"İtalyan İpek Elbise","description":"%100 saf ipekten üretilmiş, zarif dökümlü yazlık elbise. Toptan alımlar için özel fiyat.","priceEUR":45.00,"priceTRY":1575.00,"imageUrl":"https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800","mainCategory":"İpek","subCategory":"Elbise","createdAt":1775254171547},{"id":"2","name":"Keten Klasik Takım","description":"Nefes alabilen İtalyan keteninden üretilmiş, yazlık klasik takım elbise.","priceEUR":85.00,"priceTRY":2975.00,"imageUrl":"https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&q=80&w=800","mainCategory":"Keten","subCategory":"Takım","createdAt":1775254170547},{"id":"3","name":"Viskon Dökümlü Bluz","description":"Yumuşak dokulu viskon kumaştan, günlük kullanıma uygun şık bluz.","priceEUR":18.50,"priceTRY":647.50,"imageUrl":"https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&q=80&w=800","mainCategory":"Viskon","subCategory":"Bluz","createdAt":1775254169547},{"id":"4","name":"Pamuklu Basic Gömlek","description":"Yüksek kaliteli İtalyan pamuğundan üretilmiş, her dolapta bulunması gereken basic gömlek.","priceEUR":22.00,"priceTRY":770.00,"imageUrl":"https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=800","mainCategory":"Pamuk","subCategory":"Gömlek","createdAt":1775254168547}],"mainCategories":["İpek","Keten","Viskon","Pamuk"],"subCategories":["Elbise","Takım","Bluz","Gömlek","Etek","Pantolon"]},"version":0};
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
