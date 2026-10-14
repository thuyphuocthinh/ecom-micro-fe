import { Card, Tag } from "@ecom/ui";
import { Icon } from "@/components/common/Icon.tsx";
import type { OrderPaymentAttempt, PaymentMethod } from "@/types";
import { formatOrderDateTime } from "../utils/order-format.ts";

export interface OrderPaymentCardProps {
  paymentMethod: PaymentMethod;
  payments?: OrderPaymentAttempt[];
  createdAt: string;
  isCancelled?: boolean;
}

export function OrderPaymentCard({
  paymentMethod,
  payments,
  createdAt,
  isCancelled = false,
}: OrderPaymentCardProps) {
  const methodLabel =
    paymentMethod === "COD"
      ? "Thanh toán khi nhận hàng (COD)"
      : "Thanh toán trực tuyến";

  // Build display attempts
  const displayPayments =
    payments && payments.length > 0
      ? payments
      : [
          {
            attemptNumber: 1,
            status: (isCancelled
              ? "REFUNDED"
              : paymentMethod === "COD"
                ? "PENDING"
                : "SUCCESS") as OrderPaymentAttempt["status"],
            createdAt,
          },
        ];

  const getAttemptStatusMeta = (status: OrderPaymentAttempt["status"]) => {
    switch (status) {
      case "SUCCESS":
        return { label: "Thành công", tone: "ok" as const };
      case "FAILED":
        return { label: "Thất bại", tone: "sale" as const };
      case "REFUNDED":
        return { label: "Đã hoàn tiền", tone: "default" as const };
      case "PENDING":
      default:
        return { label: "Chờ thanh toán", tone: "warn" as const };
    }
  };

  return (
    <Card
      role="region"
      aria-labelledby="pay-title"
      className="p-6 flex flex-col gap-3.5 bg-white border border-line shadow-xs"
    >
      <h2
        id="pay-title"
        className="font-head font-bold text-xl text-ink flex items-center gap-2.5"
      >
        <span
          className="size-11 rounded-xl inline-flex items-center justify-center shrink-0 bg-ok-tint text-ok"
          aria-hidden="true"
        >
          <Icon name="credit-card" size={20} />
        </span>
        Thanh toán
      </h2>

      <p className="text-ink-2 text-[14.5px] font-medium">{methodLabel}</p>

      <ol className="list-none m-0 p-0 flex flex-col gap-3">
        {displayPayments.map((p, idx) => {
          const meta = getAttemptStatusMeta(p.status);
          const time = p.createdAt ? formatOrderDateTime(p.createdAt) : "";

          return (
            <li
              key={p.id ?? idx}
              className="flex justify-between gap-3 items-center"
            >
              <div className="flex flex-col">
                <span className="font-semibold text-ink text-[14.5px]">
                  Lần thử {p.attemptNumber ?? idx + 1}
                </span>
                {time && (
                  <span className="text-[13px] text-muted tnum">{time}</span>
                )}
              </div>
              <Tag tone={meta.tone}>{meta.label}</Tag>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
