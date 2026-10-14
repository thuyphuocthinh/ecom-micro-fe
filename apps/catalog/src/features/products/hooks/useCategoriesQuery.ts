import { useQuery } from "@tanstack/react-query";
import { categoryService } from "@/services/category.service.ts";
import { queryKeys } from "@/constants/queryKeys.ts";
import type { Category } from "@/types";

export function useCategoriesQuery(parentId?: string) {
  return useQuery<Category[], Error>({
    queryKey: queryKeys.categories.list(parentId),
    queryFn: async () => {
      const res = await categoryService.getCategories(parentId);
      return res.data ?? [];
    },
  });
}
