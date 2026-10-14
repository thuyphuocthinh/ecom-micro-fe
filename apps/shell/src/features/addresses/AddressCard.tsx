import { Card, Button, Tag, cx } from "@ecom/ui";
import { Icon } from "@/components/common/Icon.tsx";
import type { Address } from "@/types";

export interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (address: Address) => void;
  onSetDefault: (id: string) => void;
  isSettingDefault?: boolean;
  className?: string;
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isSettingDefault = false,
  className,
}: AddressCardProps) {
  const displayLabel = address.label || "Địa chỉ";

  return (
    <Card
      className={cx(
        "p-6 flex flex-col gap-4 bg-white border-line h-full",
        className,
      )}
    >
      <div className="flex gap-3.5 items-start">
        <span
          className="size-10 rounded-[10px] bg-[#fdeedd] text-[#9a5b12] inline-flex items-center justify-center shrink-0 mt-0.5"
          aria-hidden="true"
        >
          <Icon name="addresses" size={20} />
        </span>

        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-[17px] text-ink leading-tight">
              {displayLabel}
            </h3>
            {address.isDefault && <Tag tone="brand">Mặc định</Tag>}
          </div>

          <p className="text-[15px] text-ink">
            <span className="font-semibold">{address.recipientName}</span>
            <span className="text-muted">, </span>
            <span className="tabular-nums text-muted">{address.phone}</span>
          </p>

          <p className="text-[14px] text-ink-2 leading-relaxed">
            {address.street}, {address.wardName}, {address.provinceName}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-wrap border-t border-line pt-3 mt-auto">
        <Button
          type="button"
          variant="ghost"
          size="md"
          onClick={() => onEdit(address)}
          aria-label={`Sửa địa chỉ ${displayLabel}`}
        >
          Sửa
        </Button>

        {!address.isDefault && (
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={() => onSetDefault(address.id)}
            loading={isSettingDefault}
            disabled={isSettingDefault}
            aria-label={`Đặt ${displayLabel} làm mặc định`}
          >
            Đặt làm mặc định
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          size="md"
          onClick={() => onDelete(address)}
          className="text-err hover:bg-err/10 hover:text-err ml-auto"
          aria-label={`Xoá địa chỉ ${displayLabel}`}
        >
          Xoá
        </Button>
      </div>
    </Card>
  );
}
