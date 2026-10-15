import { Link } from "react-router";
import { Button, Image } from "@ecom/ui";
import { formatCurrency } from "@/utils/format.ts";
import type { CartLineItem, PaymentMethod } from "@/types";

export interface CheckoutSummaryAsideProps {
  items: CartLineItem[];
  subtotal: number;
  paymentMethod: PaymentMethod;
  isSubmitting?: boolean;
  isDisabled?: boolean;
  onPlaceOrder: () => void;
}

export function CheckoutSummaryAside({
  items,
  subtotal,
  paymentMethod,
  isSubmitting = false,
  isDisabled = false,
  onPlaceOrder,
}: CheckoutSummaryAsideProps) {
  const isOnline = paymentMethod === "ONLINE";
  const actionText = isOnline ? "Đặt hàng và thanh toán" : "Đặt hàng";

  return (
    <aside
      aria-label="Tóm tắt đơn hàng"
      className="bg-canvas border border-line rounded-2xl p-6 flex flex-col gap-5 shadow-sm sticky top-6"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-head text-xl font-bold text-ink">
          Đơn hàng của bạn
        </h2>
        <Link
          to="/cart"
          className="text-sm font-semibold text-brand hover:underline"
        >
          Sửa giỏ hàng
        </Link>
      </div>

      {/* Items list */}
      <ul className="list-none m-0 p-0 flex flex-col gap-3.5 max-h-[360px] overflow-y-auto pr-1">
        {items.map((item) => {
          const itemPrice = item.price ?? item.addedPrice;
          const lineTotal = itemPrice * item.quantity;

          return (
            <li
              key={item.skuId}
              className="grid grid-cols-[56px_minmax(0,1fr)_auto] gap-3.5 items-center"
            >
              <div className="relative size-14 rounded-xl overflow-hidden bg-surface-sunken flex-none border border-line/60">
                <Image
                  src={item.thumbnail}
                  alt={item.productName ?? "Sản phẩm"}
                  className="size-full object-cover"
                />
              </div>
              <div className="min-w-0 flex flex-col gap-0.5">
                <p className="font-semibold text-sm text-ink truncate">
                  {item.productName}
                </p>
                <p className="font-mono text-xs text-muted">
                  Số lượng: {item.quantity}
                </p>
              </div>
              <span className="font-mono font-semibold text-sm text-ink text-right">
                {formatCurrency(lineTotal)}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Price breakdown */}
      <dl className="m-0 flex flex-col gap-3 border-t border-line pt-4 text-sm">
        <div className="flex justify-between items-baseline">
          <dt className="text-muted">Tạm tính</dt>
          <dd className="m-0 font-mono font-semibold text-ink">
            {formatCurrency(subtotal)}
          </dd>
        </div>
        <div className="flex justify-between items-baseline">
          <dt className="text-muted">Vận chuyển</dt>
          <dd className="m-0 font-mono font-semibold text-ok">Miễn phí</dd>
        </div>
        <div className="flex justify-between items-baseline border-t border-line pt-3.5">
          <dt className="font-bold text-base text-ink">Tổng cộng</dt>
          <dd className="m-0 font-head font-bold text-2xl text-ink tracking-tight">
            {formatCurrency(subtotal)}
          </dd>
        </div>
      </dl>

      {/* Action button */}
      <Button
        variant="primary"
        size="lg"
        loading={isSubmitting}
        disabled={isDisabled || isSubmitting || items.length === 0}
        onClick={onPlaceOrder}
        className="w-full text-base font-bold shadow-md shadow-brand/20"
      >
        {actionText}
      </Button>

      <p className="text-xs text-muted leading-relaxed">
        Bằng việc đặt hàng, bạn đồng ý với các điều khoản mua hàng của Ecom. Giá
        và số lượng còn lại được kiểm tra lại ở bước này.
      </p>
    </aside>
  );
}
