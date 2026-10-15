import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cartService } from "@/services/cart.service.ts";
import { queryKeys } from "@/constants/queryKeys.ts";
import {
  isGuestSession,
  addGuestCartItem,
} from "@/features/cart/utils/guest-cart.ts";
import type { GuestCartItem } from "@/types";

export interface AddToCartArgs {
  skuId: string;
  quantity: number;
  item?: GuestCartItem;
}

export function useAddToCartMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ skuId, quantity, item }: AddToCartArgs) => {
      if (isGuestSession()) {
        if (item) {
          addGuestCartItem({ ...item, quantity });
        } else {
          addGuestCartItem({
            skuId,
            productName: "Sản phẩm",
            price: 0,
            addedPrice: 0,
            quantity,
          });
        }
        return { skuId, quantity };
      }
      return cartService.addItem(skuId, quantity);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cart:changed"));
      }
    },
  });
}
