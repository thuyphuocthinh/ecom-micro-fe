import { Link } from "react-router";
import { Tag, Button, buttonClasses } from "@ecom/ui";
import type { Product, Sku } from "@/types";
import {
  formatVnd,
  formatDiscountBadge,
} from "@/features/products/utils/product-format.ts";
import { getSkuStockStatus } from "@/features/products/utils/product-detail-format.ts";
import { ProductSkuSelector } from "./ProductSkuSelector.tsx";
import { ProductQuantityStepper } from "./ProductQuantityStepper.tsx";
import { ProductGuaranteesCard } from "./ProductGuaranteesCard.tsx";

export interface ProductBuyBoxProps {
  product: Product;
  selectedSku: Sku;
  quantity: number;
  categoryName?: string;
  isAddingToCart?: boolean;
  onSelectSku: (skuId: string) => void;
  onChangeQuantity: (qty: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export function ProductBuyBox({
  product,
  selectedSku,
  quantity,
  categoryName,
  isAddingToCart = false,
  onSelectSku,
  onChangeQuantity,
  onAddToCart,
  onBuyNow,
}: ProductBuyBoxProps) {
  const stockInfo = getSkuStockStatus(selectedSku);
  const isSoldOut = stockInfo.soldOut;

  // Pricing calculations
  const price = selectedSku.price ?? product.minPrice ?? 0;
  const oldPrice =
    selectedSku.compareAtPrice ?? selectedSku.originalPrice ?? null;
  const hasDiscount = Boolean(oldPrice && oldPrice > price);
  const discountPercent =
    selectedSku.discountPercent ||
    (hasDiscount && oldPrice
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : 0);
  const discountBadge = formatDiscountBadge(discountPercent);

  // Rating & Reviews display
  const ratingValue = product.rating ?? 4.8;
  const reviewsCount = product.reviewsCount ?? 1240;
  const formattedReviews = new Intl.NumberFormat("vi-VN").format(reviewsCount);

  // Category URL
  const categoryHref = product.categoryId
    ? `/search?category=${encodeURIComponent(product.categoryId)}`
    : "/search";

  // SKU code
  const skuCode =
    selectedSku.skuCode || selectedSku.code || product.id.slice(0, 8);

  return (
    <section
      aria-labelledby="pd-title"
      className="flex-1 min-w-[280px] sm:min-w-[360px] lg:max-w-[500px] flex flex-col gap-5"
    >
      {/* Category Link Tag & Title & Rating */}
      <div className="flex flex-col gap-2.5">
        {categoryName && (
          <Link
            to={categoryHref}
            className="self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12.5px] font-semibold bg-brand-tint text-brand-dark hover:opacity-90 transition-opacity"
          >
            {categoryName}
          </Link>
        )}

        <h1
          id="pd-title"
          className="font-head text-[30px] sm:text-[36px] font-bold text-ink leading-[1.15] tracking-tight"
        >
          {product.name}
        </h1>

        {/* Rating & Reviews */}
        <div className="flex items-center gap-2 text-muted text-[14.5px] flex-wrap">
          <svg
            aria-hidden="true"
            className="size-4.5 fill-amber-400 stroke-amber-400 shrink-0"
            viewBox="0 0 24 24"
          >
            <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
          </svg>
          <span className="font-semibold text-ink tnum">
            <span className="sr-only">Đánh giá </span>
            {new Intl.NumberFormat("vi-VN", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            }).format(ratingValue)}
          </span>
          <span className="tnum">({formattedReviews} đánh giá)</span>
        </div>
      </div>

      {/* Price Display */}
      <div
        aria-live="polite"
        className="flex items-baseline gap-3 flex-wrap py-1"
      >
        <span className="font-head text-[32px] sm:text-[38px] font-bold text-ink tracking-tight tnum">
          {formatVnd(price)}
        </span>
        {hasDiscount && (
          <>
            <s className="tnum text-muted text-[17px]">
              <span className="sr-only">Giá cũ </span>
              {formatVnd(oldPrice)}
            </s>
            {discountBadge && (
              <Tag tone="sale" className="font-semibold px-2.5 py-0.5">
                {discountBadge}
              </Tag>
            )}
          </>
        )}
      </div>

      {/* Short Description */}
      {product.description && (
        <p className="text-ink-2 text-[15px] leading-relaxed line-clamp-3">
          {product.description}
        </p>
      )}

      {/* SKU Variant Selector */}
      {product.skus && product.skus.length > 0 && (
        <ProductSkuSelector
          skus={product.skus}
          selectedSkuId={selectedSku.id}
          onSelectSku={onSelectSku}
        />
      )}

      {/* Stock Status Badge & SKU Code */}
      <div
        aria-live="polite"
        className="flex items-center gap-2.5 flex-wrap text-[13.5px]"
      >
        <Tag tone={stockInfo.tone} className="font-semibold">
          {stockInfo.label}
        </Tag>
        <span className="text-muted">
          Mã sản phẩm:{" "}
          <span translate="no" className="font-medium text-ink-2">
            {skuCode}
          </span>
        </span>
      </div>

      {/* Actions: In Stock vs Sold Out */}
      {!isSoldOut ? (
        <div className="flex flex-col gap-3.5 pt-1">
          {/* Quantity Stepper */}
          <ProductQuantityStepper
            quantity={quantity}
            max={
              typeof selectedSku.stock === "number" && selectedSku.stock > 0
                ? selectedSku.stock
                : 99
            }
            onChange={onChangeQuantity}
          />

          {/* Add to Cart & Buy Now Buttons */}
          <div className="flex gap-3 flex-wrap pt-1">
            <Button
              variant="primary"
              size="lg"
              onClick={onAddToCart}
              loading={isAddingToCart}
              className="flex-1 min-w-[180px] shadow-xs cursor-pointer font-semibold gap-2"
            >
              <svg
                aria-hidden="true"
                className="size-5 stroke-current stroke-2 fill-none"
                viewBox="0 0 24 24"
              >
                <path d="M3 4h2.2l2.1 11.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L20.5 8H6.2" />
                <circle cx="10" cy="20" r="1.2" />
                <circle cx="17" cy="20" r="1.2" />
              </svg>
              <span>{isAddingToCart ? "Đang thêm..." : "Thêm vào giỏ"}</span>
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={onBuyNow}
              disabled={isAddingToCart}
              className="flex-1 min-w-[140px] font-semibold cursor-pointer"
            >
              Mua ngay
            </Button>
          </div>
        </div>
      ) : (
        /* Out of Stock Notice Card */
        <div className="border border-line rounded-[14px] bg-canvas/40 p-4 flex flex-col gap-3">
          <p className="text-ink-2 text-[14.5px] m-0">
            Màu này tạm hết hàng. Bạn có thể chọn màu khác ở trên hoặc xem các
            sản phẩm tương tự.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Button
              variant="primary"
              size="lg"
              disabled
              aria-disabled="true"
              className="opacity-60 cursor-not-allowed font-semibold"
            >
              Hết hàng
            </Button>
            <Link
              to={categoryHref}
              className={buttonClasses({ variant: "secondary", size: "lg" })}
            >
              Xem sản phẩm tương tự
            </Link>
          </div>
        </div>
      )}

      {/* Store Guarantees Card */}
      <ProductGuaranteesCard />
    </section>
  );
}
