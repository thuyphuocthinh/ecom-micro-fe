import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service.ts";
import { queryKeys } from "@/constants/queryKeys.ts";
import type { CategoryFacet, ProductFilterParams } from "@/types";

export function useProductFacetsQuery(
  filters: ProductFilterParams = {},
  parentId?: string,
) {
  return useQuery<CategoryFacet[], Error>({
    queryKey: queryKeys.products.facets(filters),
    queryFn: () => productService.getProductFacets(filters, parentId),
  });
}
