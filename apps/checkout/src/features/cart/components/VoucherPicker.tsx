import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Link } from "react-router";
import { Button, Icon, linkClasses } from "@ecom/ui";
import type { VoucherListItem } from "@/types";
import { formatCurrency } from "@/features/cart/utils/cart-format.ts";
import {
  describeDiscount,
  describeMinimum,
  describeUnusable,
  formatVoucherExpiry,
} from "@/features/cart/utils/voucher-format.ts";

export type VoucherListState = "idle" | "loading" | "error" | "ready";

/** What the line under the box says. */
export type VoucherStatus =
  | { kind: "none" }
  | { kind: "applying" }
  | { kind: "applied"; code: string }
  | { kind: "error"; message: string };

export interface VoucherPickerProps {
  /** A guest cannot use vouchers: the box is switched off and says why. */
  isGuest: boolean;
  /** The goods in the cart, to say how much more a voucher needs. */
  subtotal: number;
  /** The code that is chosen now (null for none). */
  appliedCode: string | null;
  status: VoucherStatus;
  vouchers: VoucherListItem[];
  listState: VoucherListState;
  /** The list was opened: the page may start loading it. */
  onOpen: () => void;
  /** A code was picked from the list or typed in (one code at most: it replaces the old one). */
  onSelect: (code: string) => void;
  onRemove: () => void;
}

/**
 * The "Mã giảm giá" box: a combobox that opens the list of the vouchers that are running. A voucher
 * that cannot be used on this cart is shown dimmed with the reason and cannot be picked. A code can
 * also be typed in. It only shows and reports; what a voucher takes off comes from the server.
 */
export function VoucherPicker({
  isGuest,
  subtotal,
  appliedCode,
  status,
  vouchers,
  listState,
  onOpen,
  onSelect,
  onRemove,
}: VoucherPickerProps) {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState(appliedCode ?? "");
  const [typed, setTyped] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // The box follows the chosen code (a code dropped by the server empties it). Done while rendering,
  // from the previous value, so there is no second render caused by an effect.
  const [shownCode, setShownCode] = useState(appliedCode);
  if (appliedCode !== shownCode) {
    setShownCode(appliedCode);
    setInputValue(appliedCode ?? "");
    setTyped(false);
  }

  const visible = useMemo(() => {
    const term = typed ? inputValue.trim().toLowerCase() : "";
    if (!term) return vouchers;
    return vouchers.filter(
      (v) =>
        v.code.toLowerCase().includes(term) ||
        v.name.toLowerCase().includes(term),
    );
  }, [vouchers, typed, inputValue]);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutside);
    return () => document.removeEventListener("mousedown", closeOnOutside);
  }, [isOpen]);

  const open = () => {
    if (isGuest) return;
    if (!isOpen) onOpen();
    setIsOpen(true);
  };

  const choose = (code: string) => {
    onSelect(code);
    setInputValue(code);
    setTyped(false);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const applyTyped = () => {
    const code = inputValue.trim();
    if (code) choose(code);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        open();
        setActiveIndex((i) => Math.min(visible.length - 1, i + 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
        break;
      case "Enter": {
        event.preventDefault();
        const active = isOpen ? visible[activeIndex] : undefined;
        if (active) {
          if (active.usable) choose(active.code);
        } else {
          applyTyped();
        }
        break;
      }
      case "Escape":
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  const optionId = (index: number) => `${listId}-option-${index}`;
  const isApplying = status.kind === "applying";

  return (
    <div ref={containerRef} className="flex flex-col gap-1.5">
      <label htmlFor="coupon" className="font-semibold text-[14px] text-ink">
        Mã giảm giá
      </label>

      <div className="relative">
        <div className="flex gap-2">
          <div className="relative w-full">
            <input
              id="coupon"
              name="coupon"
              role="combobox"
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="Chọn hoặc nhập mã…"
              value={inputValue}
              disabled={isGuest}
              aria-expanded={isOpen}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={
                isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined
              }
              aria-invalid={status.kind === "error"}
              aria-describedby="coupon-msg"
              onChange={(event) => {
                setInputValue(event.target.value);
                setTyped(true);
                setActiveIndex(-1);
                open();
              }}
              onFocus={open}
              onClick={open}
              onKeyDown={handleKeyDown}
              className="w-full min-h-[44px] pl-3.5 pr-10 border border-field-border rounded-[10px] bg-white text-ink text-[15px] focus:outline-none focus:border-brand focus:ring-3 focus:ring-brand/25 transition-colors aria-invalid:border-err disabled:opacity-55 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              tabIndex={-1}
              aria-label="Mở danh sách mã giảm giá"
              disabled={isGuest}
              onClick={() => (isOpen ? setIsOpen(false) : open())}
              className="absolute right-2 top-1/2 -translate-y-1/2 size-8 flex items-center justify-center rounded-control text-muted hover:text-ink disabled:opacity-55"
            >
              <Icon name="chevron-down" size={16} />
            </button>
          </div>
          <Button
            type="button"
            variant="secondary"
            loading={isApplying}
            disabled={isGuest || isApplying}
            onClick={applyTyped}
            className="flex-shrink-0"
          >
            Áp dụng
          </Button>
        </div>

        {isOpen && (
          <ul
            id={listId}
            role="listbox"
            aria-label="Mã giảm giá"
            className="absolute z-20 left-0 right-0 mt-1.5 max-h-[320px] overflow-auto m-0 p-1.5 list-none bg-white border border-line rounded-[12px] shadow-lg flex flex-col gap-1"
          >
            {listState === "loading" || listState === "idle" ? (
              <li role="presentation" className="p-3 text-[13px] text-muted">
                Đang tải danh sách mã…
              </li>
            ) : listState === "error" ? (
              <li role="presentation" className="p-3 text-[13px] text-muted">
                Chưa tải được danh sách mã. Bạn vẫn có thể gõ mã vào ô.
              </li>
            ) : vouchers.length === 0 ? (
              <li role="presentation" className="p-3 text-[13px] text-muted">
                Hiện chưa có mã giảm giá nào.
              </li>
            ) : visible.length === 0 ? (
              <li role="presentation" className="p-3 text-[13px] text-muted">
                Không có mã nào khớp.
              </li>
            ) : (
              visible.map((voucher, index) => {
                const reason = voucher.usable
                  ? null
                  : describeUnusable(voucher, subtotal);
                const details = [
                  describeDiscount(voucher),
                  describeMinimum(voucher),
                  formatVoucherExpiry(voucher.endsAt),
                ]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <li
                    key={voucher.code}
                    id={optionId(index)}
                    role="option"
                    aria-selected={voucher.code === appliedCode}
                    aria-disabled={!voucher.usable}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => voucher.usable && choose(voucher.code)}
                    className={`flex flex-col gap-0.5 rounded-[8px] px-3 py-2.5 ${
                      voucher.usable
                        ? "cursor-pointer hover:bg-canvas"
                        : "opacity-55 cursor-not-allowed"
                    } ${index === activeIndex ? "bg-canvas" : ""}`}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-mono font-semibold text-ink">
                        {voucher.code}
                      </span>
                      {voucher.usable && voucher.discountAmount !== null && (
                        <span className="tnum font-semibold text-ok text-[14px]">
                          −{formatCurrency(voucher.discountAmount)}
                        </span>
                      )}
                    </div>
                    <span className="text-[13px] text-ink-2">
                      {voucher.name}
                    </span>
                    <span className="text-[12.5px] text-muted">{details}</span>
                    {reason && (
                      <span className="text-[12.5px] font-medium text-err">
                        {reason}
                      </span>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>

      <p
        id="coupon-msg"
        aria-live="polite"
        className={
          status.kind === "error"
            ? "text-[13px] text-err font-medium mt-0.5"
            : status.kind === "applied"
              ? "text-[13px] text-ok font-medium mt-0.5"
              : "text-[13px] text-muted mt-0.5"
        }
      >
        {isGuest ? (
          <>
            Đăng nhập để dùng mã giảm giá.{" "}
            <Link to="/login?returnTo=%2Fcart" className={linkClasses()}>
              Đăng nhập
            </Link>
          </>
        ) : status.kind === "error" ? (
          status.message
        ) : status.kind === "applying" ? (
          "Đang kiểm tra mã…"
        ) : status.kind === "applied" ? (
          `Đã áp dụng mã ${status.code}.`
        ) : (
          "Chọn một mã từ danh sách hoặc nhập mã của bạn."
        )}
      </p>

      {appliedCode && !isGuest && (
        <button
          type="button"
          onClick={() => {
            onRemove();
            setIsOpen(false);
          }}
          className={`${linkClasses()} self-start text-[13px] bg-transparent border-0 p-0`}
        >
          Bỏ mã
        </button>
      )}
    </div>
  );
}
