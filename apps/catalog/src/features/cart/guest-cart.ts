export const GUEST_CART_STORAGE_KEY = "ecom_guest_cart";

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
  flags?: string[];
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
    window.dispatchEvent(new CustomEvent("cart:changed"));
  } catch {
    // LocalStorage quota or disabled
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
