export function formatCurrency(amount: number): string {
  return `${new Intl.NumberFormat("vi-VN").format(Math.max(0, amount))} ₫`;
}

export function formatCartHeaderCount(
  lineCount: number,
  quantityCount: number,
): string {
  if (lineCount <= 0) {
    return "Chưa có sản phẩm nào.";
  }
  return `${lineCount} sản phẩm, ${quantityCount} món`;
}

export function formatAttributes(
  attributes: Record<string, string> | null | undefined,
): string {
  if (!attributes) return "";
  const values = Object.values(attributes).filter(Boolean);
  return values.join(" · ");
}

export function formatPriceDrop(
  addedPrice: number,
  currentPrice: number,
): string | null {
  if (addedPrice <= currentPrice) return null;
  return `Giá giảm từ ${formatCurrency(addedPrice)} khi bạn thêm vào giỏ`;
}

export function formatLowStock(available: number | null): string | null {
  if (available === null || available <= 0 || available > 5) return null;
  return `Chỉ còn ${available} sản phẩm`;
}
