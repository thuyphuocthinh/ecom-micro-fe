export function formatVnd(amount: number | null | undefined): string {
  if (typeof amount !== "number" || isNaN(amount)) return "0 ₫";
  return (
    new Intl.NumberFormat("vi-VN", {
      maximumFractionDigits: 0,
    }).format(amount) + " ₫"
  );
}

export function formatProductPriceLabel(
  minPrice: number | null | undefined,
  skusCount = 1,
): string {
  if (typeof minPrice !== "number" || isNaN(minPrice)) return "Liên hệ";
  const formatted = formatVnd(minPrice);
  if (skusCount > 1) {
    return `từ ${formatted}`;
  }
  return formatted;
}

export function formatDiscountBadge(discountPercent: number): string {
  if (!discountPercent || discountPercent <= 0) return "";
  return `-${Math.round(discountPercent)}%`;
}
