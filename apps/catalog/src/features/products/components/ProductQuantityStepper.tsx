export interface ProductQuantityStepperProps {
  quantity: number;
  max?: number;
  onChange: (qty: number) => void;
  disabled?: boolean;
}

export function ProductQuantityStepper({
  quantity,
  max = 99,
  onChange,
  disabled = false,
}: ProductQuantityStepperProps) {
  const isAtMin = quantity <= 1;
  const isAtMax = quantity >= max;

  const handleDecrease = () => {
    if (!disabled && !isAtMin) {
      onChange(Math.max(1, quantity - 1));
    }
  };

  const handleIncrease = () => {
    if (!disabled && !isAtMax) {
      onChange(Math.min(max, quantity + 1));
    }
  };

  return (
    <div className="flex items-center gap-3.5 flex-wrap">
      <span id="qty-label" className="font-semibold text-[14.5px] text-ink">
        Số lượng
      </span>

      <div
        role="group"
        aria-labelledby="qty-label"
        className="inline-flex items-center border border-line rounded-[10px] bg-white overflow-hidden shadow-2xs"
      >
        <button
          type="button"
          aria-label="Giảm số lượng"
          disabled={disabled || isAtMin}
          onClick={handleDecrease}
          className="size-[42px] flex items-center justify-center border-0 bg-transparent text-ink hover:bg-canvas disabled:text-muted/40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <svg
            aria-hidden="true"
            className="size-4 stroke-current stroke-2 fill-none"
            viewBox="0 0 24 24"
          >
            <path d="M5 12h14" strokeLinecap="round" />
          </svg>
        </button>

        <span
          aria-live="polite"
          className="min-w-[40px] text-center font-semibold text-[15px] text-ink tnum select-none"
        >
          {quantity}
        </span>

        <button
          type="button"
          aria-label="Tăng số lượng"
          disabled={disabled || isAtMax}
          onClick={handleIncrease}
          className="size-[42px] flex items-center justify-center border-0 bg-transparent text-ink hover:bg-canvas disabled:text-muted/40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <svg
            aria-hidden="true"
            className="size-4 stroke-current stroke-2 fill-none"
            viewBox="0 0 24 24"
          >
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {isAtMax && (
        <span className="text-[13px] text-muted">Đã đạt số lượng còn lại</span>
      )}
    </div>
  );
}
