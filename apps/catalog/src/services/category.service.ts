import { api } from "@ecom/api";
import type { Category } from "@/types";

export const categoryService = {
  getCategories(parentId?: string) {
    const query: Record<string, string> = {};
    if (parentId) query.parentId = parentId;

    return api.get("/catalog/categories", { query }) as unknown as Promise<{
      data: Category[];
    }>;
  },

  getCategoryById(id: string) {
    return api.get("/catalog/categories/{id}", {
      params: { id },
    }) as unknown as Promise<{ data: Category }>;
  },
};
