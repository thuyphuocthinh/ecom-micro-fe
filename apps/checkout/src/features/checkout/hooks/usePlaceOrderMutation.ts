import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createIdempotencyKey } from "@ecom/api";
import { queryKeys } from "@/constants/queryKeys.ts";
import { checkoutService } from "@/services";
import type { PlaceOrderPayload, OrderResponse } from "@/types";

export function usePlaceOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation<OrderResponse, Error, PlaceOrderPayload>({
    mutationFn: (payload: PlaceOrderPayload) => {
      const idempotencyKey = createIdempotencyKey();
      return checkoutService.placeOrder(payload, idempotencyKey);
    },
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
