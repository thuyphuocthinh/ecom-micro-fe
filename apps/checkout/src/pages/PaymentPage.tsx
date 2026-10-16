import { useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import { Spinner, Button, Icon } from "@ecom/ui";
import { formatCurrency } from "@/utils/format.ts";
import {
  getPaymentState,
  providerRefFromPayUrl,
} from "@/features/checkout/utils";
import {
  useOrderDetailQuery,
  useOrderPaymentsQuery,
  useStartPaymentMutation,
  useDevGatewayMutation,
} from "@/features/checkout/hooks";
import {
  CheckoutStepper,
  PaymentCountdownTimer,
  PaymentQrCard,
  PaymentDevSimulator,
} from "@/features/checkout/components";

export function PaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId") ?? undefined;

  const {
    data: order,
    isLoading: isLoadingOrder,
    refetch: refetchOrder,
  } = useOrderDetailQuery(orderId);

  const {
    data: payments = [],
    isLoading: isLoadingPayments,
    refetch: refetchPayments,
  } = useOrderPaymentsQuery(orderId);

  const startPaymentMutation = useStartPaymentMutation();
  const { simulatePay, simulateFail, isPaying, isFailing } =
    useDevGatewayMutation(orderId);

  const latestPayment = payments[0];

  // If the order is pending and has no payment yet, start the first one. Wait until the list of payments
  // has arrived: while it is loading `payments` is empty even when a payment exists. The key of the request
  // is fixed for the order and the attempt, so a second request (page drawn again) gets the same payment back.
  useEffect(() => {
    if (
      order &&
      order.status === "PENDING" &&
      !isLoadingPayments &&
      payments.length === 0 &&
      !startPaymentMutation.isPending &&
      !startPaymentMutation.isSuccess
    ) {
      startPaymentMutation.mutate({ orderId: order.id, attempt: 1 });
    }
  }, [order, isLoadingPayments, payments.length, startPaymentMutation]);

  if (!orderId) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col">
        <CheckoutStepper currentStep={3} />
        <div className="max-w-[640px] mx-auto px-4 py-16 text-center flex flex-col items-center gap-4">
          <h1 className="font-head text-2xl font-bold text-ink">
            Không tìm thấy thông tin đơn hàng
          </h1>
          <p className="text-sm text-muted">
            Vui lòng kiểm tra lại đường dẫn thanh toán hoặc quay về giỏ hàng.
          </p>
          <Link to="/cart">
            <Button variant="primary" size="md">
              Về giỏ hàng
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoadingOrder || isLoadingPayments) {
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
          <Link to="/cart">
            <Button variant="primary" size="md">
              Về giỏ hàng
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { isSuccess, isFailed, isExpired, isWaiting } = getPaymentState(
    order.status,
    latestPayment?.status,
  );

  const attemptNumber = payments.length || 1;
  const maxAttempts = 3;
  const canRetry = attemptNumber < maxAttempts;

  const handleRetryPayment = () => {
    if (orderId && canRetry) {
      startPaymentMutation.mutate({ orderId, attempt: payments.length + 1 });
    }
  };

  // What the dev simulator needs is the reference of the charge at the gateway, not the id of the payment.
  const providerRef = providerRefFromPayUrl(latestPayment?.payUrl);

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <CheckoutStepper currentStep={3} />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-10 py-8 pb-16 w-full">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
          {/* Main payment panel */}
          <div className="flex-1 min-w-0 w-full flex flex-col gap-6">
            {/* 1. Waiting State */}
            {isWaiting && (
              <PaymentQrCard
                amount={order.total}
                orderCode={order.id}
                attempt={attemptNumber}
                maxAttempts={maxAttempts}
                payUrl={latestPayment?.payUrl}
                timerNode={
                  <PaymentCountdownTimer
                    expiresAt={order.expiresAt}
                    onExpire={() => {
                      refetchOrder();
                      refetchPayments();
                    }}
                  />
                }
              />
            )}

            {/* 2. Success State */}
            {isSuccess && (
              <section
                role="status"
                aria-labelledby="t-ok"
                className="bg-canvas border border-ok/40 rounded-2xl p-8 sm:p-10 flex flex-col gap-5 items-start shadow-sm"
              >
                <span
                  aria-hidden="true"
                  className="size-14 rounded-full bg-ok-tint flex items-center justify-center text-ok"
                >
                  <Icon name="check" size={32} strokeWidth={2.5} />
                </span>
                <h1 id="t-ok" className="font-head text-3xl font-bold text-ink">
                  Thanh toán thành công
                </h1>
                <p className="text-ink-2 max-w-lg">
                  Chúng tôi đã nhận{" "}
                  <strong className="text-ink font-semibold">
                    {formatCurrency(order.total)}
                  </strong>{" "}
                  và xác nhận đơn hàng của bạn.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() =>
                    navigate(`/checkout/success?orderId=${order.id}`)
                  }
                >
                  Xem đơn hàng
                </Button>
              </section>
            )}

            {/* 3. Failed State */}
            {isFailed && (
              <section
                role="alert"
                aria-labelledby="t-fail"
                className="bg-canvas border border-sale/40 rounded-2xl p-8 sm:p-10 flex flex-col gap-5 items-start shadow-sm"
              >
                <div className="size-14 rounded-full bg-sale-tint flex items-center justify-center text-sale">
                  <Icon name="x" size={32} strokeWidth={2} />
                </div>
                <h1
                  id="t-fail"
                  className="font-head text-3xl font-bold text-ink"
                >
                  Thanh toán chưa thành công
                </h1>
                <p className="text-ink-2 max-w-lg">
                  Cổng thanh toán báo giao dịch không hoàn tất. Bạn chưa bị trừ
                  tiền. Hàng vẫn được giữ cho bạn tới hết thời gian còn lại.
                </p>

                <div className="flex gap-3 flex-wrap items-center">
                  {canRetry ? (
                    <Button
                      variant="primary"
                      size="lg"
                      loading={startPaymentMutation.isPending}
                      onClick={handleRetryPayment}
                    >
                      Thử lại, còn {maxAttempts - attemptNumber} lần
                    </Button>
                  ) : (
                    <p className="text-sm font-semibold text-sale">
                      Bạn đã dùng hết 3 lần thử cho đơn này.
                    </p>
                  )}
                  <Link to="/cart">
                    <Button variant="secondary" size="lg">
                      Về giỏ hàng
                    </Button>
                  </Link>
                </div>
              </section>
            )}

            {/* 4. Expired State */}
            {isExpired && (
              <section
                role="alert"
                aria-labelledby="t-exp"
                className="bg-canvas border border-line rounded-2xl p-8 sm:p-10 flex flex-col gap-5 items-start shadow-sm"
              >
                <div className="size-14 rounded-full bg-surface-sunken flex items-center justify-center text-muted">
                  <Icon name="clock" size={32} strokeWidth={1.75} />
                </div>
                <h1
                  id="t-exp"
                  className="font-head text-3xl font-bold text-ink"
                >
                  Đã hết thời gian thanh toán
                </h1>
                <p className="text-ink-2 max-w-lg">
                  Đơn hàng đã được huỷ và hàng đã trả lại kho. Nếu bạn đã chuyển
                  khoản ở phút cuối, tiền sẽ được hoàn lại tự động.
                </p>
                <Link to="/cart">
                  <Button variant="primary" size="lg">
                    Về giỏ hàng để đặt lại
                  </Button>
                </Link>
              </section>
            )}

            {/* 5. Dev Gateway Simulator (shown in dev mode or waiting) */}
            {isWaiting && providerRef && (
              <PaymentDevSimulator
                onSimulatePaid={() =>
                  simulatePay({ providerRef, amount: order.total })
                }
                onSimulateFailed={() => simulateFail({ providerRef })}
                isLoading={isPaying || isFailing}
              />
            )}
          </div>

          {/* Sticky Aside: Order info */}
          <aside
            aria-label="Tóm tắt đơn hàng"
            className="bg-canvas border border-line rounded-2xl p-6 flex flex-col gap-5 shadow-sm sticky top-6 w-full lg:w-[400px] flex-none"
          >
            <h2 className="font-head text-xl font-bold text-ink">
              Đơn hàng #{order.id.slice(0, 8).toUpperCase()}
            </h2>

            <ul className="list-none m-0 p-0 flex flex-col gap-3">
              {order.items.map((line) => (
                <li
                  key={line.skuId}
                  className="flex justify-between items-baseline gap-4 text-sm"
                >
                  <span className="min-w-0 truncate text-ink">
                    {line.productName}{" "}
                    <span className="font-mono text-muted">
                      × {line.quantity}
                    </span>
                  </span>
                  <span className="font-mono font-semibold text-ink flex-none">
                    {formatCurrency(line.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="m-0 flex flex-col gap-3 border-t border-line pt-4 text-sm">
              <div className="flex justify-between items-baseline">
                <dt className="text-muted">Vận chuyển</dt>
                <dd className="m-0 font-mono font-semibold text-ok">
                  Miễn phí
                </dd>
              </div>
              <div className="flex justify-between items-baseline border-t border-line pt-3.5">
                <dt className="font-bold text-base text-ink">Cần thanh toán</dt>
                <dd className="m-0 font-head font-bold text-2xl text-ink tracking-tight">
                  {formatCurrency(order.total)}
                </dd>
              </div>
            </dl>

            <div className="border-t border-line pt-4 flex flex-col gap-1 text-sm">
              <h3 className="font-semibold text-ink">Giao tới</h3>
              <p className="text-ink-2">
                {order.shippingAddress.recipientName},{" "}
                <span className="font-mono text-muted">
                  {order.shippingAddress.phone}
                </span>
              </p>
              <p className="text-muted text-xs leading-relaxed">
                {order.shippingAddress.street}, {order.shippingAddress.wardName}
                , {order.shippingAddress.provinceName}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
