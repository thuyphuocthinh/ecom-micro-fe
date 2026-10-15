import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys.ts";
import { checkoutService } from "@/services";

export function useProvincesQuery() {
  return useQuery({
    queryKey: queryKeys.checkout.provinces(),
    queryFn: () => checkoutService.getProvinces(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useWardsQuery(provinceCode: string | undefined) {
  return useQuery({
    queryKey: queryKeys.checkout.wards(provinceCode ?? ""),
    queryFn: () => checkoutService.getWards(provinceCode!),
    enabled: Boolean(provinceCode),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
