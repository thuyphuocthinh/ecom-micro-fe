export type VoucherDiscountType = "FIXED_AMOUNT" | "PERCENTAGE";

/** Why a running voucher cannot be used on the cart as it is now. */
export type VoucherUnusableReason =
  "BELOW_MINIMUM" | "NO_DISCOUNT" | "USED_UP" | "USER_LIMIT_REACHED";

/** One voucher of `GET /vouchers`: a code that is running, and whether this cart can use it. */
export interface VoucherListItem {
  code: string;
  name: string;
  discountType: VoucherDiscountType;
  /** The amount (FIXED_AMOUNT) or the percent (PERCENTAGE). */
  value: number;
  /** The most a PERCENTAGE voucher takes off; null means no cap. */
  maxDiscount: number | null;
  minOrderValue: number;
  endsAt: string;
  usable: boolean;
  reason: VoucherUnusableReason | null;
  /** What it would take off the cart; null when it cannot be used. */
  discountAmount: number | null;
}

/** `POST /vouchers/preview`: what a voucher takes off the cart right now (no use is taken). */
export interface VoucherPreview {
  code: string;
  name: string;
  discountType: VoucherDiscountType;
  discountAmount: number;
  /** The goods in the cart that can be ordered now, before the discount. */
  subtotal: number;
  /** What the customer pays: the goods minus the discount. */
  total: number;
}
