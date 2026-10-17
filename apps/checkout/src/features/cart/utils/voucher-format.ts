import type { VoucherListItem } from "@/types";
import { formatCurrency } from "./cart-format.ts";

type DescribedVoucher = Pick<
  VoucherListItem,
  "discountType" | "value" | "maxDiscount" | "minOrderValue"
>;

/** What the voucher takes off: "Giảm 50.000 ₫" or "Giảm 10%, tối đa 100.000 ₫". */
export function describeDiscount(voucher: DescribedVoucher): string {
  if (voucher.discountType === "FIXED_AMOUNT") {
    return `Giảm ${formatCurrency(voucher.value)}`;
  }
  const cap =
    voucher.maxDiscount !== null
      ? `, tối đa ${formatCurrency(voucher.maxDiscount)}`
      : "";
  return `Giảm ${voucher.value}%${cap}`;
}

/** The smallest order the voucher is for, or null when there is none. */
export function describeMinimum(voucher: DescribedVoucher): string | null {
  return voucher.minOrderValue > 0
    ? `Đơn từ ${formatCurrency(voucher.minOrderValue)}`
    : null;
}

const VIETNAM_DATE = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Ho_Chi_Minh",
});

/** "HSD 31/10/2026", in Vietnam time, whatever the time zone of the browser. */
export function formatVoucherExpiry(endsAt: string): string {
  const date = new Date(endsAt);
  return Number.isNaN(date.getTime()) ? "" : `HSD ${VIETNAM_DATE.format(date)}`;
}

/** Why a voucher in the list cannot be picked, in words for the customer. */
export function describeUnusable(
  voucher: Pick<VoucherListItem, "reason" | "minOrderValue">,
  subtotal: number,
): string | null {
  switch (voucher.reason) {
    case "BELOW_MINIMUM": {
      const missing = voucher.minOrderValue - subtotal;
      return missing > 0
        ? `Mua thêm ${formatCurrency(missing)} để dùng mã này`
        : "Chưa đủ giá trị đơn tối thiểu";
    }
    case "NO_DISCOUNT":
      return "Mã này chưa giảm được cho giỏ hàng của bạn";
    case "USED_UP":
      return "Mã đã hết lượt dùng";
    case "USER_LIMIT_REACHED":
      return "Bạn đã dùng hết lượt của mã này";
    default:
      return null;
  }
}
