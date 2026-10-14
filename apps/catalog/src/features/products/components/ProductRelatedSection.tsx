import { Link } from "react-router";
import type { Product } from "@/types";
import { ProductCard } from "./ProductCard.tsx";

export interface ProductRelatedSectionProps {
  products: Product[];
  categoryId?: string;
  categoryName?: string;
}

export function ProductRelatedSection({
  products,
  categoryId,
  categoryName,
}: ProductRelatedSectionProps) {
  if (!products || products.length === 0) {
    return null;
  }

  const searchHref = categoryId
    ? `/search?category=${encodeURIComponent(categoryId)}`
    : "/search";

  return (
    <section
      aria-labelledby="rel-title"
      className="mt-16 pt-12 border-t border-line"
    >
      <div className="flex justify-between items-baseline gap-4 mb-6 flex-wrap">
        <h2
          id="rel-title"
          className="font-head text-[26px] sm:text-[28px] font-bold text-ink tracking-tight"
        >
          Có thể bạn cũng thích
        </h2>
        <Link
          to={searchHref}
          className="text-brand font-semibold text-[15px] underline underline-offset-4 hover:text-brand-dark transition-colors"
        >
          Xem tất cả sản phẩm
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            categoryName={categoryName}
          />
        ))}
      </div>
    </section>
  );
}
