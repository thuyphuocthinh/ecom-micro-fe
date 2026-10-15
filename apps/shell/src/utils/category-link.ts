/** Where the links of the store lead. The search page reads: q, category (an id), onSale, inStock, minPrice, maxPrice, sort. */
export const ALL_PRODUCTS_HREF = "/search";
export const SALE_HREF = "/search?onSale=true";

/** The search page filtered to one category. `categoryId` is the id the API gave, never a made-up name. */
export function searchHrefForCategory(categoryId: string): string {
  return `/search?category=${encodeURIComponent(categoryId)}`;
}

/** The page of one product. */
export function productHref(productId: string): string {
  return `/products/${encodeURIComponent(productId)}`;
}
