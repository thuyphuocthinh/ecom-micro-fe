import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys.ts";
import {
  catalogService,
  type ApiProduct,
  type ApiCategory,
} from "@/services/catalog.service.ts";
import {
  HOME_CATEGORY_DECORATIONS,
  PRODUCT_DECORATIONS,
} from "@/features/home/data/home-data.ts";
import type { HomeProduct, HomeCategory } from "@/features/home/types/home.ts";
import { useRootCategoriesQuery } from "@/hooks/common/useRootCategoriesQuery.ts";

/**
 * A product of the API as a card of the home page. Everything shown (name, price, the crossed-out price)
 * is the API's. Only the look of the picture (a colour and a drawing, by position) is the design's.
 */
export function mapApiProductToHomeProduct(
  product: ApiProduct,
  index: number,
): HomeProduct {
  const decoration = PRODUCT_DECORATIONS[index % PRODUCT_DECORATIONS.length];
  const primarySku = product.skus?.[0];
  const price = product.minPrice ?? primarySku?.price ?? 0;
  // The price before the discount is `compareAtPrice` in the API; it is only shown for a product on sale
  const oldPrice = product.onSale ? (primarySku?.compareAtPrice ?? null) : null;

  return {
    id: product.id,
    skuId: primarySku?.id ?? `sku-${product.id}`,
    name: product.name,
    thumbnail: product.thumbnail ?? null,
    price,
    oldPrice,
    ...decoration,
  };
}

/** A category of the API as a tile of the home page: its id, name and description, with the design's colours. */
export function mapApiCategoryToHomeCategory(
  category: ApiCategory,
  index: number,
): HomeCategory {
  const decoration =
    HOME_CATEGORY_DECORATIONS[index % HOME_CATEGORY_DECORATIONS.length];
  return {
    id: category.id,
    name: category.name,
    description: category.description ?? undefined,
    ...decoration,
  };
}

const BESTSELLERS_COUNT = 8;

export function useHomeBestsellersQuery() {
  const query = useQuery({
    queryKey: queryKeys.catalog.bestsellers(BESTSELLERS_COUNT),
    queryFn: () => catalogService.getBestsellers(BESTSELLERS_COUNT),
    staleTime: 1000 * 60 * 5,
  });

  // Nothing is made up when the API has nothing or fails: the section shows an empty or an error state
  const products = useMemo(
    () => (query.data ?? []).map(mapApiProductToHomeProduct),
    [query.data],
  );

  return { ...query, products };
}

export function useHomeCategoriesQuery() {
  const query = useRootCategoriesQuery();

  const categories = useMemo(
    () => (query.data ?? []).map(mapApiCategoryToHomeCategory),
    [query.data],
  );

  return { ...query, categories };
}
