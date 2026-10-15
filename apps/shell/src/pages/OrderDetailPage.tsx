import { useState } from "react";
import { useParams, Link } from "react-router";
import { Button, Card, Spinner, Tag } from "@ecom/ui";
import { toast } from "sonner";
import { Icon } from "@/components/common/Icon.tsx";
import {
  CancelOrderModal,
  OrderItemsList,
  OrderPaymentCard,
  OrderShippingCard,
  OrderTrackingTimeline,
} from "@/features/orders/components";
import {
  useOrderDetailQuery,
  useCancelOrderMutation,
} from "@/features/orders/hooks";
import {
  getOrderStatusMeta,
  isOrderCancellable,
} from "@/features/orders/utils/order-status.ts";
import {
  formatOrderCode,
  formatOrderDate,
  formatVnd,
} from "@/features/orders/utils/order-format.ts";

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const { data: order, isLoading, isError } = useOrderDetailQuery(id);

  const cancelMutation = useCancelOrderMutation();

  const handleOpenCancel = () => setIsCancelModalOpen(true);
  const handleCloseCancel = () => setIsCancelModalOpen(false);

  const handleConfirmCancel = async (orderId: string) => {
    try {
      await cancelMutation.mutateAsync(orderId);
      setIsCancelModalOpen(false);
      toast.success(
        "Đã huỷ đơn thành công. Hàng được trả về kho và tiền sẽ hoàn lại.",
      );
    } catch {
      // Intercepted by api.onError
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-[1040px] mx-auto px-4 sm:px-10 py-8 pb-18 flex items-center justify-center min-h-[400px]">
        <Spinner className="size-8 text-brand" />
      </div>
    );
  }

  // Error / 404 Not Found state (AC-9)
  if (isError || !order) {
    return (
      <div className="max-w-[1040px] mx-auto px-4 sm:px-10 py-8 pb-18 flex flex-col items-center justify-center gap-4 text-center min-h-[400px]">
        <Card className="p-10 max-w-[500px] w-full flex flex-col items-center gap-3">
          <h1 className="font-head text-2xl font-bold text-ink">
            Không tìm thấy đơn hàng
          </h1>
          <p className="text-[15px] text-ink-2">
            Đơn hàng không tồn tại hoặc bạn không có quyền xem thông tin đơn
            hàng này.
          </p>
          <Link
            to="/account/orders"
            className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-control font-semibold text-[15px] bg-brand text-white hover:bg-brand-dark transition-colors mt-2"
          >
            Quay lại danh sách đơn hàng
          </Link>
        </Card>
      </div>
    );
  }

  const meta = getOrderStatusMeta(order.status);
  const code = formatOrderCode(order.id);
  const formattedDate = formatOrderDate(order.createdAt);
  const formattedTotal = formatVnd(order.total);

  const isCancelled =
    order.status === "CANCELLED" || order.status === "EXPIRED";
  const canCancel = isOrderCancellable(order.status);

  // Subtotal and shipping fee calculation fallback
  const subtotal =
    order.subtotal ??
    order.items.reduce(
      (acc, it) => acc + (it.unitPrice ?? it.price ?? 0) * it.quantity,
      0,
    );
  const shippingFee = order.shippingFee ?? Math.max(0, order.total - subtotal);

  return (
    <div className="max-w-[1040px] mx-auto px-4 sm:px-10 py-8 pb-18 flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav
        aria-label="Đường dẫn"
        className="text-sm text-muted flex items-center gap-2"
      >
        <Link to="/account/orders" className="hover:text-ink transition-colors">
          Đơn hàng của tôi
        </Link>
        <span aria-hidden="true">/</span>
        <span
          aria-current="page"
          className="text-ink font-medium"
          translate="no"
        >
          #{code}
        </span>
      </nav>

      {/* Header section */}
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div className="flex flex-col gap-2.5">
          <h1 className="font-head text-3xl sm:text-4xl font-bold text-ink tracking-tight">
            <span translate="no">Đơn #{code}</span>
          </h1>
          <div className="flex gap-3 items-center flex-wrap">
            <Tag tone={meta.tone}>{meta.label}</Tag>
            <span className="tnum text-muted text-sm">
              Đặt ngày {formattedDate}
            </span>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex gap-2.5 flex-wrap">
          {canCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleOpenCancel}
              className="text-err hover:bg-err/10 border-field-border"
            >
              Huỷ đơn
            </Button>
          )}
          <Link
            to="/cart"
            className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-control font-semibold text-[15px] bg-brand text-white hover:bg-brand-dark transition-colors"
          >
            Mua lại
          </Link>
        </div>
      </div>

      {/* Progress Timeline or Cancelled Status Banner */}
      {isCancelled ? (
        <section
          role="status"
          aria-label="Thông báo trạng thái đơn hàng"
          className="p-6 sm:px-7 sm:py-6 flex gap-4 items-start bg-[#f6f7f9] border border-line rounded-2xl"
        >
          <span
            className="size-11 rounded-xl inline-flex items-center justify-center shrink-0 bg-err-tint text-err"
            aria-hidden="true"
          >
            <Icon name="x-circle" size={20} />
          </span>
          <div className="flex flex-col gap-1.5">
            <h2 className="font-head font-bold text-xl text-ink">
              Đơn hàng đã được huỷ
            </h2>
            <p className="text-[15px] text-ink-2 max-w-[560px] leading-relaxed">
              Hàng đã trả về kho. Số tiền {formattedTotal} được hoàn lại cho bạn
              tự động, thường trong vài phút. Bạn không cần làm gì thêm.
            </p>
          </div>
        </section>
      ) : (
        <OrderTrackingTimeline order={order} />
      )}

      {/* Main Grid: Products (left) and Shipping + Payment (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-6 items-start">
        {/* Left Column: Items */}
        <OrderItemsList
          items={order.items}
          subtotal={subtotal}
          shippingFee={shippingFee}
          total={order.total}
        />

        {/* Right Column: Shipping & Payment */}
        <div className="flex flex-col gap-6">
          <OrderShippingCard address={order.shippingAddress} />
          <OrderPaymentCard
            paymentMethod={order.paymentMethod}
            payments={order.payments}
            createdAt={order.createdAt}
            isCancelled={isCancelled}
          />
        </div>
      </div>

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        orderId={order.id}
        isPending={cancelMutation.isPending}
        onClose={handleCloseCancel}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}

export default OrderDetailPage;
