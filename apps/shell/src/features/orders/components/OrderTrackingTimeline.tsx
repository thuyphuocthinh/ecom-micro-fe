import { Card } from "@ecom/ui";
import { Icon } from "@/components/common/Icon.tsx";
import type { OrderDetail, OrderStatus } from "@/types";
import { formatOrderDateTime } from "../utils/order-format.ts";

export interface OrderTrackingTimelineProps {
  order: OrderDetail;
}

export function OrderTrackingTimeline({ order }: OrderTrackingTimelineProps) {
  const status: OrderStatus = order.status;

  // Determine stage progression (1: confirmed, 2: shipping, 3: delivered)
  let currentStep = 0;
  if (status === "CONFIRMED") currentStep = 1;
  else if (status === "SHIPPING") currentStep = 2;
  else if (status === "DELIVERED") currentStep = 3;
  else if (status === "PAYMENT_PROCESSING" || status === "PENDING")
    currentStep = 0;

  const confirmedTime = order.timeline?.confirmedAt || order.createdAt;
  const shippingTime = order.timeline?.shippedAt;
  const deliveredTime = order.timeline?.deliveredAt;

  // Step 1: Confirmed
  const step1State: "on" | "next" | "later" =
    currentStep >= 1 ? "on" : currentStep === 0 ? "next" : "later";
  // Step 2: Shipping
  const step2State: "on" | "next" | "later" =
    currentStep >= 2 ? "on" : currentStep === 1 ? "next" : "later";
  // Step 3: Delivered
  const step3State: "on" | "next" | "later" =
    currentStep >= 3 ? "on" : currentStep === 2 ? "next" : "later";

  const bar1On = currentStep >= 2;
  const bar2On = currentStep >= 3;

  const getNodeClass = (state: "on" | "next" | "later") => {
    switch (state) {
      case "on":
        return "bg-ok text-white";
      case "next":
        return "bg-brand-tint text-brand-dark";
      case "later":
        return "bg-[#f1f3f6] text-[#7a8392]";
    }
  };

  return (
    <Card
      role="region"
      aria-labelledby="track-title"
      className="p-7 sm:px-8 sm:py-7 flex flex-col gap-5 bg-white border border-line shadow-xs"
    >
      <h2 id="track-title" className="font-head font-bold text-xl text-ink">
        Hành trình đơn hàng
      </h2>

      <ol className="list-none m-0 p-0 flex items-start gap-3 sm:gap-4 overflow-x-auto pb-2">
        {/* Step 1: Đã xác nhận */}
        <li className="flex flex-col items-center gap-2.5 text-center min-w-[120px] sm:w-[150px] shrink-0">
          <span
            className={`size-14 rounded-full inline-flex items-center justify-center shrink-0 transition-colors ${getNodeClass(
              step1State,
            )}`}
            aria-hidden="true"
          >
            <Icon name="check" size={26} />
          </span>
          <span className="text-[14.5px]">
            <strong className="text-ink">Đã xác nhận</strong>
            {currentStep === 1 && (
              <span className="sr-only">, bước hiện tại</span>
            )}
            <br />
            <span className="text-[13.5px] text-muted tnum">
              {currentStep >= 1
                ? formatOrderDateTime(confirmedTime)
                : "Chờ xác nhận"}
            </span>
          </span>
        </li>

        {/* Bar 1 */}
        <li
          className={`flex-1 min-w-8 h-1 rounded-full mt-[26px] transition-colors ${
            bar1On ? "bg-ok" : "bg-line"
          }`}
          aria-hidden="true"
        />

        {/* Step 2: Đang giao */}
        <li className="flex flex-col items-center gap-2.5 text-center min-w-[120px] sm:w-[150px] shrink-0">
          <span
            className={`size-14 rounded-full inline-flex items-center justify-center shrink-0 transition-colors ${getNodeClass(
              step2State,
            )}`}
            aria-hidden="true"
          >
            <Icon name="truck" size={26} />
          </span>
          <span className="text-[14.5px]">
            <strong className="text-ink">Đang giao</strong>
            {currentStep === 2 && (
              <span className="sr-only">, bước hiện tại</span>
            )}
            <br />
            <span className="text-[13.5px] text-muted tnum">
              {shippingTime
                ? formatOrderDateTime(shippingTime)
                : currentStep >= 2
                  ? "Đang trên đường giao"
                  : "Chưa bắt đầu"}
            </span>
          </span>
        </li>

        {/* Bar 2 */}
        <li
          className={`flex-1 min-w-8 h-1 rounded-full mt-[26px] transition-colors ${
            bar2On ? "bg-ok" : "bg-line"
          }`}
          aria-hidden="true"
        />

        {/* Step 3: Đã giao */}
        <li className="flex flex-col items-center gap-2.5 text-center min-w-[120px] sm:w-[150px] shrink-0">
          <span
            className={`size-14 rounded-full inline-flex items-center justify-center shrink-0 transition-colors ${getNodeClass(
              step3State,
            )}`}
            aria-hidden="true"
          >
            <Icon name="home" size={26} />
          </span>
          <span className="text-[14.5px]">
            <strong className="text-ink">Đã giao</strong>
            {currentStep === 3 && (
              <span className="sr-only">, bước hiện tại</span>
            )}
            <br />
            <span className="text-[13.5px] text-muted tnum">
              {deliveredTime
                ? formatOrderDateTime(deliveredTime)
                : "Dự kiến 2-3 ngày"}
            </span>
          </span>
        </li>
      </ol>
    </Card>
  );
}
