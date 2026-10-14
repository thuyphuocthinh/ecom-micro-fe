import type { Product } from "@/types";
import { ProductCard } from "./ProductCard.tsx";
import { ProductsEmptyState } from "./ProductsEmptyState.tsx";

export interface ProductGridProps {
  products: Product[];
  categoryNames?: Record<string, string>;
  isLoading?: boolean;
  skeletonCount?: number;
  onAddToCart?: (product: Product) => void;
  onClearFilters?: () => void;
}

export function ProductGrid({
  products,
  categoryNames = {},
  isLoading = false,
  skeletonCount = 8,
  onAddToCart,
  onClearFilters,
}: ProductGridProps) {
  if (isLoading && products.length === 0) {
    return (
      <div
        data-testid="product-grid-loading"
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col rounded-card border border-line bg-white p-4 gap-3 animate-pulse"
          >
            <div className="w-full aspect-square bg-slate-100 rounded-lg" />
            <div className="h-4 bg-slate-100 rounded w-1/3" />
            <div className="h-5 bg-slate-100 rounded w-full" />
            <div className="h-6 bg-slate-100 rounded w-1/2 mt-auto" />
            <div className="h-9 bg-slate-100 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <ProductsEmptyState onClearFilters={onClearFilters} />;
  }

  return (
    <ul className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 list-none m-0 p-0">
      {products.map((product) => (
        <li key={product.id} className="h-full">
          <ProductCard
            product={product}
            categoryName={categoryNames[product.categoryId]}
            onAddToCart={onAddToCart}
          />
        </li>
      ))}
    </ul>
  );
}
