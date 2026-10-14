import { useEffect } from "react";

export interface CartUndoToastProps {
  productName: string | null;
  onUndo: () => void;
  onDismiss: () => void;
  durationMs?: number;
}

export function CartUndoToast({
  productName,
  onUndo,
  onDismiss,
  durationMs = 6000,
}: CartUndoToastProps) {
  useEffect(() => {
    if (!productName) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, durationMs);
    return () => clearTimeout(timer);
  }, [productName, onDismiss, durationMs]);

  if (!productName) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="cart-undo-toast"
      className="fixed left-1/2 bottom-6 -translate-x-1/2 z-40"
    >
      <div className="flex items-center gap-3.5 bg-ink text-white py-2 pl-4.5 pr-2 rounded-[12px] font-medium shadow-lg text-[14.5px]">
        <span>Đã xoá {productName}</span>
        <button
          type="button"
          onClick={onUndo}
          className="text-[#c9d3ff] hover:text-white font-semibold px-2 py-1 transition-colors cursor-pointer bg-transparent border-0"
        >
          Hoàn tác
        </button>
      </div>
    </div>
  );
}
