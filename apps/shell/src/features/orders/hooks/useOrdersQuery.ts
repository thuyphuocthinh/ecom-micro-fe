import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys.ts";
import { orderService } from "@/services/order.service.ts";
import type { OrderFilterParams, OrderSummary } from "@/types";
import {
  calculateDateRange,
  mapTabToStatusParam,
} from "../utils/order-status.ts";

export function useOrdersQuery(filters: OrderFilterParams = {}) {
  const {
    tab = "all",
    range = "all",
    from,
    to,
    q,
    cursor,
    limit = 20,
  } = filters;

  const { createdFrom, createdTo, isValid } = calculateDateRange(
    range,
    from,
    to,
  );
  const status = mapTabToStatusParam(tab);
  const cleanQ = q && q.trim().length >= 6 ? q.trim() : undefined;

  return useQuery({
    queryKey: queryKeys.orders.list({
      tab,
      range,
      from,
      to,
      q: cleanQ,
      cursor,
      limit,
    }),
    queryFn: async () => {
      const res = await orderService.getOrders({
        status,
        createdFrom,
        createdTo,
        q: cleanQ,
        cursor,
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
    enabled: isValid,
    staleTime: 1000 * 60,
  });
}
