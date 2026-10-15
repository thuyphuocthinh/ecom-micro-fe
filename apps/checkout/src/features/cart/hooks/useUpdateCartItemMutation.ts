import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cartService } from "@/services/cart.service.ts";
import { queryKeys } from "@/constants/queryKeys.ts";
import {
  isGuestSession,
  updateGuestCartItemQuantity,
} from "@/features/cart/utils/guest-cart.ts";

export interface UpdateCartItemArgs {
  skuId: string;
  quantity: number;
}

export function useUpdateCartItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ skuId, quantity }: UpdateCartItemArgs) => {
      if (isGuestSession()) {
        updateGuestCartItemQuantity(skuId, quantity);
        return { skuId, quantity };
      }
      return cartService.setQuantity(skuId, quantity);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cart:changed"));
      }
    },
  });
}
