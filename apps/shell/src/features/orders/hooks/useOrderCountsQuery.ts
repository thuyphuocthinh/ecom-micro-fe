import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys.ts";
import { orderService } from "@/services/order.service.ts";
import type { OrderCounts, OrderRangeKey } from "@/types";
import { calculateDateRange } from "../utils/order-status.ts";

export interface OrderCountsFilters {
  range?: OrderRangeKey;
  from?: string;
  to?: string;
  q?: string;
}

export function useOrderCountsQuery(filters: OrderCountsFilters = {}) {
  const { range = "all", from, to, q } = filters;
  const { createdFrom, createdTo, isValid } = calculateDateRange(
    range,
    from,
    to,
  );
  const cleanQ = q && q.trim().length >= 6 ? q.trim() : undefined;

  return useQuery({
    queryKey: queryKeys.orders.counts({
      range,
      from,
      to,
      q: cleanQ,
    }),
    queryFn: async () => {
      const res = await orderService.getOrderCounts({
        createdFrom,
        createdTo,
        q: cleanQ,
      });
      return ((res as { data?: OrderCounts })?.data ?? res) as OrderCounts;
    },
    enabled: isValid,
    staleTime: 1000 * 60,
  });
}
