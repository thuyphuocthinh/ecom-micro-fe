import { QRCodeSVG } from "qrcode.react";
import { Spinner, Icon } from "@ecom/ui";
import { formatCurrency } from "@/utils/format.ts";

export interface PaymentQrCardProps {
  amount: number;
  orderCode: string;
  attempt?: number;
  maxAttempts?: number;
  /** The VietQR text the customer scans, drawn as a QR code. Null until the gateway has answered. */
  qrCode?: string | null;
  /** The gateway's own payment page: a way out when scanning does not work. */
  payUrl?: string | null;
  timerNode?: React.ReactNode;
}

export function PaymentQrCard({
  amount,
  orderCode,
  attempt = 1,
  maxAttempts = 3,
  qrCode,
  payUrl,
  timerNode,
}: PaymentQrCardProps) {
  return (
    <section
      aria-labelledby="t-wait"
      className="bg-canvas border border-line rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm"
    >
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div className="flex flex-col gap-1.5">
          <h1
            id="t-wait"
            className="font-head text-2xl sm:text-3xl font-bold text-ink"
          >
            Hoàn tất thanh toán
          </h1>
          <p className="text-sm text-ink-2">
            Trả{" "}
            <strong className="font-semibold text-ink">
              {formatCurrency(amount)}
            </strong>{" "}
            cho đơn hàng{" "}
            <span className="font-mono font-semibold text-brand">
              #{orderCode.slice(0, 8).toUpperCase()}
            </span>
            . Lần thử {attempt} trên {maxAttempts}.
          </p>
        </div>
        {timerNode}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[220px_minmax(0,1fr)] gap-6 sm:gap-8 items-center border-t border-line pt-6">
        {/* QR container: always white with black modules, so a banking app can scan it in dark mode too */}
        {qrCode ? (
          <div className="size-[220px] mx-auto rounded-2xl border border-line bg-white flex items-center justify-center shadow-inner">
            <QRCodeSVG
              value={qrCode}
              size={204}
              level="M"
              marginSize={2}
              bgColor="#ffffff"
              fgColor="#000000"
              role="img"
              aria-label="Mã QR thanh toán"
            />
          </div>
        ) : (
          <div className="size-[220px] mx-auto rounded-2xl border border-line bg-surface-sunken flex flex-col items-center justify-center text-center text-muted text-xs p-5 shadow-inner gap-3">
            <Spinner className="size-8 text-brand" />
            <span className="font-medium text-ink-2">Đang tạo mã QR…</span>
          </div>
        )}

        {/* Instructions */}
        <div className="flex flex-col gap-4">
          <ol className="m-0 p-0 pl-4 flex flex-col gap-2 text-sm text-ink-2 list-decimal">
            <li>Mở ứng dụng ngân hàng hoặc ví và quét mã QR.</li>
            <li>Kiểm tra số tiền và nội dung chuyển khoản rồi xác nhận.</li>
            <li>
              Giữ trang này mở, hệ thống sẽ tự động cập nhật khi nhận tiền.
            </li>
          </ol>

          {payUrl && (
            <a
              href={payUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 min-h-12 px-6 rounded-xl border border-line bg-canvas text-ink font-semibold text-sm hover:bg-surface-sunken transition-colors"
            >
              Không quét được? Mở trang thanh toán của cổng
              <Icon name="external-link" size={16} strokeWidth={2} />
            </a>
          )}

          <p
            role="status"
            className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-muted"
          >
            <Spinner className="size-4 text-brand" />
            Đang chờ cổng thanh toán xác nhận…
          </p>
        </div>
      </div>
    </section>
  );
}
