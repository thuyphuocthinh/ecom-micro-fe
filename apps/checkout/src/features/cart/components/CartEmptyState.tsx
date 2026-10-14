import { Link } from "react-router";
import { buttonClasses } from "@ecom/ui";

export function CartEmptyState() {
  return (
    <div
      data-testid="cart-empty-state"
      className="card p-8 sm:p-18 text-center flex flex-col items-center gap-3.5 bg-white border border-line rounded-[14px]"
    >
      <h2 className="font-head text-[28px] font-bold tracking-tight text-ink">
        Giỏ hàng đang trống
      </h2>
      <p className="text-ink-2 max-w-[420px] text-[15px]">
        Chọn vài món bạn thích, hàng sẽ nằm ở đây cho tới khi bạn đặt hàng.
      </p>
      <Link
        to="/search"
        className={buttonClasses({ variant: "primary", size: "lg" }) + " mt-2"}
      >
        Tiếp tục mua sắm
      </Link>
    </div>
  );
}
