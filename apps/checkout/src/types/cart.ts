export type CartLineFlag =
  "priceChanged" | "unpublished" | "outOfStock" | "notEnoughStock";

export interface CartLineItem {
  skuId: string;
  productId: string | null;
  productName: string | null;
  thumbnail: string | null;
  attributes: Record<string, string> | null;
  quantity: number;
  price: number | null;
  addedPrice: number;
  available: number | null;
  flags: CartLineFlag[];
}

export interface CartResponse {
  items: CartLineItem[];
  subtotal: number;
  lineCount: number;
  quantityCount: number;
}

export interface GuestCartItem {
  skuId: string;
  productId?: string | null;
  productName: string;
  thumbnail?: string | null;
  attributes?: Record<string, string> | null;
  price: number;
  addedPrice: number;
  available?: number | null;
  quantity: number;
  flags?: CartLineFlag[];
}

export interface CouponDiscount {
  code: string;
  discountAmount: number;
}
