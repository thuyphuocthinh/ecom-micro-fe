import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cartService } from "@/services/cart.service.ts";
import { queryKeys } from "@/constants/queryKeys.ts";
import {
  isGuestSession,
  removeGuestCartItem,
} from "@/features/cart/utils/guest-cart.ts";

export interface RemoveCartItemArgs {
  skuId: string;
}

export function useRemoveCartItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ skuId }: RemoveCartItemArgs) => {
      if (isGuestSession()) {
        const result = removeGuestCartItem(skuId);
        return result;
      }
      return cartService.removeItem(skuId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cart:changed"));
      }
    },
  });
}
