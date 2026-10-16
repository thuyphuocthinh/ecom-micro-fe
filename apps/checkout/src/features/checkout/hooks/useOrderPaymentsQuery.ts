import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys.ts";
import { checkoutService } from "@/services";
import type { PaymentResponse } from "@/types";
import { paymentIdempotencyKey } from "../utils/payment.ts";

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

  return useMutation<
    PaymentResponse,
    Error,
    { orderId: string; attempt: number }
  >({
    // The key is fixed for an order and an attempt: asked twice, the backend gives the same payment back.
    mutationFn: ({ orderId, attempt }) =>
      checkoutService.startPayment(
        orderId,
        paymentIdempotencyKey(orderId, attempt),
      ),
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
