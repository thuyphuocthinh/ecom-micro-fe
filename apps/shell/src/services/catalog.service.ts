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
  skus?: Array<{
    id: string;
    price: number;
    /** The price before the discount, shown crossed out. */
    compareAtPrice?: number | null;
  }>;
}

export interface ApiCategory {
  id: string;
  name: string;
  description?: string | null;
}

export const catalogService = {
  async getBestsellers(limit = 8): Promise<ApiProduct[]> {
    const res = await api.get("/catalog/products", {
      query: { limit, sort: "newest" },
    });
    const items = res?.data;
    if (Array.isArray(items)) return items as unknown as ApiProduct[];
    return [];
  },

  async getCategories(): Promise<ApiCategory[]> {
    const res = await api.get("/catalog/categories");
    const items = res?.data;
    if (Array.isArray(items)) return items as unknown as ApiCategory[];
    return [];
  },
};
