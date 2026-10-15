import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service.ts";
import { queryKeys } from "@/constants/queryKeys.ts";
import type { Product } from "@/types";

export function useRelatedProductsQuery(
  categoryId: string | undefined,
  currentProductId: string | undefined,
  limit = 4,
) {
  return useQuery<Product[], Error>({
    queryKey: queryKeys.products.related(categoryId, currentProductId),
    queryFn: async () => {
      if (!categoryId) return [];
      const res = await productService.getProducts({
        categoryId,
        limit: limit + 2, // Request extra in case currentProductId is in the result
      });
      const list = res.data ?? [];
      return list.filter((p) => p.id !== currentProductId).slice(0, limit);
    },
    enabled: Boolean(categoryId),
    staleTime: 60_000,
  });
}
