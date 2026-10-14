import { Link } from "react-router";
import type { CartLineItem } from "@/types";
import { CartItemRow } from "./CartItemRow.tsx";

export interface CartItemListProps {
  items: CartLineItem[];
  onUpdateQuantity: (skuId: string, quantity: number) => void;
  onRemove: (skuId: string) => void;
  disabled?: boolean;
}

export function CartItemList({
  items,
  onUpdateQuantity,
  onRemove,
  disabled = false,
}: CartItemListProps) {
  return (
    <section
      aria-label="Sản phẩm trong giỏ"
      className="flex-1 flex flex-col gap-4 min-w-0"
    >
      <ul className="card list-none m-0 p-0 overflow-hidden bg-white border border-line rounded-[14px]">
        {items.map((item) => (
          <CartItemRow
            key={item.skuId}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemove}
            disabled={disabled}
          />
        ))}
      </ul>

      <Link
        to="/search"
        className="text-brand font-semibold text-[15px] underline underline-offset-[3px] hover:text-brand-dark self-start inline-block transition-colors"
      >
        Tiếp tục mua sắm
      </Link>
    </section>
  );
}
