import { Icon } from "@ecom/ui";

export function OrderTrackingTimeline() {
  return (
    <section
      aria-labelledby="track-title"
      className="bg-canvas border border-line rounded-2xl p-6 sm:p-8 flex flex-col gap-5 shadow-sm"
    >
      <h2 id="track-title" className="font-head text-lg font-bold text-ink">
        Hành trình đơn hàng
      </h2>

      <ol className="list-none m-0 p-0 flex items-start gap-3 sm:gap-4 overflow-x-auto pb-2">
        {/* Step 1: Đã xác nhận (Active) */}
        <li className="flex flex-col items-center gap-2.5 text-center w-[120px] sm:w-[150px] flex-none">
          <span
            className="size-12 sm:size-14 rounded-full inline-flex items-center justify-center bg-ok text-white shadow-sm"
            aria-hidden="true"
          >
            <Icon name="check" size={24} strokeWidth={2.5} />
          </span>
          <span className="text-sm">
            <strong className="text-ink">Đã xác nhận</strong>
            <span className="sr-only">, bước hiện tại</span>
            <br />
            <span className="text-xs text-muted">Vừa xong</span>
          </span>
        </li>

        {/* Connector 1 */}
        <li
          className="flex-1 h-1 rounded-full bg-line mt-6 sm:mt-7"
          aria-hidden="true"
        />

        {/* Step 2: Đang giao */}
        <li className="flex flex-col items-center gap-2.5 text-center w-[120px] sm:w-[150px] flex-none">
          <span
            className="size-12 sm:size-14 rounded-full inline-flex items-center justify-center bg-brand-tint/40 text-brand"
            aria-hidden="true"
          >
            <Icon name="truck" size={24} strokeWidth={1.75} />
          </span>
          <span className="text-sm">
            <strong className="text-ink-2">Đang giao</strong>
            <br />
            <span className="text-xs text-muted">Sau khi đóng gói</span>
          </span>
        </li>

        {/* Connector 2 */}
        <li
          className="flex-1 h-1 rounded-full bg-line mt-6 sm:mt-7"
          aria-hidden="true"
        />

        {/* Step 3: Đã giao */}
        <li className="flex flex-col items-center gap-2.5 text-center w-[120px] sm:w-[150px] flex-none">
          <span
            className="size-12 sm:size-14 rounded-full inline-flex items-center justify-center bg-surface-sunken text-muted"
            aria-hidden="true"
          >
            <Icon name="home" size={24} strokeWidth={1.75} />
          </span>
          <span className="text-sm">
            <strong className="text-muted">Đã giao</strong>
            <br />
            <span className="text-xs text-muted">Dự kiến 2-3 ngày</span>
          </span>
        </li>
      </ol>
    </section>
  );
}
