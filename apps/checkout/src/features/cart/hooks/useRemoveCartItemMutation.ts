import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cartService } from "@/services/cart.service.ts";
import { isGuestSession, removeGuestCartItem } from "../utils/guest-cart.ts";
import { CART_QUERY_KEY } from "./useCartQuery.ts";

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
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cart:changed"));
      }
    },
  });
}
