import { api } from "@ecom/api";
import type { VoucherListItem, VoucherPreview } from "@/types";

// Both calls are `silent`: the cart page shows the sentence itself, next to the voucher box, so the
// error must not also pop up as a toast.
export const voucherService = {
  /** The vouchers that are running, each marked usable or not for the cart as it is now. */
  async getVouchers(): Promise<VoucherListItem[]> {
    const res = await api.get("/vouchers", { silent: true });
    return (res.data ?? []) as unknown as VoucherListItem[];
  },

  /** What a voucher would take off the cart right now. Takes no use of the voucher. */
  async previewVoucher(code: string): Promise<VoucherPreview> {
    const res = await api.post("/vouchers/preview", {
      body: { code },
      silent: true,
    } as unknown as never);
    return res.data as VoucherPreview;
  },
};
