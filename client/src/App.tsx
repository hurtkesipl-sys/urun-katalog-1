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
    if (!storage || !JSON.parse(storage).state.products[0]?.category) {
      const seedData = {"state":{"products":[{"id":"1","name":"İskandinav Ahşap Sandalye","description":"Doğal meşe ağacından üretilmiş, minimalist ve ergonomik tasarım. Uzun süreli oturumlar için ideal konfor sağlar.","priceEUR":149.99,"priceTRY":4500,"imageUrl":"https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&q=80&w=800","category":"Mobilya","createdAt":1775254171547},{"id":"2","name":"Modern Seramik Vazo","description":"El yapımı, mat yüzeyli seramik vazo. Kuru çiçekler veya tek başına dekoratif bir obje olarak kullanılabilir.","priceEUR":45.5,"priceTRY":1365,"imageUrl":"https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&q=80&w=800","category":"Dekorasyon","createdAt":1775254170547},{"id":"3","name":"Minimalist Masa Lambası","description":"Pirinç detaylı, ayarlanabilir başlıklı çalışma masası lambası. Sıcak ve odaklanmış bir ışık sunar.","priceEUR":89,"priceTRY":2670,"imageUrl":"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800","category":"Aydınlatma","createdAt":1775254169547},{"id":"4","name":"Keten Kırlent Kılıfı","description":"%100 doğal keten kumaştan üretilmiş, gizli fermuarlı kırlent kılıfı. Yıkanabilir ve dayanıklıdır.","priceEUR":24.9,"priceTRY":747,"imageUrl":"https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=800","category":"Tekstil","createdAt":1775254168547}],"categories":["Mobilya","Aydınlatma","Dekorasyon","Tekstil"]},"version":0};
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
