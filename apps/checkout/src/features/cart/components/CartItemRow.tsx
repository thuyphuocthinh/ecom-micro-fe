import { Link } from "react-router";
import { Tag, Image, Button, Icon } from "@ecom/ui";
import type { CartLineItem } from "@/types";
import {
  formatCurrency,
  formatAttributes,
  formatPriceDrop,
  formatLowStock,
} from "@/features/cart/utils/cart-format.ts";

export interface CartItemRowProps {
  item: CartLineItem;
  onUpdateQuantity: (skuId: string, quantity: number) => void;
  onRemove: (skuId: string) => void;
  disabled?: boolean;
}

export function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
  disabled = false,
}: CartItemRowProps) {
  const productName = item.productName || "Sản phẩm";
  const variantText = formatAttributes(item.attributes);
  const effectivePrice = item.price ?? item.addedPrice;
  const lineTotal = effectivePrice * item.quantity;

  const maxStock =
    typeof item.available === "number" ? Math.min(item.available, 99) : 99;
  const isAtMin = item.quantity <= 1;
  const isAtMax = item.quantity >= maxStock;

  const hasPriceDrop =
    typeof item.price === "number" && item.addedPrice > item.price;
  const priceDropText =
    hasPriceDrop && typeof item.price === "number"
      ? formatPriceDrop(item.addedPrice, item.price)
      : null;

  const isLowStock =
    (typeof item.available === "number" &&
      item.available > 0 &&
      item.available <= 5) ||
    item.flags.includes("notEnoughStock");
  const lowStockText =
    isLowStock && typeof item.available === "number"
      ? formatLowStock(item.available)
      : null;

  const productHref = item.productId
    ? `/products/${item.productId}`
    : "/search";

  return (
    <li
      data-testid={`cart-item-${item.skuId}`}
      className="grid grid-cols-[96px_minmax(0,1fr)_auto] gap-5 p-5 border-b border-line items-start last:border-b-0 bg-white"
    >
      {/* Thumbnail */}
      <div
        aria-hidden="true"
        className="w-24 h-24 rounded-[14px] overflow-hidden bg-canvas flex-shrink-0 relative border border-line/60"
      >
        <Image
          src={item.thumbnail || undefined}
          alt={productName}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Middle: Details, Stepper & Remove */}
      <div className="flex flex-col gap-1.5 min-w-0">
        <Link
          to={productHref}
          className="font-semibold text-[16px] text-ink hover:text-brand transition-colors line-clamp-2 no-underline"
        >
          {productName}
        </Link>

        {variantText && (
          <span className="text-muted text-[14px]">{variantText}</span>
        )}

        {priceDropText && (
          <Tag tone="ok" className="self-start mt-0.5">
            {priceDropText}
          </Tag>
        )}

        {lowStockText && (
          <Tag tone="warn" className="self-start mt-0.5">
            {lowStockText}
          </Tag>
        )}

        <div className="flex items-center gap-4 mt-1.5 flex-wrap">
          {/* Quantity Stepper */}
          <div
            role="group"
            aria-label={`Số lượng: ${productName}`}
            className="inline-flex items-center border border-line rounded-[10px] bg-white overflow-hidden shadow-2xs"
          >
            <button
              type="button"
              aria-label={`Giảm số lượng ${productName}`}
              disabled={disabled || isAtMin}
              onClick={() => onUpdateQuantity(item.skuId, item.quantity - 1)}
              className="w-11 h-11 flex items-center justify-center border-0 bg-transparent text-ink hover:bg-ink/6 disabled:text-muted/40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <Icon name="minus" size={16} strokeWidth={2} />
            </button>

            <span
              className="tnum min-w-9 text-center font-semibold text-[15px] text-ink select-none"
              aria-live="polite"
            >
              {item.quantity}
            </span>

            <button
              type="button"
              aria-label={`Tăng số lượng ${productName}`}
              disabled={disabled || isAtMax}
              onClick={() => onUpdateQuantity(item.skuId, item.quantity + 1)}
              className="w-11 h-11 flex items-center justify-center border-0 bg-transparent text-ink hover:bg-ink/6 disabled:text-muted/40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <Icon name="plus" size={16} strokeWidth={2} />
            </button>
          </div>

          {/* Remove Button */}
          <Button
            type="button"
            variant="ghost"
            size="md"
            disabled={disabled}
            aria-label={`Xoá ${productName} khỏi giỏ hàng`}
            onClick={() => onRemove(item.skuId)}
            className="min-h-11 px-2.5 text-err hover:text-err hover:bg-err/10 font-semibold text-[14px]"
          >
            Xoá
          </Button>
        </div>
      </div>

      {/* Right: Price */}
      <div className="text-right flex flex-col gap-0.5">
        <span className="tnum font-bold text-[17px] text-ink">
          {formatCurrency(lineTotal)}
        </span>
        <span className="tnum text-muted text-[13.5px]">
          {formatCurrency(effectivePrice)} mỗi sản phẩm
        </span>
      </div>
    </li>
  );
}
