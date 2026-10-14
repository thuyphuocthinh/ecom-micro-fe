import type { Product } from "@/types";
import { ProductCard } from "./ProductCard.tsx";
import { ProductsEmptyState } from "./ProductsEmptyState.tsx";

export interface ProductGridProps {
  products: Product[];
  categoryNames?: Record<string, string>;
  isLoading?: boolean;
  isFetching?: boolean;
  skeletonCount?: number;
  onAddToCart?: (product: Product) => void;
  onClearFilters?: () => void;
}

export function ProductGrid({
  products,
  categoryNames = {},
  isLoading = false,
  isFetching = false,
  skeletonCount = 6,
  onAddToCart,
  onClearFilters,
}: ProductGridProps) {
  if (isLoading && products.length === 0) {
    return (
      <div
        data-testid="product-grid-loading"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-7 gap-x-5"
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3 animate-pulse">
            <div className="w-full aspect-square bg-line/60 rounded-[18px]" />
            <div className="h-4 bg-line/60 rounded w-1/3 mt-2" />
            <div className="h-5 bg-line/60 rounded w-4/5" />
            <div className="h-6 bg-line/60 rounded w-1/2" />
            <div className="h-4 bg-line/40 rounded w-1/4" />
            <div className="h-11 bg-line/60 rounded-[10px] w-full mt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <ProductsEmptyState onClearFilters={onClearFilters} />;
  }

  const isTransitioning = isFetching && !isLoading;

  return (
    <div className="relative min-w-0">
      {/* Subtle top indicator bar when updating filter results */}
      {isTransitioning && (
        <div
          role="status"
          aria-label="Đang cập nhật..."
          className="absolute -top-3.5 inset-x-0 h-1 bg-brand/10 overflow-hidden rounded-full z-10"
        >
          <div className="h-full w-2/5 bg-brand rounded-full animate-pulse mx-auto" />
        </div>
      )}

      <ul
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-7 gap-x-5 list-none m-0 p-0 transition-all duration-300 ${
          isTransitioning
            ? "opacity-60 pointer-events-none scale-[0.998]"
            : "opacity-100 scale-100"
        }`}
      >
        {products.map((product) => (
          <li
            key={product.id}
            className="h-full flex flex-col transition-all duration-300"
          >
            <ProductCard
              product={product}
              categoryName={categoryNames[product.categoryId]}
              onAddToCart={onAddToCart}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
