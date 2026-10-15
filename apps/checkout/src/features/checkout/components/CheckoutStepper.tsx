import { Link } from "react-router";
import { Icon } from "@ecom/ui";

export interface CheckoutStepperProps {
  currentStep: 2 | 3;
}

export function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  return (
    <header className="bg-canvas border-b border-line">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-10 py-4 flex items-center justify-between gap-6 flex-wrap">
        <Link
          to="/"
          aria-label="Ecom, về trang chủ"
          translate="no"
          className="font-head font-bold text-2xl sm:text-3xl tracking-tight text-ink min-h-[44px] inline-flex items-center"
        >
          ecom<span className="text-brand">.</span>
        </Link>

        <ol
          className="list-none m-0 p-0 flex gap-6 sm:gap-7 flex-wrap items-center"
          aria-label="Các bước mua hàng"
        >
          {/* Step 1: Giỏ hàng */}
          <li className="flex items-center gap-2.5 text-muted font-medium">
            <span
              className="size-7 rounded-full inline-flex items-center justify-center text-xs font-bold bg-ok text-white"
              aria-hidden="true"
            >
              <Icon name="check" size={16} strokeWidth={2.5} />
            </span>
            <Link
              to="/cart"
              className="text-ink hover:text-brand transition-colors"
            >
              Giỏ hàng
              <span className="sr-only">, đã xong</span>
            </Link>
          </li>

          {/* Step 2: Đặt hàng */}
          <li
            className={`flex items-center gap-2.5 ${
              currentStep === 2
                ? "text-ink font-bold"
                : "text-muted font-medium"
            }`}
            aria-current={currentStep === 2 ? "step" : undefined}
          >
            <span
              className={`size-7 rounded-full inline-flex items-center justify-center text-xs font-bold ${
                currentStep > 2
                  ? "bg-ok text-white"
                  : currentStep === 2
                    ? "bg-brand text-white"
                    : "bg-surface-sunken text-muted"
              }`}
              aria-hidden="true"
            >
              {currentStep > 2 ? (
                <Icon name="check" size={16} strokeWidth={2.5} />
              ) : (
                "2"
              )}
            </span>
            <span>Đặt hàng</span>
          </li>

          {/* Step 3: Thanh toán */}
          <li
            className={`flex items-center gap-2.5 ${
              currentStep === 3
                ? "text-ink font-bold"
                : "text-muted font-medium"
            }`}
            aria-current={currentStep === 3 ? "step" : undefined}
          >
            <span
              className={`size-7 rounded-full inline-flex items-center justify-center text-xs font-bold ${
                currentStep === 3
                  ? "bg-brand text-white"
                  : "bg-surface-sunken text-muted"
              }`}
              aria-hidden="true"
            >
              3
            </span>
            <span>Thanh toán</span>
          </li>
        </ol>

        <span className="inline-flex items-center gap-2 text-ink-2 text-sm">
          <Icon name="lock" size={16} strokeWidth={1.75} />
          Kết nối được mã hoá
        </span>
      </div>
    </header>
  );
}
