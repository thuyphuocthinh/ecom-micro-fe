import { Link } from "react-router";
import { Image, Tag, Button, Tooltip } from "@ecom/ui";
import { Icon } from "@/components/common/Icon.tsx";
import type { Product } from "@/types";
import {
  formatProductPriceLabel,
  formatDiscountBadge,
  formatVnd,
} from "../utils/product-format.ts";

export interface ProductCardProps {
  product: Product;
  categoryName?: string;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({
  product,
  categoryName,
  onAddToCart,
}: ProductCardProps) {
  const isOutOfStock = product.inStock === false;
  const priceLabel = formatProductPriceLabel(
    product.minPrice,
    product.skus?.length || 1,
  );
  const discountBadge = formatDiscountBadge(product.discountPercent);

  // Original price for strikethrough if on sale
  const maxOriginalPrice = product.skus?.reduce(
    (max, sku) => Math.max(max, sku.originalPrice ?? 0),
    0,
  );

  return (
    <div
      className={`group flex flex-col h-full ${
        isOutOfStock ? "opacity-75" : ""
      }`}
    >
      {/* Product Image & Badges */}
      <Link
        to={`/products/${product.id}`}
        aria-label={`Xem chi tiết ${product.name}`}
        className="product-link block cursor-pointer"
      >
        <div className="relative aspect-square w-full rounded-[18px] overflow-hidden bg-canvas border border-line/40">
          <Image
            src={product.thumbnail || undefined}
            alt={product.name}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
            {product.onSale && discountBadge ? (
              <Tag tone="sale" className="font-semibold shadow-xs">
                {discountBadge}
              </Tag>
            ) : (
              <div />
            )}

            {isOutOfStock && (
              <Tag tone="default" className="font-medium bg-white/95 shadow-xs">
                Hết hàng
              </Tag>
            )}
          </div>
        </div>

        {/* Category & Title with Tooltip & Fixed 2-Line Height */}
        <div className="mt-3 flex flex-col gap-1">
          {categoryName && (
            <span className="text-xs font-medium text-muted uppercase tracking-wider truncate">
              {categoryName}
            </span>
          )}
          <Tooltip content={product.name} className="w-full">
            <h2 className="product-name text-ink font-medium text-[15px] leading-snug line-clamp-2 h-[44px] group-hover:text-brand transition-colors w-full text-left">
              {product.name}
            </h2>
          </Tooltip>
        </div>
      </Link>

      {/* Bottom Area: Price, Rating & Action Button (Aligned to bottom) */}
      <div className="mt-auto pt-2 flex flex-col">
        {/* Price Area: Distinctive, eye-catching pricing */}
        <div className="flex flex-wrap items-baseline gap-2 min-h-[28px]">
          <span
            className={`tnum font-bold text-[18px] sm:text-[19px] tracking-tight ${
              product.onSale ? "text-sale" : "text-brand"
            }`}
          >
            {priceLabel}
          </span>
          {product.onSale && maxOriginalPrice > (product.minPrice ?? 0) && (
            <span className="tnum text-[13px] text-muted/80 line-through">
              {formatVnd(maxOriginalPrice)}
            </span>
          )}
        </div>

        {/* Rating & Reviews */}
        <div className="mt-1 flex items-center gap-1.5 text-[13.5px] text-muted">
          <svg
            className="size-4 fill-[#f2a900] stroke-[#f2a900] shrink-0"
            aria-hidden="true"
            viewBox="0 0 24 24"
          >
            <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
          </svg>
          <span className="tnum font-medium text-ink">
            <span className="sr-only">Đánh giá </span>4.8
          </span>
          <span className="tnum" aria-hidden="true">
            (120)
          </span>
        </div>

        {/* Action Button */}
        <div className="mt-3">
          {isOutOfStock ? (
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled
              className="w-full justify-center text-muted"
            >
              Hết hàng
            </Button>
          ) : onAddToCart ? (
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => onAddToCart(product)}
              className="w-full justify-center group-hover:border-ink-2 transition-colors"
            >
              <Icon name="cart" size={16} />
              <span>Thêm vào giỏ</span>
            </Button>
          ) : (
            <Link
              to={`/products/${product.id}`}
              className="inline-flex items-center justify-center w-full min-h-[44px] px-4 rounded-control font-semibold text-[15px] border border-line bg-white text-ink hover:bg-canvas hover:border-ink-2 transition-colors"
            >
              Xem chi tiết
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
