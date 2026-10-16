import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys.ts";
import { checkoutService } from "@/services";

export function useOrderDetailQuery(orderId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.checkout.order(orderId ?? ""),
    queryFn: () => checkoutService.getOrder(orderId!),
    enabled: Boolean(orderId),
    // No polling here: `useOrderStatusStream` tells the page when the order changes
  });
}
