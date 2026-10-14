import { useEffect } from "react";
import { Button, Card } from "@ecom/ui";
import { formatOrderCode } from "../utils/order-format.ts";

export interface CancelOrderModalProps {
  orderId: string | null;
  isOpen: boolean;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: (orderId: string) => void;
}

export function CancelOrderModal({
  orderId,
  isOpen,
  isPending = false,
  onClose,
  onConfirm,
}: CancelOrderModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPending, onClose]);

  if (!isOpen || !orderId) return null;

  const code = formatOrderCode(orderId);

  return (
    <div
      className="fixed inset-0 z-60 bg-ink/55 flex items-center justify-center p-6 overscroll-contain animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose();
      }}
    >
      <Card
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dlg-title"
        aria-describedby="dlg-desc"
        className="max-w-[460px] w-full p-7 flex flex-col gap-3.5 bg-white border border-line shadow-xl rounded-2xl"
      >
        <h2 id="dlg-title" className="font-head font-bold text-2xl text-ink">
          Huỷ đơn #{code}?
        </h2>
        <p id="dlg-desc" className="text-[15px] text-ink-2 leading-relaxed">
          Hàng sẽ được trả về kho. Đơn đã thanh toán sẽ được hoàn tiền tự động.
          Bạn không thể hoàn tác thao tác này.
        </p>
        <div className="flex gap-2.5 justify-end flex-wrap mt-1.5">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isPending}
          >
            Giữ đơn
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => onConfirm(orderId)}
            disabled={isPending}
            className="bg-err hover:bg-[#9a1e14] border-transparent text-white"
          >
            {isPending ? "Đang huỷ..." : "Huỷ đơn"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
