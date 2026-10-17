import { api } from "@ecom/api";
import type { Category } from "@/types";

export const categoryService = {
  async getCategories(parentId?: string): Promise<{ data: Category[] }> {
    const query: Record<string, string> = {};
    if (parentId) query.parentId = parentId;

    const res = await api.get("/catalog/categories", { query });
    return { data: (res.data ?? []) as Category[] };
  },

  async getCategoryById(id: string): Promise<{ data: Category }> {
    const res = await api.get("/catalog/categories/{identifier}", {
      params: { identifier: id },
    });
    return { data: res.data as Category };
  },
};
