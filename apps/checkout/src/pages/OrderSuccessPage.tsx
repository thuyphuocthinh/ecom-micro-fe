import { useSearchParams, Link } from "react-router";
import { Spinner, Button, Tag, Image, Icon } from "@ecom/ui";
import { formatCurrency } from "@/utils/format.ts";
import { useOrderDetailQuery } from "@/features/checkout/hooks";
import {
  CheckoutStepper,
  OrderTrackingTimeline,
} from "@/features/checkout/components";

export function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") ?? undefined;

  const { data: order, isLoading } = useOrderDetailQuery(orderId);

  if (!orderId) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col">
        <CheckoutStepper currentStep={3} />
        <div className="max-w-[640px] mx-auto px-4 py-16 text-center flex flex-col items-center gap-4">
          <h1 className="font-head text-2xl font-bold text-ink">
            Không tìm thấy thông tin đơn hàng
          </h1>
          <Link to="/">
            <Button variant="primary" size="md">
              Về trang chủ
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col">
        <CheckoutStepper currentStep={3} />
        <div className="flex-1 flex items-center justify-center p-12">
          <Spinner className="size-8 text-brand" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col">
        <CheckoutStepper currentStep={3} />
        <div className="max-w-[640px] mx-auto px-4 py-16 text-center flex flex-col items-center gap-4">
          <h1 className="font-head text-2xl font-bold text-ink">
            Đơn hàng không tồn tại
          </h1>
          <Link to="/">
            <Button variant="primary" size="md">
              Về trang chủ
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOnline = order.paymentMethod === "ONLINE";
  const orderCode = order.id.slice(0, 8).toUpperCase();

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <CheckoutStepper currentStep={3} />

      <div className="max-w-[880px] mx-auto px-4 sm:px-10 py-10 pb-20 flex flex-col gap-8 w-full">
        {/* Confirmation banner */}
        <div className="flex flex-col gap-3.5 items-center text-center">
          <span
            aria-hidden="true"
            className="size-20 sm:size-22 rounded-full bg-ok-tint flex items-center justify-center text-ok shadow-sm animate-in fade-in zoom-in duration-300"
          >
            <Icon name="check" size={44} strokeWidth={2.5} />
          </span>

          <h1 className="font-head text-3xl sm:text-4xl font-bold text-ink max-w-[640px]">
            Cảm ơn bạn, đơn hàng đã được xác nhận.
          </h1>

          <p className="text-sm sm:text-base text-ink-2 max-w-lg leading-relaxed">
            Chúng tôi sẽ thông báo khi đơn bắt đầu giao. Bạn có thể huỷ đơn bất
            cứ lúc nào trước khi giao hàng.
          </p>

          <Tag tone="brand" className="text-sm px-3.5 py-1 font-mono font-bold">
            Mã đơn: #{orderCode}
          </Tag>
        </div>

        {/* Order Progress tracking */}
        <OrderTrackingTimeline />

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-6 items-start">
          {/* Products card */}
          <section
            aria-labelledby="items-title"
            className="bg-canvas border border-line rounded-2xl p-6 flex flex-col gap-4 shadow-sm"
          >
            <h2
              id="items-title"
              className="font-head text-lg font-bold text-ink flex items-center gap-2.5"
            >
              <span className="size-9 rounded-xl bg-brand-tint/40 text-brand flex items-center justify-center">
                <Icon name="package" size={20} strokeWidth={1.75} />
              </span>
              Sản phẩm
            </h2>

            <ul className="list-none m-0 p-0 flex flex-col gap-3.5 divide-y divide-line/60">
              {order.items.map((line) => (
                <li
                  key={line.skuId}
                  className="pt-3.5 first:pt-0 grid grid-cols-[52px_minmax(0,1fr)_auto] gap-3 items-center"
                >
                  <div className="relative size-13 rounded-xl overflow-hidden bg-surface-sunken flex-none border border-line/60">
                    <Image
                      src={line.thumbnail}
                      alt={line.productName}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-ink truncate">
                      {line.productName}
                    </p>
                    <p className="font-mono text-xs text-muted">
                      Số lượng: {line.quantity}
                    </p>
                  </div>
                  <span className="font-mono font-semibold text-sm text-ink text-right">
                    {formatCurrency(line.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex justify-between items-baseline border-t border-line pt-3.5">
              <span className="font-bold text-sm text-ink">
                {isOnline ? "Đã thanh toán" : "Cần thanh toán khi nhận hàng"}
              </span>
              <span className="font-head font-bold text-xl text-ink tracking-tight">
                {formatCurrency(order.total)}
              </span>
            </div>
          </section>

          {/* Shipping & Payment summary */}
          <div className="flex flex-col gap-6">
            {/* Shipping address card */}
            <section
              aria-labelledby="ship-title"
              className="bg-canvas border border-line rounded-2xl p-6 flex flex-col gap-3 shadow-sm"
            >
              <h2
                id="ship-title"
                className="font-head text-base font-bold text-ink flex items-center gap-2.5"
              >
                <span className="size-9 rounded-xl bg-warn-tint text-warn flex items-center justify-center">
                  <Icon name="map-pin" size={20} strokeWidth={1.75} />
                </span>
                Giao tới
              </h2>
              <div className="text-sm flex flex-col gap-1">
                <p className="font-semibold text-ink">
                  {order.shippingAddress.recipientName}
                </p>
                <p className="font-mono text-muted text-xs">
                  {order.shippingAddress.phone}
                </p>
                <p className="text-ink-2 text-xs leading-relaxed mt-0.5">
                  {order.shippingAddress.street},{" "}
                  {order.shippingAddress.wardName},{" "}
                  {order.shippingAddress.provinceName}
                </p>
              </div>
            </section>

            {/* Payment card */}
            <section
              aria-labelledby="pay-title"
              className="bg-canvas border border-line rounded-2xl p-6 flex flex-col gap-3 shadow-sm"
            >
              <h2
                id="pay-title"
                className="font-head text-base font-bold text-ink flex items-center gap-2.5"
              >
                <span className="size-9 rounded-xl bg-ok-tint text-ok flex items-center justify-center">
                  <Icon name="credit-card" size={20} strokeWidth={1.75} />
                </span>
                Thanh toán
              </h2>
              <div className="text-sm flex flex-col gap-2 items-start">
                <p className="text-ink-2">
                  {isOnline
                    ? "Thanh toán trực tuyến"
                    : "Tiền mặt khi nhận hàng (COD)"}
                </p>
                {isOnline ? (
                  <Tag tone="ok" className="text-xs">
                    Đã nhận tiền
                  </Tag>
                ) : (
                  <Tag tone="default" className="text-xs">
                    Chờ thanh toán khi nhận hàng
                  </Tag>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Actions buttons */}
        <div className="flex gap-4 flex-wrap justify-center pt-4">
          <Link to="/">
            <Button variant="primary" size="lg">
              Tiếp tục mua sắm
            </Button>
          </Link>
          <Link to={`/account/orders/${order.id}`}>
            <Button variant="secondary" size="lg">
              Xem đơn hàng
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
