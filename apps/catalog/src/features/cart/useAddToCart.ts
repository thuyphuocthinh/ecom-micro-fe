import { useMutation } from "@tanstack/react-query";
import { session } from "@ecom/api";
import { cartService } from "@/services/cart.service.ts";
import { addGuestCartItem, type GuestCartItem } from "./guest-cart.ts";

export interface AddToCartItemInput {
  skuId: string;
  quantity?: number;
  productId?: string;
  productName?: string;
  thumbnail?: string | null;
  attributes?: Record<string, string> | null;
  price?: number;
  available?: number;
}

export function useAddToCart() {
  return useMutation({
    mutationFn: async (input: AddToCartItemInput) => {
      const quantity = input.quantity ?? 1;
      const isLoggedIn =
        typeof window !== "undefined" &&
        Boolean(session.getAccessToken() || session.getRefreshToken());

      if (isLoggedIn) {
        await cartService.addItem(input.skuId, quantity);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("cart:changed"));
        }
      } else {
        const guestItem: GuestCartItem = {
          skuId: input.skuId,
          productId: input.productId,
          productName: input.productName ?? "Sản phẩm",
          thumbnail: input.thumbnail,
          attributes: input.attributes ?? null,
          price: input.price ?? 0,
          addedPrice: input.price ?? 0,
          available: input.available ?? 99,
          quantity,
        };
        addGuestCartItem(guestItem);
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("cart:add", {
            detail: {
              productId: input.productId,
              skuId: input.skuId,
              quantity,
            },
          }),
        );
      }

      return { skuId: input.skuId, quantity };
    },
    onSuccess: () => {
      // TanStack Query cache invalidation hook point if needed
    },
  });
}
