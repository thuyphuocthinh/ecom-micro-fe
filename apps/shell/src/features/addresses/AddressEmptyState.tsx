import { Card, Button } from "@ecom/ui";
import { Icon } from "@/components/common/Icon.tsx";

export interface AddressEmptyStateProps {
  onAddFirst: () => void;
}

export function AddressEmptyState({ onAddFirst }: AddressEmptyStateProps) {
  return (
    <Card className="py-14 px-8 text-center flex flex-col items-center justify-center gap-3 bg-white">
      <span
        className="size-16 rounded-2xl bg-[#fdeedd] text-[#9a5b12] inline-flex items-center justify-center mb-1"
        aria-hidden="true"
      >
        <Icon name="addresses" size={32} />
      </span>
      <h2 className="text-2xl font-bold text-ink">Bạn chưa lưu địa chỉ nào</h2>
      <p className="text-ink-2 max-w-[420px] text-[15px]">
        Lưu một địa chỉ để lần sau đặt hàng không phải nhập lại.
      </p>
      <div className="pt-2">
        <Button type="button" variant="primary" size="lg" onClick={onAddFirst}>
          Thêm địa chỉ đầu tiên
        </Button>
      </div>
    </Card>
  );
}
