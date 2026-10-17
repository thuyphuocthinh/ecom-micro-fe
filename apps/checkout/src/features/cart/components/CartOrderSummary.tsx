import { Link } from "react-router";
import { buttonClasses } from "@ecom/ui";
import { formatCurrency } from "@/features/cart/utils/cart-format.ts";
import type { VoucherListItem, VoucherPreview } from "@/types";
import {
  VoucherPicker,
  type VoucherListState,
  type VoucherStatus,
} from "./VoucherPicker.tsx";

/** Everything the voucher box needs, worked out by the page from the server's answers. */
export interface CartVoucherView {
  /** The code that is chosen now (null for none). */
  appliedCode: string | null;
  /** What the server says the code takes off; absent until it has answered. */
  preview?: VoucherPreview;
  /** The server is being asked about the code (or about it again after the cart changed). */
  isChecking: boolean;
  /** Why the code was dropped, or why it could not be checked. */
  errorMessage: string | null;
  vouchers: VoucherListItem[];
  listState: VoucherListState;
  onOpenList: () => void;
  onSelect: (code: string) => void;
  onRemove: () => void;
}

export interface CartOrderSummaryProps {
  subtotal: number;
  voucher: CartVoucherView;
  isGuest?: boolean;
}

export function CartOrderSummary({
  subtotal,
  voucher,
  isGuest = false,
}: CartOrderSummaryProps) {
  const { preview } = voucher;
  const status: VoucherStatus = isGuest
    ? { kind: "none" }
    : voucher.errorMessage
      ? { kind: "error", message: voucher.errorMessage }
      : preview
        ? { kind: "applied", code: preview.code }
        : voucher.appliedCode
          ? { kind: "applying" }
          : { kind: "none" };

  // What to pay comes from the server; this page never subtracts anything itself
  const discountAmount = !isGuest && preview ? preview.discountAmount : 0;
  const hasDiscount = discountAmount > 0;
  const total = !isGuest && preview ? preview.total : subtotal;
  // The numbers of the last answer stay on screen, dimmed, while the server is asked again
  const isRefreshing = voucher.isChecking && preview !== undefined;

  return (
    <aside
      aria-label="Tóm tắt đơn hàng"
      data-testid="cart-order-summary"
      className="card bg-white border border-line rounded-[14px] w-full lg:w-[380px] p-6 flex flex-col gap-4.5 lg:sticky lg:top-4 self-start"
    >
      <h2 className="font-head font-bold text-[22px] tracking-tight text-ink">
        Tóm tắt đơn hàng
      </h2>

      <VoucherPicker
        isGuest={isGuest}
        subtotal={subtotal}
        appliedCode={isGuest ? null : voucher.appliedCode}
        status={status}
        vouchers={voucher.vouchers}
        listState={voucher.listState}
        onOpen={voucher.onOpenList}
        onSelect={voucher.onSelect}
        onRemove={voucher.onRemove}
      />

      {/* Cost Breakdown */}
      <dl
        aria-busy={isRefreshing}
        className={`m-0 flex flex-col gap-3 py-1 transition-opacity ${
          isRefreshing ? "opacity-60" : ""
        }`}
      >
        <div className="flex justify-between items-baseline gap-4">
          <dt className="text-ink-2 text-[15px]">Tạm tính</dt>
          <dd className="tnum m-0 font-semibold text-ink text-[15px]">
            {formatCurrency(subtotal)}
          </dd>
        </div>

        {hasDiscount && preview && (
          <div className="flex justify-between items-baseline gap-4">
            <dt className="text-ink-2 text-[15px]">
              Mã giảm giá ({preview.code})
            </dt>
            <dd
              aria-live="polite"
              className="tnum m-0 font-semibold text-ok text-[15px]"
            >
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
          <dd
            aria-live="polite"
            className="tnum m-0 font-bold text-[24px] font-head tracking-tight text-ink"
          >
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
