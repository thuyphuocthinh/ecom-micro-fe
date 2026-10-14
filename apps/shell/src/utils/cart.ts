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
