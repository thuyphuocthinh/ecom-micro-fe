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
    // No polling here: every outcome of a payment changes the order, and that makes the page read this again
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
    onSuccess: (payment, { orderId }) => {
      // Show the payment (and its QR code) at once, newest first as the list is: waiting for the read
      // below would leave the customer looking at "making the code" for one more round trip
      queryClient.setQueryData<PaymentResponse[]>(
        queryKeys.checkout.payments(orderId),
        (current = []) => [
          payment,
          ...current.filter((other) => other.id !== payment.id),
        ],
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.checkout.payments(orderId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.checkout.order(orderId),
      });
    },
  });
}
