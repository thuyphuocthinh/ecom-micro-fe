import type { ProductFilterParams } from "@/types";

export const queryKeys = {
  products: {
    all: ["products"] as const,
    list: (filters: ProductFilterParams) =>
      ["products", "list", filters] as const,
    detail: (id: string | undefined) => ["products", "detail", id] as const,
    facets: (filters: ProductFilterParams) =>
      ["products", "facets", filters] as const,
  },
  categories: {
    all: ["categories"] as const,
    list: (parentId?: string) => ["categories", "list", parentId] as const,
    detail: (id: string | undefined) => ["categories", "detail", id] as const,
  },
};
