import { useQuery } from "@tanstack/react-query";
import { addressService } from "@/services/address.service.ts";
import { queryKeys } from "@/constants/queryKeys.ts";
import type { Address } from "@/types";

export function useAddressesQuery(options?: { enabled?: boolean }) {
  return useQuery<Address[]>({
    queryKey: queryKeys.user.addresses(),
    queryFn: async () => {
      const result = await addressService.getAddresses();
      return result.data ?? [];
    },
    enabled: options?.enabled,
  });
}
