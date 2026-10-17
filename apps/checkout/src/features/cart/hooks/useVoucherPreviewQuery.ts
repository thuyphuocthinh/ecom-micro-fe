import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@ecom/api";
import { queryKeys } from "@/constants/queryKeys.ts";
import { voucherService } from "@/services/voucher.service.ts";
import type { VoucherPreview } from "@/types";
import { rejectVoucher, useSelectedVoucher } from "./useSelectedVoucher.ts";

// The answers that say "this code, for this cart, is no good": the code is dropped. Anything else
// (no network, a server fault, too many calls, the vouchers being out for a moment) is not the
// code's fault, so the code is kept and the customer can try again.
const REFUSAL_CODES = new Set([
  "VOU-000",
  "VOU-001",
  "VOU-002",
  "VOU-003",
  "VOU-004",
  "VOU-005",
  "VOU-006",
  "ORD-003",
]);

export function isVoucherRefusal(error: unknown): error is ApiError {
  return error instanceof ApiError && REFUSAL_CODES.has(error.code);
}

/**
 * What the chosen voucher takes off the cart, from the server (the page never works the discount
 * out itself). It sits under the cart's query root, so a change of the cart asks again. When the
 * server refuses the code the code is dropped and the sentence is kept in `errorMessage`; for a
 * temporary failure the code stays and `errorMessage` says to try again.
 */
export function useVoucherPreviewQuery(enabled: boolean) {
  const { code, refusal } = useSelectedVoucher();

  const query = useQuery<VoucherPreview>({
    queryKey: queryKeys.cart.voucherPreview(code ?? ""),
    queryFn: () => voucherService.previewVoucher(code as string),
    enabled: enabled && code !== null,
    // A refusal is an answer, not a fault, and a second try would get the same one
    retry: false,
    staleTime: 5_000,
  });

  const refused = isVoucherRefusal(query.error) ? query.error : null;
  useEffect(() => {
    if (refused && code !== null) {
      rejectVoucher({ code, message: refused.userMessage });
    }
  }, [refused, code]);

  const temporaryError =
    query.error && !refused && query.error instanceof ApiError
      ? query.error.userMessage
      : null;

  return {
    code,
    preview: code !== null ? query.data : undefined,
    isLoading: code !== null && query.isLoading,
    isFetching: code !== null && query.isFetching,
    /** The sentence to show under the box: why the code was dropped, or why it could not be checked. */
    errorMessage: refusal?.message ?? temporaryError,
    /** The code the server refused last, so a page can say which one. */
    refusedCode: refusal?.code ?? null,
  };
}
