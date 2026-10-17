import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys.ts";
import { voucherService } from "@/services/voucher.service.ts";
import type { VoucherListItem } from "@/types";

/**
 * The vouchers that are running, each marked usable or not for the cart as it is now. It sits under
 * the cart's query root, so any change of the cart refreshes it. `enabled` is false for a guest and
 * for an empty cart: nothing is asked then. A failure is not retried: the list just says it could not
 * load and the customer can still type a code.
 */
export function useVouchersQuery(enabled: boolean) {
  return useQuery<VoucherListItem[]>({
    queryKey: queryKeys.cart.vouchers(),
    queryFn: () => voucherService.getVouchers(),
    enabled,
    retry: false,
    // The uses left change all the time, so do not trust the list for long
    staleTime: 5_000,
  });
}
