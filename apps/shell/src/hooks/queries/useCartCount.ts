import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../constants/queryKeys.ts";
import { cartService, type CartSummary } from "../../services/cart.service.ts";

export function useCartCount(enabled = true) {
  const queryClient = useQueryClient();

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
      }
    };
    window.addEventListener("cart:changed", handleCartChanged);
    return () => window.removeEventListener("cart:changed", handleCartChanged);
  }, [enabled, queryClient]);

  const cartCount = enabled ? (query.data?.lineCount ?? 0) : 0;

  return {
    cartCount,
    ...query,
  };
}
