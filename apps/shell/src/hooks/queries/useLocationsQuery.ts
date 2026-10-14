import { useQuery } from "@tanstack/react-query";
import { locationService } from "@/services/location.service.ts";
import { queryKeys } from "@/constants/queryKeys.ts";
import type { Province, Ward } from "@/types";

export function useProvincesQuery() {
  return useQuery({
    queryKey: queryKeys.locations.provinces(),
    queryFn: async () => {
      const result = await locationService.getProvinces();
      return (result.data ?? []) as unknown as Province[];
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

export function useWardsQuery(provinceCode: string | undefined) {
  return useQuery({
    queryKey: provinceCode
      ? queryKeys.locations.wards(provinceCode)
      : ["locations", "wards", "empty"],
    queryFn: async () => {
      if (!provinceCode) return [];
      const result = await locationService.getWards(provinceCode);
      return (result.data ?? []) as unknown as Ward[];
    },
    enabled: Boolean(provinceCode),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
