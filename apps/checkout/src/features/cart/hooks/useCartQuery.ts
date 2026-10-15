import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cartService } from "@/services/cart.service.ts";
import { queryKeys } from "@/constants/queryKeys.ts";
import {
  isGuestSession,
  getGuestCartItems,
  toCartResponse,
} from "@/features/cart/utils/guest-cart.ts";
import type { CartResponse } from "@/types";

export const CART_QUERY_KEY = queryKeys.cart.all;

export function useCartQuery() {
  const queryClient = useQueryClient();
  const isGuest = isGuestSession();

  const query = useQuery<CartResponse>({
    queryKey: queryKeys.cart.all,
    queryFn: async () => {
      if (isGuestSession()) {
        const guestItems = getGuestCartItems();
        return toCartResponse(guestItems);
      }
      return cartService.getCart();
    },
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    const handleCartChanged = () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    };
    window.addEventListener("cart:changed", handleCartChanged);
    return () => window.removeEventListener("cart:changed", handleCartChanged);
  }, [queryClient]);

  return {
    ...query,
    isGuest,
  };
}
