import type { Sku } from "@/types";
import {
  getSkuSwatchHex,
  getSkuDisplayName,
} from "@/features/products/utils/product-detail-format.ts";

export interface ProductSkuSelectorProps {
  skus: Sku[];
  selectedSkuId: string;
  onSelectSku: (skuId: string) => void;
  attributeLabel?: string;
}

export function ProductSkuSelector({
  skus,
  selectedSkuId,
  onSelectSku,
  attributeLabel = "Màu sắc",
}: ProductSkuSelectorProps) {
  if (skus.length <= 1) {
    return null;
  }

  const selectedSku = skus.find((s) => s.id === selectedSkuId) || skus[0];
  const selectedName = selectedSku ? getSkuDisplayName(selectedSku) : "";

  return (
    <fieldset className="border-0 p-0 m-0 min-w-0">
      <legend className="font-semibold text-ink text-[15px] mb-2.5 p-0">
        {attributeLabel}:{" "}
        <span className="font-medium text-ink-2">{selectedName}</span>
      </legend>

      <div
        role="radiogroup"
        aria-label={`Chọn ${attributeLabel.toLowerCase()}`}
        className="flex gap-2.5 flex-wrap"
      >
        {skus.map((sku, index) => {
          const isSelected = sku.id === selectedSkuId;
          const isSoldOut =
            sku.inStock === false ||
            (typeof sku.stock === "number" && sku.stock <= 0);
          const name = getSkuDisplayName(sku, index);
          const hex = getSkuSwatchHex(sku);

          return (
            <label
              key={sku.id}
              className="relative inline-flex cursor-pointer select-none"
            >
              <input
                type="radio"
                name="product-sku-variant"
                value={sku.id}
                checked={isSelected}
                onChange={() => onSelectSku(sku.id)}
                className="peer absolute inset-0 size-full opacity-0 cursor-pointer"
                aria-label={`${name}${isSoldOut ? " - Hết hàng" : ""}`}
              />
              <span
                className={`inline-flex items-center gap-2.5 min-h-[46px] px-3.5 py-1.5 border rounded-[12px] text-[14.5px] font-medium transition-all ${
                  isSelected
                    ? "border-brand bg-brand-tint text-ink shadow-[0_0_0_1px_var(--brand,#2f6fed)]"
                    : "border-line bg-white text-ink hover:border-ink/50"
                } peer-focus-visible:ring-3 peer-focus-visible:ring-brand peer-focus-visible:ring-offset-2`}
              >
                {/* Color Dot Swatch */}
                <span
                  aria-hidden="true"
                  className="size-[20px] rounded-full border border-ink/20 shrink-0"
                  style={{ backgroundColor: hex }}
                />

                <span>{name}</span>

                {isSoldOut && (
                  <span className="text-muted text-[13px] font-normal">
                    · Hết hàng
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
