import { Button } from "@ecom/ui";

export interface PaymentDevSimulatorProps {
  onSimulatePaid: () => void;
  onSimulateFailed: () => void;
  isLoading?: boolean;
}

export function PaymentDevSimulator({
  onSimulatePaid,
  onSimulateFailed,
  isLoading = false,
}: PaymentDevSimulatorProps) {
  return (
    <section
      aria-labelledby="dev-title"
      className="border-2 border-dashed border-line rounded-2xl bg-canvas p-5 sm:p-6 flex flex-col gap-3 shadow-inner"
    >
      <div>
        <h2
          id="dev-title"
          className="font-head text-base font-bold text-ink flex items-center gap-2"
        >
          <span className="size-2 rounded-full bg-warn" />
          Giả lập cổng thanh toán (Dev Simulator)
        </h2>
        <p className="text-xs text-muted mt-0.5">
          Chỉ hiển thị trong môi trường phát triển / thử nghiệm. Nhấp nút bên
          dưới để kích hoạt webhook giả lập mà không cần chuyển khoản thật.
        </p>
      </div>

      <div className="flex gap-2.5 flex-wrap pt-1">
        <Button
          variant="secondary"
          size="md"
          loading={isLoading}
          onClick={onSimulatePaid}
          className="border-ok/30 text-ok hover:bg-ok-tint/30 text-xs sm:text-sm font-semibold"
        >
          Khách đã trả (Pay Success)
        </Button>
        <Button
          variant="secondary"
          size="md"
          loading={isLoading}
          onClick={onSimulateFailed}
          className="border-sale/30 text-sale hover:bg-sale-tint/30 text-xs sm:text-sm font-semibold"
        >
          Giao dịch thất bại (Pay Fail)
        </Button>
      </div>
    </section>
  );
}
