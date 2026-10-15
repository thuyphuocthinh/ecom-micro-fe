/**
 * Formats a number to Vietnamese Currency (VND), e.g. 3990000 -> "3.990.000 ₫"
 */
export function formatVND(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

/**
 * Calculates discount percent string, e.g. (3990000, 4590000) -> "Giảm 13%"
 */
export function calculateDiscountPercent(
  price: number,
  oldPrice?: number | null,
): string | null {
  if (!oldPrice || oldPrice <= price) return null;
  const percent = Math.round(((oldPrice - price) / oldPrice) * 100);
  if (percent <= 0) return null;
  return `Giảm ${percent}%`;
}
