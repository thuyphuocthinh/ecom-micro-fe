import { Link } from "react-router";
import { Card, Image, Tag, Button } from "@ecom/ui";
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
    <Card
      className={`group flex flex-col h-full overflow-hidden transition-all duration-200 hover:shadow-md hover:border-brand/40 bg-white ${
        isOutOfStock ? "opacity-75" : ""
      }`}
    >
      {/* Product Image & Badges */}
      <Link
        to={`/products/${product.id}`}
        aria-label={`Xem chi tiết ${product.name}`}
        className="relative block aspect-square w-full overflow-hidden bg-canvas cursor-pointer"
      >
        <Image
          src={product.thumbnail || undefined}
          alt={product.name}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
          {product.onSale && discountBadge ? (
            <Tag tone="sale" className="font-bold shadow-xs">
              {discountBadge}
            </Tag>
          ) : (
            <div />
          )}

          {isOutOfStock && (
            <Tag tone="default" className="font-medium bg-white/90 shadow-xs">
              Hết hàng
            </Tag>
          )}
        </div>
      </Link>

      {/* Product Information */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 gap-2.5">
        {categoryName && (
          <span className="text-xs font-medium text-muted uppercase tracking-wider truncate">
            {categoryName}
          </span>
        )}

        <Link
          to={`/products/${product.id}`}
          className="text-ink font-semibold text-[15px] sm:text-base leading-snug line-clamp-2 group-hover:text-brand transition-colors"
        >
          {product.name}
        </Link>

        {/* Price Area */}
        <div className="mt-auto pt-2 flex flex-wrap items-baseline gap-2">
          <span className="tnum font-bold text-base sm:text-lg text-ink">
            {priceLabel}
          </span>
          {product.onSale && maxOriginalPrice > (product.minPrice ?? 0) && (
            <span className="tnum text-xs text-muted line-through">
              {formatVnd(maxOriginalPrice)}
            </span>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2">
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
              className="w-full justify-center group-hover:bg-brand group-hover:text-white transition-colors"
            >
              <Icon name="cart" size={16} />
              <span>Thêm vào giỏ</span>
            </Button>
          ) : (
            <Link
              to={`/products/${product.id}`}
              className="inline-flex items-center justify-center w-full min-h-[38px] px-3 rounded-control font-semibold text-[14px] border border-line bg-white text-ink hover:bg-canvas hover:border-brand/40 transition-colors"
            >
              Xem chi tiết
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}
