import { Button } from "@ecom/ui";

export interface ProductsEmptyStateProps {
  onClearFilters?: () => void;
  title?: string;
  description?: string;
}

export function ProductsEmptyState({
  onClearFilters,
  title = "Không tìm thấy sản phẩm phù hợp",
  description = "Thử bỏ bớt bộ lọc hoặc đổi từ khoá. Bạn cũng có thể xoá tất cả bộ lọc để xem lại toàn bộ sản phẩm.",
}: ProductsEmptyStateProps) {
  return (
    <div className="bg-white border border-line rounded-[14px] p-10 sm:p-14 text-center flex flex-col items-center gap-3 w-full shadow-xs">
      <h2 className="font-head text-2xl sm:text-[26px] font-bold text-ink">
        {title}
      </h2>

      <p className="text-[15px] text-[#344054] max-w-md leading-relaxed">
        {description}
      </p>

      {onClearFilters && (
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={onClearFilters}
          className="mt-2 min-w-[170px] justify-center"
        >
          Xoá tất cả bộ lọc
        </Button>
      )}
    </div>
  );
}
