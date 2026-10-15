import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys.ts";
import { checkoutService } from "@/services";

export function useOrderDetailQuery(orderId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.checkout.order(orderId ?? ""),
    queryFn: () => checkoutService.getOrder(orderId!),
    enabled: Boolean(orderId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Auto-poll while waiting for payment
      if (status === "PENDING" || status === "PAYMENT_PROCESSING") {
        return 3000;
      }
      return false;
    },
  });
}
