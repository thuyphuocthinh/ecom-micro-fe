import { Link } from "react-router";

export interface ProductToastProps {
  message: string | null;
  onClose?: () => void;
}

export function ProductToast({ message, onClose }: ProductToastProps) {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 bottom-6 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="flex items-center gap-3 bg-ink text-white px-4 py-3 rounded-[12px] shadow-lg font-medium text-[14.5px] pointer-events-auto max-w-[90vw]">
        <svg
          aria-hidden="true"
          className="size-5 text-emerald-400 shrink-0 stroke-current stroke-2 fill-none"
          viewBox="0 0 24 24"
        >
          <path
            d="m5 12 5 5 9-10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <span className="truncate">{message}</span>

        <Link
          to="/cart"
          className="text-brand-tint font-semibold hover:underline ml-2 shrink-0"
        >
          Xem giỏ hàng
        </Link>

        {onClose && (
          <button
            type="button"
            aria-label="Đóng thông báo"
            onClick={onClose}
            className="ml-1 text-white/60 hover:text-white p-1 rounded transition-colors cursor-pointer"
          >
            <svg
              aria-hidden="true"
              className="size-4 stroke-current stroke-2 fill-none"
              viewBox="0 0 24 24"
            >
              <path
                d="M18 6 6 18M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
