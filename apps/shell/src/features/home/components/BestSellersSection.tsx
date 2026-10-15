import { Link } from "react-router";
import { BEST_SELLER_PRODUCTS } from "../data/home-data";
import { HomeProductCard } from "./HomeProductCard";
import type { HomeProduct } from "../types/home";

export interface BestSellersSectionProps {
  onAddToCart: (product: HomeProduct) => void;
  products?: HomeProduct[];
}

export function BestSellersSection({
  onAddToCart,
  products = BEST_SELLER_PRODUCTS,
}: BestSellersSectionProps) {
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

      <ul className="list-none m-0 p-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-5">
        {products.map((product) => (
          <HomeProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
      </ul>
    </section>
  );
}
