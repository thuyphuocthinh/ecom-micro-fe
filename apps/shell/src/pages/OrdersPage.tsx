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
  ORDERS_PAGE_SIZE,
  useOrdersQuery,
  useOrderCountsQuery,
  useCancelOrderMutation,
} from "@/features/orders/hooks";
import { useDebouncedSearchParam } from "@/hooks/common/useDebouncedSearchParam.ts";
import type { OrderRangeKey, OrderSummary, OrderTabKey } from "@/types";

export function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL search params as single source of truth for filters
  const currentTab = (searchParams.get("tab") as OrderTabKey) || "all";
  const currentRange = (searchParams.get("range") as OrderRangeKey) || "all";
  const currentFrom = searchParams.get("from") || "";
  const currentTo = searchParams.get("to") || "";
  // The order code is typed: the box follows every key, the URL (and so the API calls) only after a
  // pause, and without a history entry per letter (AC-7)
  const {
    input: qInput,
    setInput: setQInput,
    urlValue: currentQ,
  } = useDebouncedSearchParam("q");

  // Local state
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
    range: filterParams.range,
    from: filterParams.from,
    to: filterParams.to,
    q: filterParams.q,
  });

  const {
    data: ordersData,
    isLoading: isOrdersLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useOrdersQuery(filterParams, ORDERS_PAGE_SIZE);

  const orders = useMemo(
    () => ordersData?.pages.flatMap((page) => page.orders) ?? [],
    [ordersData],
  );

  const cancelMutation = useCancelOrderMutation();

  // Filter setters updating search params
  const handleTabChange = (tab: OrderTabKey) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tab === "all") next.delete("tab");
      else next.set("tab", tab);
      return next;
    });
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
  };

  const handleDateRangeApply = ({ from, to }: { from: string; to: string }) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("range", "custom");
      if (from) next.set("from", from);
      else next.delete("from");
      if (to) next.set("to", to);
      else next.delete("to");
      return next;
    });
  };

  const handleFromChange = (from: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!from) next.delete("from");
      else next.set("from", from);
      return next;
    });
  };

  const handleToChange = (to: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!to) next.delete("to");
      else next.set("to", to);
      return next;
    });
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
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

  const totalTabCount = useMemo(() => {
    if (!counts) return orders.length;
    switch (currentTab) {
      case "waiting":
        return (counts.PENDING ?? 0) + (counts.PAYMENT_PROCESSING ?? 0);
      case "confirmed":
        return counts.CONFIRMED ?? 0;
      case "shipping":
        return counts.SHIPPING ?? 0;
      case "delivered":
        return counts.DELIVERED ?? 0;
      case "closed":
        return (counts.CANCELLED ?? 0) + (counts.EXPIRED ?? 0);
      case "all":
      default:
        return Object.values(counts).reduce((sum, n) => sum + (n ?? 0), 0);
    }
  }, [counts, currentTab, orders.length]);

  const countText = `${totalTabCount} đơn hàng`;
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
        q={qInput}
        rangeError={rangeError}
        onRangeChange={handleRangeChange}
        onFromChange={handleFromChange}
        onToChange={handleToChange}
        onDateRangeApply={handleDateRangeApply}
        onQChange={setQInput}
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
      ) : orders.length === 0 ? (
        <OrdersEmptyState />
      ) : (
        <div className="flex flex-col gap-4">
          <ul className="list-none m-0 p-0 flex flex-col gap-4">
            {orders.map((order) => (
              <li key={order.id}>
                <OrderCard order={order} onCancel={handleOpenCancelModal} />
              </li>
            ))}
          </ul>

          {/* Show More Pagination Button */}
          {hasNextPage && (
            <div className="flex justify-center mt-3">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                loading={isFetchingNextPage}
                onClick={() => fetchNextPage()}
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
