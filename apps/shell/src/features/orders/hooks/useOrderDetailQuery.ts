import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys.ts";
import { orderService } from "@/services/order.service.ts";
import type { OrderDetail } from "@/types";

export function useOrderDetailQuery(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id ?? ""),
    queryFn: async () => {
      if (!id) throw new Error("Order ID is required");
      const res = await orderService.getOrder(id);
      return ((res as { data?: OrderDetail })?.data ?? res) as OrderDetail;
    },
    enabled: Boolean(id),
    staleTime: 1000 * 30,
  });
}
