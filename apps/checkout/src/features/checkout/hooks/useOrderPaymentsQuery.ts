import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createIdempotencyKey } from "@ecom/api";
import { queryKeys } from "@/constants/queryKeys.ts";
import { checkoutService } from "@/services";
import type { PaymentResponse } from "@/types";

export function useOrderPaymentsQuery(orderId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.checkout.payments(orderId ?? ""),
    queryFn: () => checkoutService.getOrderPayments(orderId!),
    enabled: Boolean(orderId),
    refetchInterval: (query) => {
      const payments = query.state.data;
      const latest = payments?.[0];
      if (latest && latest.status === "INITIATED") {
        return 3000;
      }
      return false;
    },
  });
}

export function useStartPaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation<PaymentResponse, Error, { orderId: string }>({
    mutationFn: ({ orderId }: { orderId: string }) => {
      const idempotencyKey = createIdempotencyKey();
      return checkoutService.startPayment(orderId, idempotencyKey);
    },
    onSuccess: (_payment, { orderId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.checkout.payments(orderId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.checkout.order(orderId),
      });
    },
  });
}
