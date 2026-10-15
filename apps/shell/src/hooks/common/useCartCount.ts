import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getGuestCartCount } from "@/utils/cart.ts";
import { queryKeys } from "@/constants/queryKeys.ts";
import { cartService } from "@/services/cart.service.ts";
import type { CartSummary } from "@/types";

export function useCartCount(enabled = true) {
  const queryClient = useQueryClient();
  const [guestCount, setGuestCount] = useState(() =>
    typeof window !== "undefined" ? getGuestCartCount() : 0,
  );

  const query = useQuery({
    queryKey: queryKeys.cart.summary(),
    queryFn: async () => {
      const res = await cartService.getCart();
      return (res.data || {}) as CartSummary;
    },
    enabled,
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    const handleCartChanged = () => {
      if (enabled) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      } else {
        setGuestCount(getGuestCartCount());
      }
    };
    window.addEventListener("cart:changed", handleCartChanged);
    return () => window.removeEventListener("cart:changed", handleCartChanged);
  }, [enabled, queryClient]);

  const cartCount = enabled ? (query.data?.lineCount ?? 0) : guestCount;

  return {
    cartCount,
    ...query,
  };
}
