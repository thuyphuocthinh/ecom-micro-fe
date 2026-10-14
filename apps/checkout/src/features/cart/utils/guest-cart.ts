import { session } from "@ecom/api";
import type { CartLineItem, CartResponse, GuestCartItem } from "@/types";

export const GUEST_CART_STORAGE_KEY = "ecom_guest_cart";

export function isGuestSession(): boolean {
  if (typeof window === "undefined") return true;
  return !session.getAccessToken() && !session.getRefreshToken();
}

function notifyCartChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cart:changed"));
  }
}

export function getGuestCartItems(): GuestCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveGuestCartItems(items: GuestCartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(items));
    notifyCartChanged();
  } catch {
    // LocalStorage quota exceeded or disabled
  }
}

export function addGuestCartItem(item: GuestCartItem): GuestCartItem[] {
  const current = getGuestCartItems();
  const existingIndex = current.findIndex((i) => i.skuId === item.skuId);

  let updated: GuestCartItem[];
  if (existingIndex >= 0) {
    const existing = current[existingIndex];
    const newQty = Math.min(existing.quantity + item.quantity, 99);
    updated = current.map((i, index) =>
      index === existingIndex ? { ...i, quantity: newQty } : i,
    );
  } else {
    updated = [item, ...current];
  }

  saveGuestCartItems(updated);
  return updated;
}

export function updateGuestCartItemQuantity(
  skuId: string,
  quantity: number,
): GuestCartItem[] {
  const current = getGuestCartItems();
  let updated: GuestCartItem[];

  if (quantity <= 0) {
    updated = current.filter((i) => i.skuId !== skuId);
  } else {
    const clampedQty = Math.min(quantity, 99);
    updated = current.map((i) =>
      i.skuId === skuId ? { ...i, quantity: clampedQty } : i,
    );
  }

  saveGuestCartItems(updated);
  return updated;
}

export function removeGuestCartItem(skuId: string): {
  items: GuestCartItem[];
  removedItem: GuestCartItem | null;
} {
  const current = getGuestCartItems();
  const removedItem = current.find((i) => i.skuId === skuId) ?? null;
  const updated = current.filter((i) => i.skuId !== skuId);
  saveGuestCartItems(updated);
  return { items: updated, removedItem };
}

export function clearGuestCart(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(GUEST_CART_STORAGE_KEY);
    notifyCartChanged();
  } catch {
    // Ignore
  }
}

export function toCartResponse(items: GuestCartItem[]): CartResponse {
  const lineItems: CartLineItem[] = items.map((item) => ({
    skuId: item.skuId,
    productId: item.productId ?? null,
    productName: item.productName,
    thumbnail: item.thumbnail ?? null,
    attributes: item.attributes ?? null,
    quantity: item.quantity,
    price: item.price,
    addedPrice: item.addedPrice ?? item.price,
    available: item.available ?? 99,
    flags: item.flags ?? [],
  }));

  const subtotal = lineItems.reduce((sum, item) => {
    const price = item.price ?? item.addedPrice ?? 0;
    return sum + price * item.quantity;
  }, 0);

  const quantityCount = lineItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items: lineItems,
    subtotal,
    lineCount: lineItems.length,
    quantityCount,
  };
}
