import { useState, useMemo } from "react";
import { useSearchParams } from "react-router";
import { Button, Spinner } from "@ecom/ui";
import { toast } from "sonner";
import {
  OrderStatusTabs,
  OrderFiltersBar,
  OrderCard,
  CancelOrderModal,
  OrdersEmptyState,
} from "@/features/orders/components";
import {
  useOrdersQuery,
  useOrderCountsQuery,
  useCancelOrderMutation,
} from "@/features/orders/hooks";
import type { OrderRangeKey, OrderSummary, OrderTabKey } from "@/types";

export function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL search params as single source of truth for filters
  const currentTab = (searchParams.get("tab") as OrderTabKey) || "all";
  const currentRange = (searchParams.get("range") as OrderRangeKey) || "all";
  const currentFrom = searchParams.get("from") || "";
  const currentTo = searchParams.get("to") || "";
  const currentQ = searchParams.get("q") || "";

  // Local state
  const [shownCount, setShownCount] = useState(4);
  const [cancelTarget, setCancelTarget] = useState<OrderSummary | null>(null);

  // Validate custom date range
  const rangeError = useMemo(() => {
    if (currentRange === "custom" && currentFrom && currentTo) {
      const fromDate = new Date(currentFrom + "T00:00:00Z").getTime();
      const toDate = new Date(currentTo + "T00:00:00Z").getTime();
      if (fromDate > toDate) {
        return "Ngày bắt đầu phải trước hoặc cùng ngày kết thúc.";
      }
    }
    return undefined;
  }, [currentRange, currentFrom, currentTo]);

  // Query filters (skip custom dates if range is invalid)
  const filterParams = useMemo(
    () => ({
      tab: currentTab,
      range: currentRange,
      from: rangeError ? undefined : currentFrom || undefined,
      to: rangeError ? undefined : currentTo || undefined,
      q: currentQ.trim().length >= 6 ? currentQ.trim() : undefined,
    }),
    [currentTab, currentRange, currentFrom, currentTo, currentQ, rangeError],
  );

  // TanStack Queries
  const { data: counts } = useOrderCountsQuery({
    from: filterParams.from,
    to: filterParams.to,
    q: filterParams.q,
  });

  const { data: ordersData, isLoading: isOrdersLoading } =
    useOrdersQuery(filterParams);
  const orders = ordersData?.orders ?? [];

  const cancelMutation = useCancelOrderMutation();

  // Filter setters updating search params
  const handleTabChange = (tab: OrderTabKey) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tab === "all") next.delete("tab");
      else next.set("tab", tab);
      return next;
    });
    setShownCount(4);
  };

  const handleRangeChange = (range: OrderRangeKey) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (range === "all") next.delete("range");
      else next.set("range", range);
      if (range !== "custom") {
        next.delete("from");
        next.delete("to");
      }
      return next;
    });
    setShownCount(4);
  };

  const handleFromChange = (from: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!from) next.delete("from");
      else next.set("from", from);
      return next;
    });
    setShownCount(4);
  };

  const handleToChange = (to: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!to) next.delete("to");
      else next.set("to", to);
      return next;
    });
    setShownCount(4);
  };

  const handleQChange = (q: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!q.trim()) next.delete("q");
      else next.set("q", q);
      return next;
    });
    setShownCount(4);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
    setShownCount(4);
  };

  // Order cancellation
  const handleOpenCancelModal = (order: OrderSummary) => {
    setCancelTarget(order);
  };

  const handleCloseCancelModal = () => {
    setCancelTarget(null);
  };

  const handleConfirmCancel = async (orderId: string) => {
    try {
      await cancelMutation.mutateAsync(orderId);
      setCancelTarget(null);
      toast.success("Đã huỷ đơn. Hàng được trả về kho và tiền sẽ hoàn lại.");
    } catch {
      // Handled by api.onError toast
    }
  };

  const visibleOrders = orders.slice(0, shownCount);
  const canShowMore = orders.length > shownCount;
  const countText = `${orders.length} đơn hàng`;

  const isLoading = isOrdersLoading;

  return (
    <div className="flex flex-col gap-5">
      {/* Page Title & Count */}
      <div>
        <h1 className="font-head text-3xl sm:text-4xl font-bold text-ink tracking-tight">
          Đơn hàng của tôi
        </h1>
        <p aria-live="polite" className="tnum text-[15px] text-muted mt-1.5">
          {countText}
        </p>
      </div>

      {/* Filters Bar */}
      <OrderFiltersBar
        range={currentRange}
        from={currentFrom}
        to={currentTo}
        q={currentQ}
        rangeError={rangeError}
        onRangeChange={handleRangeChange}
        onFromChange={handleFromChange}
        onToChange={handleToChange}
        onQChange={handleQChange}
        onClearFilters={handleClearFilters}
      />

      {/* Status Tabs */}
      <OrderStatusTabs
        activeTab={currentTab}
        counts={counts}
        onTabChange={handleTabChange}
      />

      {/* Main Content: Loading, Empty, or List */}
      {isLoading ? (
        <div className="flex min-h-[240px] items-center justify-center p-8">
          <Spinner className="size-8 text-brand" />
        </div>
      ) : visibleOrders.length === 0 ? (
        <OrdersEmptyState />
      ) : (
        <div className="flex flex-col gap-4">
          <ul className="list-none m-0 p-0 flex flex-col gap-4">
            {visibleOrders.map((order) => (
              <li key={order.id}>
                <OrderCard order={order} onCancel={handleOpenCancelModal} />
              </li>
            ))}
          </ul>

          {/* Show More Pagination Button */}
          {canShowMore && (
            <div className="flex justify-center mt-3">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => setShownCount((prev) => prev + 4)}
                className="w-full sm:w-auto min-w-[200px]"
              >
                Xem thêm đơn hàng
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={Boolean(cancelTarget)}
        orderId={cancelTarget?.id ?? null}
        isPending={cancelMutation.isPending}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}

export default OrdersPage;
