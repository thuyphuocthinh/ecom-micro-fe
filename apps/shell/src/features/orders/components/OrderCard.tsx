import { Link } from "react-router";
import { Button, Card, Image, Tag } from "@ecom/ui";
import { Icon } from "@/components/common/Icon.tsx";
import type { OrderSummary } from "@/types";
import {
  getOrderStatusMeta,
  isOrderCancellable,
  isOrderPayable,
  isOrderRebuyable,
} from "../utils/order-status.ts";
import {
  calculateMinutesLeft,
  formatOrderCode,
  formatOrderDate,
  formatVnd,
} from "../utils/order-format.ts";

export interface OrderCardProps {
  order: OrderSummary;
  onCancel?: (order: OrderSummary) => void;
}

export function OrderCard({ order, onCancel }: OrderCardProps) {
  const meta = getOrderStatusMeta(order.status);
  const code = formatOrderCode(order.id);
  const formattedDate = formatOrderDate(order.createdAt);
  const formattedTotal = formatVnd(order.total);

  const items = order.items ?? [];
  const firstItem = items[0];
  const itemCount = order.itemCount || items.length;
  const remainingCount = itemCount - 3;

  const minutesLeft = calculateMinutesLeft(order.expiresAt);
  const isWaiting =
    order.status === "PAYMENT_PROCESSING" || order.status === "PENDING";
  const canCancel = isOrderCancellable(order.status);
  const canRebuy = isOrderRebuyable(order.status);
  const canPay = isOrderPayable(order.status);

  // Summary title
  let summaryTitle = firstItem ? firstItem.productName : "Đơn hàng";
  if (itemCount > 1) {
    summaryTitle += ` và ${itemCount - 1} sản phẩm khác`;
  }

  return (
    <Card className="overflow-hidden p-0 border border-line bg-white shadow-xs">
      {/* Card Header */}
      <div className="flex justify-between items-center gap-3 flex-wrap px-6 py-4 border-b border-line bg-[#fbfbfc]">
        <div className="flex gap-4 items-baseline flex-wrap">
          <span className="font-bold text-ink" translate="no">
            #{code}
          </span>
          <span className="text-sm text-muted tnum">
            Đặt ngày {formattedDate}
          </span>
        </div>
        <Tag tone={meta.tone}>{meta.label}</Tag>
      </div>

      {/* Card Body */}
      <div className="p-6 flex gap-5 items-center flex-wrap">
        {/* Thumbnails preview */}
        <div className="flex gap-2 items-center shrink-0" aria-hidden="true">
          {items.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className="size-16 rounded-xl overflow-hidden bg-[#eaf0ff] border border-line/60 flex items-center justify-center shrink-0"
            >
              <Image
                src={item.thumbnail}
                alt={item.productName}
                className="size-full object-cover"
                fallback={
                  <div className="size-full flex items-center justify-center bg-[#eaf0ff]">
                    <Icon name="cart" size={24} className="text-brand/60" />
                  </div>
                }
              />
            </div>
          ))}
          {remainingCount > 0 && (
            <span className="size-16 rounded-xl bg-[#f1f3f6] text-ink-2 font-bold inline-flex items-center justify-center shrink-0 text-sm">
              +{remainingCount}
            </span>
          )}
        </div>

        {/* Info & Notes */}
        <div className="flex-1 min-w-[220px] flex flex-col gap-1">
          <p className="font-semibold text-ink line-clamp-2">{summaryTitle}</p>

          {isWaiting && minutesLeft !== null && minutesLeft > 0 && (
            <p className="text-sm text-[#8a5a00] font-medium flex items-center gap-1.5 mt-0.5">
              <Icon
                name="clock"
                size={16}
                className="shrink-0 text-[#8a5a00]"
              />
              <span>
                Còn {minutesLeft} phút để thanh toán, sau đó đơn tự huỷ
              </span>
            </p>
          )}

          {order.status === "CANCELLED" && (
            <p className="text-sm text-muted mt-0.5">
              Đã huỷ theo yêu cầu của bạn. Tiền đã hoàn lại.
            </p>
          )}

          {order.status === "EXPIRED" && (
            <p className="text-sm text-muted mt-0.5">
              Hết thời gian thanh toán nên đơn tự huỷ, hàng đã trả về kho.
            </p>
          )}
        </div>

        {/* Total Price */}
        <div className="text-right shrink-0">
          <p className="text-[13.5px] text-muted">Tổng tiền</p>
          <p className="font-head font-bold text-xl text-ink tracking-tight tnum mt-0.5">
            {formattedTotal}
          </p>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="flex justify-end gap-2.5 flex-wrap px-6 pb-5 pt-0">
        {canCancel && onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => onCancel(order)}
            className="text-err hover:bg-err/10 hover:text-err"
          >
            Huỷ đơn
          </Button>
        )}

        {canRebuy && (
          <Link
            to="/cart"
            className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-control font-semibold text-[15px] border border-[#c9ced8] bg-white text-ink hover:bg-canvas transition-colors"
          >
            Mua lại
          </Link>
        )}

        <Link
          to={`/account/orders/${order.id}`}
          className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-control font-semibold text-[15px] border border-[#c9ced8] bg-white text-ink hover:bg-canvas transition-colors"
        >
          Xem chi tiết
        </Link>

        {canPay && (
          <Link
            to={`/account/orders/${order.id}`}
            className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-control font-semibold text-[15px] bg-brand text-white hover:bg-brand-dark transition-colors"
          >
            Thanh toán ngay
          </Link>
        )}
      </div>
    </Card>
  );
}
