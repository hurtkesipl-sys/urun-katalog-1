import { useProductStore } from "@/hooks/useStore";
import Navbar from "@/components/Navbar";

export default function About() {
  const { aboutInfo } = useProductStore();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-center mb-12">
            {aboutInfo.title}
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {aboutInfo.imageUrl && (
              <div className="rounded-2xl overflow-hidden shadow-lg aspect-[4/5]">
                <img 
                  src={aboutInfo.imageUrl} 
                  alt={aboutInfo.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className={`flex flex-col justify-center ${!aboutInfo.imageUrl ? 'md:col-span-2 text-center' : ''}`}>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-lg">
                  {aboutInfo.content}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
