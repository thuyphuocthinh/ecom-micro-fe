import { useState, type KeyboardEvent } from "react";
import { Link } from "react-router";
import { Button, buttonClasses } from "@ecom/ui";
import { formatCurrency } from "../utils/cart-format.ts";

export interface CartOrderSummaryProps {
  subtotal: number;
  couponCode: string;
  discountAmount: number;
  onApplyCoupon: (code: string) => boolean;
  isGuest?: boolean;
}

export function CartOrderSummary({
  subtotal,
  couponCode,
  discountAmount,
  onApplyCoupon,
}: CartOrderSummaryProps) {
  const [couponInput, setCouponInput] = useState(couponCode);
  const [couponError, setCouponError] = useState(false);

  const total = Math.max(0, subtotal - discountAmount);
  const hasDiscount = discountAmount > 0 && couponCode.length > 0;

  const handleApply = () => {
    const trimmed = couponInput.trim().toUpperCase();
    if (!trimmed) {
      setCouponError(false);
      return;
    }
    const success = onApplyCoupon(trimmed);
    if (!success) {
      setCouponError(true);
    } else {
      setCouponError(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApply();
    }
  };

  return (
    <aside
      aria-label="Tóm tắt đơn hàng"
      data-testid="cart-order-summary"
      className="card bg-white border border-line rounded-[14px] w-full lg:w-[380px] p-6 flex flex-col gap-4.5 lg:sticky lg:top-4 self-start"
    >
      <h2 className="font-head font-bold text-[22px] tracking-tight text-ink">
        Tóm tắt đơn hàng
      </h2>

      {/* Coupon Field */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="coupon" className="font-semibold text-[14px] text-ink">
          Mã giảm giá
        </label>
        <div className="flex gap-2">
          <input
            id="coupon"
            type="text"
            name="coupon"
            autoComplete="off"
            spellCheck={false}
            placeholder="Ví dụ: ECOM50K…"
            value={couponInput}
            onChange={(e) => {
              setCouponInput(e.target.value);
              if (couponError) setCouponError(false);
            }}
            onKeyDown={handleKeyDown}
            aria-invalid={couponError}
            aria-describedby="coupon-msg"
            className="w-full min-h-[44px] px-3.5 border border-[#c9ced8] rounded-[10px] bg-white text-ink text-[15px] focus:outline-none focus:border-brand focus:ring-3 focus:ring-brand/25 transition-colors aria-invalid:border-err"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleApply}
            className="flex-shrink-0"
          >
            Áp dụng
          </Button>
        </div>

        {/* Coupon Message */}
        <p
          id="coupon-msg"
          aria-live="polite"
          className={
            couponError
              ? "text-[13px] text-err font-medium mt-0.5"
              : hasDiscount
                ? "text-[13px] text-ok font-medium mt-0.5"
                : "text-[13px] text-muted mt-0.5"
          }
        >
          {couponError
            ? "Mã không đúng hoặc đã hết hạn. Kiểm tra lại mã rồi thử lần nữa."
            : hasDiscount
              ? `Đã áp dụng mã ${couponCode}.`
              : "Mã mẫu để thử: ECOM50K"}
        </p>
      </div>

      {/* Cost Breakdown */}
      <dl className="m-0 flex flex-col gap-3 py-1">
        <div className="flex justify-between items-baseline gap-4">
          <dt className="text-ink-2 text-[15px]">Tạm tính</dt>
          <dd className="tnum m-0 font-semibold text-ink text-[15px]">
            {formatCurrency(subtotal)}
          </dd>
        </div>

        {hasDiscount && (
          <div className="flex justify-between items-baseline gap-4">
            <dt className="text-ink-2 text-[15px]">Mã giảm giá</dt>
            <dd className="tnum m-0 font-semibold text-ok text-[15px]">
              −{formatCurrency(discountAmount)}
            </dd>
          </div>
        )}

        <div className="flex justify-between items-baseline gap-4">
          <dt className="text-ink-2 text-[15px]">Vận chuyển</dt>
          <dd className="tnum m-0 font-semibold text-ink text-[15px]">
            Miễn phí
          </dd>
        </div>

        <div className="flex justify-between items-baseline gap-4 border-t border-line pt-3.5 mt-1">
          <dt className="font-bold text-[17px] text-ink">Tổng cộng</dt>
          <dd className="tnum m-0 font-bold text-[24px] font-head tracking-tight text-ink">
            {formatCurrency(total)}
          </dd>
        </div>
      </dl>

      {/* Checkout Button */}
      <Link
        to="/checkout"
        className={
          buttonClasses({ variant: "primary", size: "lg" }) +
          " w-full text-center"
        }
      >
        Tiến hành đặt hàng
      </Link>

      <p className="text-[13px] text-muted leading-relaxed">
        Hàng chưa được giữ cho bạn cho tới khi bạn đặt hàng. Giá và số lượng còn
        lại sẽ được kiểm tra lại lúc đó.
      </p>
    </aside>
  );
}
