import type { PaymentMethod } from "@/types";

export interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
}

export function PaymentMethodSelector({
  selectedMethod,
  onSelectMethod,
}: PaymentMethodSelectorProps) {
  const isOnline = selectedMethod === "ONLINE";
  const isCod = selectedMethod === "COD";

  return (
    <section
      aria-labelledby="pay-title"
      className="bg-canvas border border-line rounded-2xl p-6 flex flex-col gap-4 shadow-sm"
    >
      <h2 id="pay-title" className="font-head text-xl font-bold text-ink">
        Cách thanh toán
      </h2>

      <fieldset className="border-0 m-0 p-0 flex flex-col gap-3">
        <legend className="sr-only">Chọn cách thanh toán</legend>

        {/* Online Payment */}
        <label
          className={`flex gap-3.5 items-start p-4 rounded-xl border cursor-pointer transition-colors ${
            isOnline
              ? "border-brand bg-brand-tint/20 ring-1 ring-brand"
              : "border-line bg-canvas hover:border-ink/50"
          }`}
        >
          <input
            type="radio"
            name="payment_method"
            value="ONLINE"
            checked={isOnline}
            onChange={() => onSelectMethod("ONLINE")}
            className="size-5 mt-0.5 accent-brand flex-none cursor-pointer"
          />
          <span className="flex flex-col gap-1 text-sm">
            <span className="font-semibold text-ink">
              Thanh toán trực tuyến
            </span>
            <span className="text-muted">
              Sau khi đặt, bạn có 15 phút để trả tiền. Hàng được giữ cho bạn
              trong thời gian đó.
            </span>
          </span>
        </label>

        {/* COD */}
        <label
          className={`flex gap-3.5 items-start p-4 rounded-xl border cursor-pointer transition-colors ${
            isCod
              ? "border-brand bg-brand-tint/20 ring-1 ring-brand"
              : "border-line bg-canvas hover:border-ink/50"
          }`}
        >
          <input
            type="radio"
            name="payment_method"
            value="COD"
            checked={isCod}
            onChange={() => onSelectMethod("COD")}
            className="size-5 mt-0.5 accent-brand flex-none cursor-pointer"
          />
          <span className="flex flex-col gap-1 text-sm">
            <span className="font-semibold text-ink">
              Tiền mặt khi nhận hàng
            </span>
            <span className="text-muted">
              Đơn được xác nhận ngay. Bạn trả tiền cho người giao hàng.
            </span>
          </span>
        </label>
      </fieldset>
    </section>
  );
}
