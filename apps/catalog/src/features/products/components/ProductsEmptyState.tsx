import { Button, Card } from "@ecom/ui";
import { Icon } from "@/components/common/Icon.tsx";

export interface ProductsEmptyStateProps {
  onClearFilters?: () => void;
  title?: string;
  description?: string;
}

export function ProductsEmptyState({
  onClearFilters,
  title = "Không tìm thấy sản phẩm phù hợp",
  description = "Thử kiểm tra lại từ khóa hoặc xóa bớt các bộ lọc để xem nhiều sản phẩm hơn.",
}: ProductsEmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center p-8 sm:p-14 text-center border-dashed border-line bg-white rounded-2xl w-full">
      <span
        aria-hidden="true"
        className="size-16 rounded-full bg-[#f4f7fe] text-muted inline-flex items-center justify-center mb-4 shrink-0"
      >
        <Icon name="search" size={32} className="text-muted/80" />
      </span>

      <h3 className="font-head text-xl sm:text-2xl font-bold text-ink mb-2">
        {title}
      </h3>

      <p className="text-[15px] text-muted max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      {onClearFilters && (
        <Button
          type="button"
          variant="primary"
          onClick={onClearFilters}
          className="min-w-[160px]"
        >
          Xoá tất cả bộ lọc
        </Button>
      )}
    </Card>
  );
}
