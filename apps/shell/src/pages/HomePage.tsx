import { HeroSection } from "@/features/home/components/HeroSection.tsx";
import { CategorySection } from "@/features/home/components/CategorySection.tsx";
import { BestSellersSection } from "@/features/home/components/BestSellersSection.tsx";
import { ValuePropsSection } from "@/features/home/components/ValuePropsSection.tsx";
import { useHomeAddToCart } from "@/features/home/hooks/useHomeAddToCart.ts";

export function HomePage() {
  const { addToCart } = useHomeAddToCart();

  return (
    <div className="min-h-screen">
      <HeroSection onAddToCart={addToCart} />
      <CategorySection />
      <BestSellersSection onAddToCart={addToCart} />
      <ValuePropsSection />
    </div>
  );
}
