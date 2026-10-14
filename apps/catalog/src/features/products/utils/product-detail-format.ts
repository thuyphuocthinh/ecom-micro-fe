import type { Sku, Product } from "@/types";

/**
 * Standard color mapping for Vietnamese product color names
 */
const COLOR_HEX_MAP: Record<string, string> = {
  "xanh đen": "#101828",
  đen: "#101828",
  black: "#101828",
  trắng: "#ffffff",
  "trắng ngà": "#f4f1ea",
  white: "#ffffff",
  "xanh lam": "#2f6fed",
  "xanh dương": "#2f6fed",
  blue: "#2f6fed",
  xám: "#94a3b8",
  gray: "#94a3b8",
  grey: "#94a3b8",
  bạc: "#e2e8f0",
  silver: "#e2e8f0",
  vàng: "#eab308",
  gold: "#eab308",
  đỏ: "#ef4444",
  red: "#ef4444",
  hồng: "#ec4899",
  pink: "#ec4899",
};

/**
 * Resolves a swatch dot color for a SKU.
 */
export function getSkuSwatchHex(sku: Sku): string {
  if (sku.attributes?.hex && typeof sku.attributes.hex === "string") {
    return sku.attributes.hex;
  }
  const colorName =
    sku.attributes?.color || sku.attributes?.colour || sku.name || "";
  const normalized = colorName.toLowerCase().trim();
  for (const [key, hex] of Object.entries(COLOR_HEX_MAP)) {
    if (normalized.includes(key)) {
      return hex;
    }
  }
  return "#101828";
}

/**
 * Gets the readable name for a SKU (e.g. "Xanh đen", "256GB - Trắng", etc.).
 */
export function getSkuDisplayName(sku: Sku, fallbackIndex = 0): string {
  if (sku.attributes?.color) {
    return String(sku.attributes.color);
  }
  if (sku.name && sku.name.trim()) {
    return sku.name.trim();
  }
  if (sku.skuCode) {
    return sku.skuCode;
  }
  return `Phiên bản ${fallbackIndex + 1}`;
}

export interface StockStatusInfo {
  inStock: boolean;
  lowStock: boolean;
  soldOut: boolean;
  label: string;
  tone: "ok" | "warn" | "sale";
}

/**
 * Calculates stock status display info for a SKU.
 */
export function getSkuStockStatus(sku?: Sku): StockStatusInfo {
  if (!sku) {
    return {
      inStock: false,
      lowStock: false,
      soldOut: true,
      label: "Tạm hết hàng",
      tone: "sale",
    };
  }

  // inStock explicitly false or stock count <= 0
  if (
    sku.inStock === false ||
    (typeof sku.stock === "number" && sku.stock <= 0)
  ) {
    return {
      inStock: false,
      lowStock: false,
      soldOut: true,
      label: "Tạm hết hàng",
      tone: "sale",
    };
  }

  // Low stock warning (1 to 5 items)
  if (typeof sku.stock === "number" && sku.stock > 0 && sku.stock <= 5) {
    return {
      inStock: true,
      lowStock: true,
      soldOut: false,
      label: `Chỉ còn ${sku.stock} sản phẩm`,
      tone: "warn",
    };
  }

  return {
    inStock: true,
    lowStock: false,
    soldOut: false,
    label: "Còn hàng",
    tone: "ok",
  };
}

export interface ProductSpecItem {
  label: string;
  value: string;
}

/**
 * Extracts key-value specifications for the product specs table.
 */
export function getProductSpecs(product: Product): ProductSpecItem[] {
  if (product.specs && Object.keys(product.specs).length > 0) {
    return Object.entries(product.specs).map(([label, value]) => ({
      label,
      value: String(value),
    }));
  }

  // Fallback defaults or derived from product properties
  const items: ProductSpecItem[] = [];
  if (product.skus && product.skus.length > 0) {
    items.push({
      label: "Mã sản phẩm",
      value:
        product.skus[0].skuCode ||
        product.skus[0].code ||
        product.id.slice(0, 8),
    });
    items.push({
      label: "Số phiên bản",
      value: `${product.skus.length} lựa chọn`,
    });
  }
  items.push({
    label: "Tình trạng",
    value: product.inStock ? "Chính hãng mới 100%" : "Tạm hết hàng",
  });
  items.push({ label: "Bảo hành", value: "12 tháng chính hãng" });
  items.push({ label: "Giao hàng", value: "Miễn phí toàn quốc" });

  return items;
}
