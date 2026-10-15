import { api } from "@ecom/api";

export interface ApiProduct {
  id: string;
  categoryId?: string;
  name: string;
  description?: string | null;
  thumbnail?: string | null;
  minPrice: number | null;
  onSale: boolean;
  discountPercent?: number;
  rating?: number;
  reviewsCount?: number;
  skus?: Array<{
    id: string;
    price: number;
    originalPrice?: number | null;
  }>;
}

export interface ApiCategory {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
}

export const catalogService = {
  async getBestsellers(limit = 8): Promise<ApiProduct[]> {
    const res = await api.get<ApiProduct[]>("/catalog/products", {
      query: { limit, sort: "newest" },
    });
    if (Array.isArray(res)) return res;
    if (
      res &&
      typeof res === "object" &&
      "data" in res &&
      Array.isArray((res as { data: ApiProduct[] }).data)
    ) {
      return (res as { data: ApiProduct[] }).data;
    }
    return [];
  },

  async getCategories(): Promise<ApiCategory[]> {
    const res = await api.get<ApiCategory[]>("/catalog/categories");
    if (Array.isArray(res)) return res;
    if (
      res &&
      typeof res === "object" &&
      "data" in res &&
      Array.isArray((res as { data: ApiCategory[] }).data)
    ) {
      return (res as { data: ApiCategory[] }).data;
    }
    return [];
  },
};
