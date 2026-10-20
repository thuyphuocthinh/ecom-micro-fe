import type { Product } from "@/types";
import { ProductCard } from "./ProductCard.tsx";
import { ProductsEmptyState } from "./ProductsEmptyState.tsx";

export interface ProductGridProps {
  products: Product[];
  categoryNames?: Record<string, string>;
  isLoading?: boolean;
  /** These are the previous results, shown while the new ones load: dimmed and marked busy. */
  isStale?: boolean;
  skeletonCount?: number;
  onAddToCart?: (product: Product) => void;
  /** Whether a product is on its way to the cart (its card shows a spinner). */
  isAdding?: (productId: string) => boolean;
  onClearFilters?: () => void;
}

export function ProductGrid({
  products,
  categoryNames = {},
  isLoading = false,
  isStale = false,
  skeletonCount = 6,
  onAddToCart,
  isAdding,
  onClearFilters,
}: ProductGridProps) {
  if (isLoading) {
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

  return (
    <div
      data-testid="product-grid"
      aria-busy={isStale}
      className={`relative min-w-0 transition-opacity duration-150 ${
        isStale ? "opacity-60" : ""
      }`}
    >
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-7 gap-x-5 list-none m-0 p-0">
        {products.map((product) => (
          <li key={product.id} className="h-full flex flex-col">
            <ProductCard
              product={product}
              categoryName={categoryNames[product.categoryId]}
              onAddToCart={onAddToCart}
              isAdding={isAdding?.(product.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
