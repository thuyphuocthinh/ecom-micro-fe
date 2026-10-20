import { HeroSection } from "@/features/home/components/HeroSection.tsx";
import { CategorySection } from "@/features/home/components/CategorySection.tsx";
import { BestSellersSection } from "@/features/home/components/BestSellersSection.tsx";
import { ValuePropsSection } from "@/features/home/components/ValuePropsSection.tsx";
import { useHomeAddToCart } from "@/features/home/hooks/useHomeAddToCart.ts";
import { useHomeBestsellersQuery } from "@/features/home/hooks/useHomeCatalog.ts";

export function HomePage() {
  const { addToCart, isAdding } = useHomeAddToCart();
  // The same query as the best sellers below, so it costs no extra request. The card of the hero shows
  // a product that is on sale when there is one, else the first.
  const { products } = useHomeBestsellersQuery();
  const featured = products.find((p) => p.oldPrice) ?? products[0] ?? null;

  return (
    <div className="min-h-screen">
      <HeroSection
        featured={featured}
        onAddToCart={addToCart}
        isAdding={featured ? isAdding(featured.skuId) : false}
      />
      <CategorySection />
      <BestSellersSection onAddToCart={addToCart} isAdding={isAdding} />
      <ValuePropsSection />
    </div>
  );
}
