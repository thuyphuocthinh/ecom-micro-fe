export type PaymentMethod = "ONLINE" | "COD";

export interface Address {
  id: string;
  recipientName: string;
  phone: string;
  provinceCode: string;
  provinceName: string;
  wardCode: string;
  wardName: string;
  street: string;
  label: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressPayload {
  recipientName: string;
  phone: string;
  wardCode: string;
  street: string;
  label?: string | null;
  isDefault?: boolean;
}

export interface Province {
  code: string;
  name: string;
  fullName: string;
  type: "CITY" | "PROVINCE";
}

export interface Ward {
  code: string;
  name: string;
  fullName: string;
  type: "WARD" | "COMMUNE" | "TOWNSHIP";
}

export interface PlaceOrderPayload {
  addressId: string;
  paymentMethod: PaymentMethod;
}

export interface OrderItem {
  skuId: string;
  productName: string;
  thumbnail: string | null;
  attributes: Record<string, string>;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface ShippingAddressInfo {
  recipientName: string;
  phone: string;
  provinceCode: string;
  provinceName: string;
  wardCode: string;
  wardName: string;
  street: string;
  label: string | null;
}

export interface OrderTimeline {
  placedAt: string;
  confirmedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
}

export type OrderStatus =
  | "PENDING"
  | "PAYMENT_PROCESSING"
  | "CONFIRMED"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELLED"
  | "EXPIRED";

export interface OrderResponse {
  id: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  total: number;
  items: OrderItem[];
  shippingAddress: ShippingAddressInfo;
  expiresAt: string;
  timeline: OrderTimeline;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus =
  | "INITIATED"
  | "SUCCEEDED"
  | "FAILED"
  | "EXPIRED"
  | "REFUND_PENDING"
  | "REFUNDED";

export interface PaymentResponse {
  id: string;
  orderId: string;
  status: PaymentStatus;
  amount: number;
  payUrl: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface FakeGatewayResult {
  webhookStatus: number;
  eventId: string;
}
