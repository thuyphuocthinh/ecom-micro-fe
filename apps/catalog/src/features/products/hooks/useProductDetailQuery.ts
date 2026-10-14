import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service.ts";
import { queryKeys } from "@/constants/queryKeys.ts";
import type { Product } from "@/types";

export function useProductDetailQuery(
  id: string | undefined,
  options?: { retry?: boolean | number },
) {
  return useQuery<Product, Error>({
    queryKey: queryKeys.products.detail(id),
    queryFn: async () => {
      if (!id) throw new Error("Missing product ID");
      return productService.getProductById(id);
    },
    enabled: Boolean(id),
    staleTime: 60_000,
    retry: options?.retry ?? false,
  });
}
