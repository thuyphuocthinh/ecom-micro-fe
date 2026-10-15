import { Link } from "react-router";
import { Button, Card, Tag } from "@ecom/ui";
import { HERO_PRODUCT } from "@/features/home/data/home-data.ts";
import {
  formatVND,
  calculateDiscountPercent,
} from "@/features/home/utils/format.ts";
import type { HomeProduct } from "@/features/home/types/home.ts";

export interface HeroSectionProps {
  onAddToCart: (product: HomeProduct) => void;
}

export function HeroSection({ onAddToCart }: HeroSectionProps) {
  const discountLabel = calculateDiscountPercent(
    HERO_PRODUCT.price,
    HERO_PRODUCT.oldPrice,
  );

  return (
    <section
      aria-labelledby="hero-title"
      className="max-w-[1280px] mx-auto px-4 sm:px-10 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-11 gap-8 lg:gap-12 items-center"
    >
      <div className="lg:col-span-5 flex flex-col gap-6">
        <h1
          id="hero-title"
          className="font-head text-4xl sm:text-5xl lg:text-[58px] font-bold text-ink leading-[1.1] tracking-tight"
        >
          Những món dùng mỗi ngày, giá rõ ràng ngay từ đầu.
        </h1>

        <p className="text-base sm:text-lg text-ink-2 max-w-lg leading-relaxed">
          Tai nghe, sạc nhanh, balo, áo thun. Trả tiền trực tuyến hoặc tiền mặt
          khi nhận hàng.
        </p>

        <div className="flex gap-3 flex-wrap">
          <Link
            to="/search?sort=createdAt_desc"
            className="inline-flex items-center justify-center min-h-[52px] px-7 rounded-xl font-semibold text-base bg-brand text-white hover:bg-brand-dark transition-colors"
          >
            Xem sản phẩm mới
          </Link>
          <Link
            to="/search?onSale=true"
            className="inline-flex items-center justify-center min-h-[52px] px-7 rounded-xl font-semibold text-base bg-white text-ink border border-line hover:bg-canvas hover:border-ink-2 transition-colors"
          >
            Xem hàng giảm giá
          </Link>
        </div>
      </div>

      <div
        className="lg:col-span-6 relative h-[380px] sm:h-[470px] rounded-[28px] overflow-hidden bg-[#dce6ff]"
        role="img"
        aria-label="Tai nghe không dây Aero 2 trên nền xanh nhạt (ảnh minh hoạ)"
      >
        <div
          aria-hidden="true"
          className="absolute left-[18%] top-[14%] w-[34%] aspect-square rounded-full bg-ink"
        />
        <div
          aria-hidden="true"
          className="absolute left-[46%] top-[30%] w-[34%] aspect-square rounded-full bg-brand"
        />
        <div
          aria-hidden="true"
          className="absolute left-[36%] top-[44%] w-[9%] aspect-square rounded-full bg-[#dce6ff]"
        />

        <Card className="absolute left-4 sm:left-6 bottom-4 sm:bottom-6 p-4 sm:p-5 flex flex-col gap-2.5 w-[280px] sm:w-[310px] shadow-lg border-white/60 bg-white/95 backdrop-blur-sm">
          <div className="flex justify-between items-center gap-2">
            <span className="font-semibold text-sm sm:text-base text-ink line-clamp-1">
              {HERO_PRODUCT.name}
            </span>
            {discountLabel && <Tag tone="sale">{discountLabel}</Tag>}
          </div>

          <div className="flex items-baseline gap-2.5">
            <span className="font-head text-2xl sm:text-3xl font-bold text-ink tabular-nums tracking-tight">
              {formatVND(HERO_PRODUCT.price)}
            </span>
            {Boolean(HERO_PRODUCT.oldPrice) && (
              <s className="text-sm text-muted tabular-nums">
                {formatVND(HERO_PRODUCT.oldPrice!)}
              </s>
            )}
          </div>

          <Button
            variant="primary"
            size="md"
            className="w-full mt-1"
            onClick={() => onAddToCart(HERO_PRODUCT)}
            aria-label={`Thêm vào giỏ: ${HERO_PRODUCT.name}`}
          >
            Thêm vào giỏ
          </Button>
        </Card>
      </div>
    </section>
  );
}
