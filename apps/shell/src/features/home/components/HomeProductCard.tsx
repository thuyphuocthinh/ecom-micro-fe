import { Link } from "react-router";
import { Button, Tag, Icon } from "@ecom/ui";
import type {
  HomeProduct,
  HomeCategoryKind,
} from "@/features/home/types/home.ts";
import {
  formatVND,
  calculateDiscountPercent,
  formatRating,
  formatReviewCount,
} from "@/features/home/utils/format.ts";

export interface HomeProductCardProps {
  product: HomeProduct;
  onAddToCart: (product: HomeProduct) => void;
}

function renderProductShape(kind: HomeCategoryKind, tone: string) {
  const baseClasses =
    "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2";
  switch (kind) {
    case "audio":
      return (
        <div
          aria-hidden="true"
          className={`${baseClasses} w-[42%] aspect-square rounded-full`}
          style={{ backgroundColor: tone }}
        />
      );
    case "tech":
      return (
        <div
          aria-hidden="true"
          className={`${baseClasses} w-[54%] h-[30%] rounded-2xl -rotate-6`}
          style={{ backgroundColor: tone }}
        />
      );
    case "fashion":
      return (
        <div
          aria-hidden="true"
          className={`${baseClasses} w-[40%] h-[56%] rounded-t-xl rounded-b-md`}
          style={{ backgroundColor: tone }}
        />
      );
    case "life":
      return (
        <div
          aria-hidden="true"
          className={`${baseClasses} w-[30%] h-[58%] rounded-t-3xl rounded-b-xl`}
          style={{ backgroundColor: tone }}
        />
      );
  }
}

export function HomeProductCard({
  product,
  onAddToCart,
}: HomeProductCardProps) {
  const discountLabel = calculateDiscountPercent(
    product.price,
    product.oldPrice,
  );

  return (
    <li className="flex flex-col gap-3 group">
      <Link
        to={`/search?search=${encodeURIComponent(product.name)}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-2xl"
      >
        <div className="relative aspect-square rounded-[18px] overflow-hidden transition-transform duration-200 group-hover:-translate-y-1">
          <div
            aria-hidden="true"
            className="w-full h-full relative"
            style={{ backgroundColor: product.tint }}
          >
            {renderProductShape(product.kind, product.tone)}
          </div>

          {discountLabel && (
            <div className="absolute left-3 top-3">
              <Tag tone="sale">{discountLabel}</Tag>
            </div>
          )}
        </div>

        <h3 className="font-sans text-[15.5px] font-semibold text-ink line-clamp-2 mt-3 leading-snug group-hover:text-brand transition-colors">
          {product.name}
        </h3>
      </Link>

      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="font-bold text-[17px] text-ink tabular-nums">
          {formatVND(product.price)}
        </span>
        {Boolean(product.oldPrice) && (
          <s className="text-[13.5px] text-muted tabular-nums">
            {formatVND(product.oldPrice!)}
          </s>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-[13.5px] text-muted">
        <Icon
          name="star"
          size={16}
          className="text-[#f2a900]"
          fill="#f2a900"
          stroke="#f2a900"
        />
        <span className="tabular-nums font-medium text-ink">
          <span className="sr-only">Đánh giá </span>
          {formatRating(product.rating)}
        </span>
        <span className="tabular-nums text-muted" aria-hidden="true">
          ({formatReviewCount(product.reviews)})
        </span>
      </div>

      <Button
        variant="secondary"
        size="md"
        className="w-full mt-auto"
        onClick={() => onAddToCart(product)}
        aria-label={`Thêm vào giỏ: ${product.name}`}
      >
        Thêm vào giỏ
      </Button>
    </li>
  );
}
