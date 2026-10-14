import { useEffect } from "react";
import { Button } from "@ecom/ui";

export interface DeleteAddressModalProps {
  open: boolean;
  addressLabel?: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting?: boolean;
}

export function DeleteAddressModal({
  open,
  addressLabel,
  onClose,
  onConfirm,
  isDeleting = false,
}: DeleteAddressModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, isDeleting, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 flex flex-col gap-4 border border-line">
        <h3 id="delete-dialog-title" className="text-lg font-bold text-ink">
          Xóa địa chỉ nhận hàng?
        </h3>
        <p className="text-sm text-ink-2 leading-relaxed">
          Bạn có chắc chắn muốn xóa địa chỉ{" "}
          <strong className="text-ink">{addressLabel || "này"}</strong> khỏi sổ
          địa chỉ? Hành động này không thể hoàn tác.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isDeleting}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="primary"
            loading={isDeleting}
            disabled={isDeleting}
            onClick={onConfirm}
            className="bg-err hover:bg-[#991b1b] text-white"
          >
            Xóa địa chỉ
          </Button>
        </div>
      </div>
    </div>
  );
}
