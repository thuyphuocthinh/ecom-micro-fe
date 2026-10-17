import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys.ts";
import { checkoutService } from "@/services";
import type { PlaceOrderPayload, OrderResponse } from "@/types";

export interface PlaceOrderVariables {
  payload: PlaceOrderPayload;
  /**
   * One key for one attempt: the caller keeps it and sends the SAME key again when the customer tries
   * again after a temporary failure, so the order (and the stock and the voucher use held for it) is
   * made once. It makes a new key only when something the order depends on has changed.
   */
  idempotencyKey: string;
}

export function usePlaceOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation<OrderResponse, Error, PlaceOrderVariables>({
    mutationFn: ({ payload, idempotencyKey }) =>
      checkoutService.placeOrder(payload, idempotencyKey),
    onSuccess: (order) => {
      // Invalidate cart caches
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });

      // Notify host and other remotes that cart was cleared/modified
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cart:changed"));
      }

      // Pre-seed order query cache with the newly placed order
      queryClient.setQueryData(queryKeys.checkout.order(order.id), order);
    },
  });
}
