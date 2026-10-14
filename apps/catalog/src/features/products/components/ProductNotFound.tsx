import { Link } from "react-router";
import { buttonClasses } from "@ecom/ui";

export function ProductNotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4 min-h-[420px]">
      <div className="size-16 rounded-full bg-brand-tint flex items-center justify-center text-brand mb-4">
        <svg
          aria-hidden="true"
          className="size-8 stroke-current stroke-2 fill-none"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
          <path
            d="M12 8v4M12 16h.01"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h1 className="font-head text-[26px] sm:text-[32px] font-bold text-ink tracking-tight mb-2">
        Không tìm thấy sản phẩm
      </h1>

      <p className="text-muted text-[15px] max-w-[480px] mb-6">
        Sản phẩm bạn đang tìm kiếm có thể đã ngừng kinh doanh hoặc đường dẫn
        không chính xác.
      </p>

      <Link
        to="/search"
        className={buttonClasses({ variant: "primary", size: "lg" })}
      >
        Quay lại danh mục sản phẩm
      </Link>
    </div>
  );
}
