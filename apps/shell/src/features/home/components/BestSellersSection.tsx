import { Link } from "react-router";
import { useHomeBestsellersQuery } from "@/features/home/hooks/useHomeCatalog.ts";
import { HomeProductCard } from "@/features/home/components/HomeProductCard.tsx";
import { SectionStatus } from "@/features/home/components/SectionStatus.tsx";
import type { HomeProduct } from "@/features/home/types/home.ts";

export interface BestSellersSectionProps {
  onAddToCart: (product: HomeProduct) => void;
  products?: HomeProduct[];
}

function ProductCardSkeleton() {
  return (
    <li className="flex flex-col gap-3 animate-pulse">
      <div className="aspect-square rounded-[18px] bg-canvas-sunken" />
      <div className="h-4 bg-canvas-sunken rounded w-3/4 mt-3" />
      <div className="h-5 bg-canvas-sunken rounded w-1/2" />
      <div className="h-4 bg-canvas-sunken rounded w-1/3" />
      <div className="h-11 bg-canvas-sunken rounded-control mt-auto" />
    </li>
  );
}

export function BestSellersSection({
  onAddToCart,
  products: propProducts,
}: BestSellersSectionProps) {
  const {
    products: queriedProducts,
    isLoading,
    isError,
    refetch,
  } = useHomeBestsellersQuery();
  const products = propProducts ?? queriedProducts;
  const showSkeleton = propProducts === undefined && isLoading;
  const showError = propProducts === undefined && isError && !isLoading;

  return (
    <section
      aria-labelledby="hot-title"
      className="max-w-[1280px] mx-auto px-4 sm:px-10 py-8 sm:py-10"
    >
      <div className="flex justify-between items-baseline gap-4 mb-6 flex-wrap">
        <h2
          id="hot-title"
          className="font-head text-2xl sm:text-3xl font-bold text-ink"
        >
          Bán chạy tuần này
        </h2>

        <Link
          to="/search"
          className="font-semibold text-sm sm:text-base text-brand underline underline-offset-4 hover:text-brand-dark transition-colors"
        >
          Xem tất cả sản phẩm
        </Link>
      </div>

      {showError ? (
        <SectionStatus
          kind="error"
          emptyText=""
          errorText="Không tải được danh sách sản phẩm."
          onRetry={() => void refetch()}
        />
      ) : !showSkeleton && products.length === 0 ? (
        <SectionStatus kind="empty" emptyText="Chưa có sản phẩm nào" />
      ) : (
        <ul className="list-none m-0 p-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-5">
          {showSkeleton
            ? Array.from({ length: 8 }).map((_, idx) => (
                <ProductCardSkeleton key={`skeleton-${idx}`} />
              ))
            : products.map((product) => (
                <HomeProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                />
              ))}
        </ul>
      )}
    </section>
  );
}
