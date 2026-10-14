import { Card } from "@ecom/ui";
import { Icon } from "@/components/common/Icon.tsx";
import type { OrderShippingAddress } from "@/types";

export interface OrderShippingCardProps {
  address?: OrderShippingAddress;
}

export function OrderShippingCard({ address }: OrderShippingCardProps) {
  if (!address) return null;

  const addressLines = [
    address.street || address.line1,
    address.line2,
    address.wardName,
    address.districtName || address.district,
    address.provinceName || address.city,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Card
      role="region"
      aria-labelledby="ship-title"
      className="p-6 flex flex-col gap-3 bg-white border border-line shadow-xs"
    >
      <h2
        id="ship-title"
        className="font-head font-bold text-xl text-ink flex items-center gap-2.5"
      >
        <span
          className="size-11 rounded-xl inline-flex items-center justify-center shrink-0 bg-[#fdeedd] text-[#9a5b12]"
          aria-hidden="true"
        >
          <Icon name="map-pin" size={20} />
        </span>
        Giao tới
      </h2>

      <div className="flex flex-col gap-0.5">
        <p className="font-semibold text-ink text-[15px]">
          {address.recipientName}
        </p>
        <p className="text-ink-2 tnum text-[14.5px]">{address.phone}</p>
        <p className="text-ink-2 text-[14.5px] leading-snug">{addressLines}</p>
      </div>

      <p className="text-[13px] text-muted">
        Địa chỉ được lưu theo lúc đặt hàng, sửa sổ địa chỉ sau đó không làm đổi
        đơn này.
      </p>
    </Card>
  );
}
