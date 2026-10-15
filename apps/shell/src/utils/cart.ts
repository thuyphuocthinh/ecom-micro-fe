export const GUEST_CART_STORAGE_KEY = "ecom_guest_cart";

export function getGuestCartCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(GUEST_CART_STORAGE_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

/**
 * Returns an accessible label for the cart button/link.
 * E.g., 0 -> "Giỏ hàng, đang trống", 3 -> "Giỏ hàng, 3 sản phẩm"
 */
export function formatCartAriaLabel(count: number): string {
  const safeCount = Math.max(0, Math.floor(count));
  if (safeCount === 0) {
    return "Giỏ hàng, đang trống";
  }
  return `Giỏ hàng, ${safeCount} sản phẩm`;
}
