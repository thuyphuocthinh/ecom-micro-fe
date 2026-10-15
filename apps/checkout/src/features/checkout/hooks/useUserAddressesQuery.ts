import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys.ts";
import { checkoutService } from "@/services";
import type { CreateAddressPayload } from "@/types";

export function useUserAddressesQuery() {
  return useQuery({
    queryKey: queryKeys.checkout.addresses(),
    queryFn: () => checkoutService.getAddresses(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAddressPayload) =>
      checkoutService.createAddress(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.checkout.addresses(),
      });
    },
  });
}
