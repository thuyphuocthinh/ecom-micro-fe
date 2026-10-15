import type { ProductSpecItem } from "@/features/products/utils/product-detail-format.ts";

export interface ProductSpecsProps {
  description?: string | null;
  specs: ProductSpecItem[];
}

export function ProductSpecs({ description, specs }: ProductSpecsProps) {
  // Split description paragraphs if multiline
  const paragraphs = description
    ? description.split("\n\n").filter(Boolean)
    : ["Thông tin chi tiết của sản phẩm đang được cập nhật."];

  return (
    <div className="flex gap-12 lg:gap-14 flex-wrap items-start mt-16 pt-12 border-t border-line">
      {/* Description Section */}
      <section
        aria-labelledby="desc-title"
        className="flex-1 min-w-[280px] sm:min-w-[360px] flex flex-col gap-4"
      >
        <h2
          id="desc-title"
          className="font-head text-[26px] sm:text-[28px] font-bold text-ink tracking-tight"
        >
          Mô tả sản phẩm
        </h2>
        <div className="space-y-3 text-ink-2 text-[15px] leading-relaxed max-w-[560px]">
          {paragraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </section>

      {/* Specifications Definition List */}
      <section
        aria-labelledby="spec-title"
        className="flex-1 min-w-[280px] sm:min-w-[360px]"
      >
        <h2
          id="spec-title"
          className="font-head text-[26px] sm:text-[28px] font-bold text-ink tracking-tight mb-2"
        >
          Thông số
        </h2>
        <dl className="m-0 border-t border-line">
          {specs.map((item, idx) => (
            <div
              key={idx}
              className="grid grid-cols-[140px_minmax(0,1fr)] sm:grid-cols-[160px_minmax(0,1fr)] gap-4 py-3.5 border-b border-line text-[14.5px]"
            >
              <dt className="text-muted font-normal">{item.label}</dt>
              <dd className="m-0 font-medium text-ink break-words tnum">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
