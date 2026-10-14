import { Card } from "@ecom/ui";
import { Icon } from "@/components/common/Icon.tsx";
import type { OrderItem } from "@/types";
import { formatVnd } from "../utils/order-format.ts";

export interface OrderItemsListProps {
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
}

export function OrderItemsList({
  items,
  subtotal,
  shippingFee,
  total,
}: OrderItemsListProps) {
  const formattedSubtotal = formatVnd(subtotal);
  const formattedShipping =
    shippingFee === 0 ? "Miễn phí" : formatVnd(shippingFee);
  const formattedTotal = formatVnd(total);

  return (
    <Card
      role="region"
      aria-labelledby="items-title"
      className="p-6 flex flex-col gap-4 bg-white border border-line shadow-xs"
    >
      <h2
        id="items-title"
        className="font-head font-bold text-xl text-ink flex items-center gap-2.5"
      >
        <span
          className="size-11 rounded-xl inline-flex items-center justify-center shrink-0 bg-brand-tint text-brand-dark"
          aria-hidden="true"
        >
          <Icon name="package" size={20} />
        </span>
        Sản phẩm
      </h2>

      {/* Items list */}
      <ul className="list-none m-0 p-0 flex flex-col gap-3.5">
        {items.map((item, idx) => {
          const unitPrice = item.unitPrice ?? item.price ?? 0;
          const itemPriceFormatted = formatVnd(unitPrice);
          const itemTotalFormatted = formatVnd(unitPrice * item.quantity);

          return (
            <li
              key={item.skuId ?? idx}
              className="grid grid-cols-[64px_minmax(0,1fr)_auto] gap-3.5 items-center"
            >
              <div
                aria-hidden="true"
                className="size-16 rounded-xl overflow-hidden bg-brand-tint border border-line/60 flex items-center justify-center shrink-0"
              >
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <Icon name="package" size={24} className="text-brand/60" />
                )}
              </div>

              <div className="flex flex-col gap-0.5 min-w-0">
                <p className="font-semibold text-ink text-[15px] truncate">
                  {item.productName}
                </p>
                <p className="text-[13.5px] text-muted tnum">
                  {itemPriceFormatted} × {item.quantity}
                </p>
              </div>

              <span className="font-semibold text-ink text-[15px] tnum shrink-0">
                {itemTotalFormatted}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Summary calculation */}
      <dl className="m-0 flex flex-col gap-2.5 border-t border-line pt-3.5">
        <div className="flex justify-between gap-4 items-baseline">
          <dt className="text-ink-2 text-[14.5px]">Tạm tính</dt>
          <dd className="m-0 font-semibold text-ink tnum text-[14.5px]">
            {formattedSubtotal}
          </dd>
        </div>
        <div className="flex justify-between gap-4 items-baseline">
          <dt className="text-ink-2 text-[14.5px]">Vận chuyển</dt>
          <dd className="m-0 font-semibold text-ink tnum text-[14.5px]">
            {formattedShipping}
          </dd>
        </div>
        <div className="flex justify-between gap-4 items-baseline border-t border-line pt-3">
          <dt className="font-head font-bold text-[17px] text-ink">
            Tổng cộng
          </dt>
          <dd className="m-0 font-head font-bold text-2xl text-ink tracking-tight tnum">
            {formattedTotal}
          </dd>
        </div>
      </dl>
    </Card>
  );
}
