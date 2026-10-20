import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys.ts";
import { toCartResponse } from "@/features/cart/utils/guest-cart.ts";
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
      // The server empties the cart when it takes the order, so the cache is told so instead of asked
      // again. Invalidating the whole cart root would fetch the cart and, with it, check the voucher
      // against a cart that is already empty (a 409 for each); and a voucher is spent by the order,
      // so what was checked for it is dropped.
      void queryClient.cancelQueries({ queryKey: queryKeys.cart.all });
      queryClient.removeQueries({ queryKey: queryKeys.cart.vouchers() });
      queryClient.removeQueries({
        queryKey: [...queryKeys.cart.all, "voucher-preview"],
      });
      queryClient.setQueryData(queryKeys.cart.all, toCartResponse([]));

      // Notify host and other remotes that cart was cleared/modified
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cart:changed"));
      }

      // Pre-seed order query cache with the newly placed order
      queryClient.setQueryData(queryKeys.checkout.order(order.id), order);
    },
  });
}
