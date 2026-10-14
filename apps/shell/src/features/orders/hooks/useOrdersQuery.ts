import { useInfiniteQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys.ts";
import { orderService } from "@/services/order.service.ts";
import type { OrderFilterParams, OrderSummary } from "@/types";
import {
  calculateDateRange,
  mapTabToStatusParam,
} from "../utils/order-status.ts";

export const DEFAULT_PAGE_LIMIT = 4;

export function useOrdersQuery(
  filters: OrderFilterParams = {},
  limit: number = DEFAULT_PAGE_LIMIT,
) {
  const { tab = "all", range = "all", from, to, q } = filters;

  const { createdFrom, createdTo, isValid } = calculateDateRange(
    range,
    from,
    to,
  );
  const status = mapTabToStatusParam(tab);
  const cleanQ = q && q.trim().length >= 6 ? q.trim() : undefined;

  return useInfiniteQuery({
    queryKey: queryKeys.orders.list({
      tab,
      range,
      from,
      to,
      q: cleanQ,
      limit,
    }),
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const res = await orderService.getOrders({
        status,
        createdFrom,
        createdTo,
        q: cleanQ,
        cursor: pageParam,
        limit,
      });
      const data = Array.isArray(res)
        ? res
        : Array.isArray((res as { data?: OrderSummary[] })?.data)
          ? (res as { data: OrderSummary[] }).data
          : [];
      const meta = Array.isArray(res) ? undefined : res?.meta;
      return {
        orders: data as OrderSummary[],
        meta,
      };
    },
    getNextPageParam: (lastPage) => {
      return lastPage.meta?.hasMore ? lastPage.meta?.nextCursor : undefined;
    },
    enabled: isValid,
    staleTime: 1000 * 60,
  });
}
