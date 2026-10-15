import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys.ts";
import {
  catalogService,
  type ApiProduct,
  type ApiCategory,
} from "@/services/catalog.service.ts";
import {
  BEST_SELLER_PRODUCTS,
  HOME_CATEGORIES,
} from "@/features/home/data/home-data.ts";
import type {
  HomeProduct,
  HomeCategory,
  HomeCategoryKind,
} from "@/features/home/types/home.ts";

function mapApiProductToHomeProduct(p: ApiProduct, index: number): HomeProduct {
  const fallback = BEST_SELLER_PRODUCTS[index % BEST_SELLER_PRODUCTS.length];
  const primarySku = p.skus?.[0];
  const price = p.minPrice ?? primarySku?.price ?? fallback.price;
  const oldPrice = p.onSale
    ? (primarySku?.originalPrice ?? fallback.oldPrice ?? null)
    : null;

  return {
    id: p.id,
    skuId: primarySku?.id ?? `sku-${p.id}`,
    name: p.name,
    price,
    oldPrice,
    kind: fallback.kind,
    tint: fallback.tint,
    tone: fallback.tone,
    rating: p.rating ?? fallback.rating,
    reviews: p.reviewsCount ?? fallback.reviews,
  };
}

function mapApiCategoryToHomeCategory(
  c: ApiCategory,
  index: number,
): HomeCategory {
  const fallback = HOME_CATEGORIES[index % HOME_CATEGORIES.length];
  return {
    id: c.id,
    slug: c.slug || fallback.slug,
    name: c.name || fallback.name,
    description: c.description || fallback.description,
    tint: fallback.tint,
    shapeBackground: fallback.shapeBackground,
    spanRow: fallback.spanRow,
    spanCol: fallback.spanCol,
  };
}

export function useHomeBestsellersQuery() {
  const query = useQuery({
    queryKey: queryKeys.catalog.bestsellers(8),
    queryFn: () => catalogService.getBestsellers(8),
    staleTime: 1000 * 60 * 5,
  });

  const products: HomeProduct[] =
    query.data && query.data.length > 0
      ? query.data.map(mapApiProductToHomeProduct)
      : BEST_SELLER_PRODUCTS;

  return {
    ...query,
    products,
  };
}

export function useHomeCategoriesQuery() {
  const query = useQuery({
    queryKey: queryKeys.catalog.categories(),
    queryFn: () => catalogService.getCategories(),
    staleTime: 1000 * 60 * 10,
  });

  const categories: HomeCategory[] =
    query.data && query.data.length > 0
      ? query.data.map(mapApiCategoryToHomeCategory)
      : HOME_CATEGORIES;

  return {
    ...query,
    categories,
  };
}
