import { Link } from "react-router";
import { Card } from "@ecom/ui";

export interface OrdersEmptyStateProps {
  title?: string;
  description?: string;
}

export function OrdersEmptyState({
  title = "Chưa có đơn nào ở mục này",
  description = "Khi bạn đặt hàng, đơn sẽ hiện ở đây cùng trạng thái mới nhất.",
}: OrdersEmptyStateProps) {
  return (
    <Card className="p-14 text-center flex flex-col items-center gap-3 bg-white border border-line shadow-xs">
      <h2 className="font-head font-bold text-2xl sm:text-[26px] text-ink">
        {title}
      </h2>
      <p className="text-[15px] text-ink-2 max-w-[420px] leading-relaxed">
        {description}
      </p>
      <Link
        to="/search"
        className="inline-flex items-center justify-center min-h-[52px] px-7 rounded-control font-semibold text-base bg-brand text-white hover:bg-brand-dark transition-colors mt-2"
      >
        Bắt đầu mua sắm
      </Link>
    </Card>
  );
}
