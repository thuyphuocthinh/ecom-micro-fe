import { createApiClient } from "@ecom/api";

const API_BASE_URL =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000/api/v1";

const serverSession = {
  getAccessToken: () => null,
  getRefreshToken: () => null,
  set: () => {},
  clear: () => {},
  onExpired: () => () => {},
  notifyExpired: () => {},
};

export const serverApi = createApiClient({
  baseUrl: API_BASE_URL,
  session: serverSession,
});

export interface ProductDetail {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  thumbnail?: string | null;
  categoryId: string;
  minPrice: number;
  inStock: boolean;
  skus: Array<{
    id: string;
    skuCode: string;
    price: number;
    compareAtPrice?: number | null;
    inStock: boolean;
    attributes: Record<string, string>;
  }>;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug?: string | null;
  parentId: string | null;
  path: string;
}

export interface SitemapItem {
  loc: string;
  lastmod: string;
  changefreq:
    "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
}

export async function fetchProductByIdentifier(
  identifier: string,
): Promise<ProductDetail | null> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/catalog/products/${encodeURIComponent(identifier)}`,
      {
        next: { revalidate: 60 },
      },
    );
    if (!res.ok) return null;
    const body = await res.json();
    return body.data ?? body;
  } catch (error) {
    console.error(`[SSR] Failed to fetch product ${identifier}:`, error);
    return null;
  }
}

export async function fetchCategoryByIdentifier(
  identifier: string,
): Promise<CategoryItem | null> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/catalog/categories/${encodeURIComponent(identifier)}`,
      {
        next: { revalidate: 300 },
      },
    );
    if (!res.ok) return null;
    const body = await res.json();
    return body.data ?? body;
  } catch (error) {
    console.error(`[SSR] Failed to fetch category ${identifier}:`, error);
    return null;
  }
}

export async function fetchCategories(
  parentId?: string,
): Promise<CategoryItem[]> {
  try {
    const url = new URL(`${API_BASE_URL}/catalog/categories`);
    if (parentId) url.searchParams.set("parentId", parentId);

    const res = await fetch(url.toString(), { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const body = await res.json();
    return body.data ?? body ?? [];
  } catch (error) {
    console.error("[SSR] Failed to fetch categories:", error);
    return [];
  }
}

export async function fetchPublishedProducts(
  params: {
    page?: number;
    limit?: number;
    categoryId?: string;
    search?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
  } = {},
): Promise<{ data: ProductDetail[]; meta?: any }> {
  try {
    const url = new URL(`${API_BASE_URL}/catalog/products`);
    if (params.page) url.searchParams.set("page", String(params.page));
    if (params.limit) url.searchParams.set("limit", String(params.limit));
    if (params.categoryId)
      url.searchParams.set("categoryId", params.categoryId);
    if (params.search) url.searchParams.set("search", params.search);
    if (params.sort) url.searchParams.set("sort", params.sort);
    if (params.minPrice)
      url.searchParams.set("minPrice", String(params.minPrice));
    if (params.maxPrice)
      url.searchParams.set("maxPrice", String(params.maxPrice));

    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (!res.ok) return { data: [] };
    const body = await res.json();
    return {
      data: body.data ?? [],
      meta: body.meta,
    };
  } catch (error) {
    console.error("[SSR] Failed to fetch products:", error);
    return { data: [] };
  }
}

export async function fetchSitemapData(): Promise<SitemapItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/catalog/sitemap-data`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const body = await res.json();
    return body.data ?? body ?? [];
  } catch (error) {
    console.error("[SSR] Failed to fetch sitemap data:", error);
    return [];
  }
}
