export type OrderStatus =
  | "PENDING"
  | "PAYMENT_PROCESSING"
  | "CONFIRMED"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELLED"
  | "EXPIRED";

export type PaymentMethod = "ONLINE" | "COD";

export interface OrderSummaryItem {
  productName: string;
  thumbnail: string | null;
  quantity: number;
}

export interface OrderSummary {
  id: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  total: number;
  itemCount: number;
  items: OrderSummaryItem[];
  createdAt: string;
  expiresAt?: string | null;
}

export interface OrderItem {
  skuId: string;
  productName: string;
  thumbnail?: string | null;
  quantity: number;
  unitPrice?: number;
  price?: number;
  lineTotal?: number;
  total?: number;
  attributes?: Record<string, string>;
}

export interface OrderShippingAddress {
  recipientName: string;
  phone: string;
  provinceName?: string;
  districtName?: string;
  wardName?: string;
  street: string;
  line1?: string;
  line2?: string;
  district?: string;
  city?: string;
}

export interface OrderTimeline {
  confirmedAt?: string | null;
  shippingStartedAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
}

export interface OrderPaymentAttempt {
  id?: string;
  attemptNumber?: number;
  status: "SUCCESS" | "FAILED" | "PENDING" | "REFUNDED";
  createdAt?: string;
}

export interface OrderDetail {
  id: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  subtotal?: number;
  discountAmount?: number;
  voucherCode?: string | null;
  shippingFee?: number;
  total: number;
  items: OrderItem[];
  shippingAddress: OrderShippingAddress;
  expiresAt?: string | null;
  timeline?: OrderTimeline;
  payments?: OrderPaymentAttempt[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderCounts {
  PENDING: number;
  PAYMENT_PROCESSING: number;
  CONFIRMED: number;
  SHIPPING: number;
  DELIVERED: number;
  CANCELLED: number;
  EXPIRED: number;
}

export type OrderTabKey =
  "all" | "waiting" | "confirmed" | "shipping" | "delivered" | "closed";

export type OrderRangeKey = "all" | "30d" | "3m" | "year" | "custom";

export interface OrderFilterParams {
  tab?: OrderTabKey;
  range?: OrderRangeKey;
  from?: string;
  to?: string;
  q?: string;
  cursor?: string;
  limit?: number;
}
