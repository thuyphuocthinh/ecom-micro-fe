import type { ReactNode } from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ApiError } from "@ecom/api";
import { createQueryClient } from "@/libs/queryClient.ts";
import { voucherService } from "@/services/voucher.service.ts";
import type { VoucherPreview } from "@/types";
import {
  resetSelectedVoucherForTests,
  selectVoucher,
  getSelectedVoucher,
} from "./useSelectedVoucher.ts";
import { useVoucherPreviewQuery } from "./useVoucherPreviewQuery.ts";

vi.mock("@/services/voucher.service.ts", () => ({
  voucherService: { getVouchers: vi.fn(), previewVoucher: vi.fn() },
}));

const PREVIEW: VoucherPreview = {
  code: "GIAM50K",
  name: "Giảm 50 nghìn",
  discountType: "FIXED_AMOUNT",
  discountAmount: 50000,
  subtotal: 320000,
  total: 270000,
};

const failure = (status: number, code: string, errors?: unknown) =>
  new ApiError({ status, code, message: code, errors });

function setup(enabled = true) {
  const queryClient = createQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return {
    queryClient,
    ...renderHook(() => useVoucherPreviewQuery(enabled), { wrapper }),
  };
}

describe("useVoucherPreviewQuery", () => {
  beforeEach(() => {
    sessionStorage.clear();
    resetSelectedVoucherForTests();
    vi.clearAllMocks();
  });

  it("asks nothing while there is no code", () => {
    const { result } = setup();

    expect(voucherService.previewVoucher).not.toHaveBeenCalled();
    expect(result.current.preview).toBeUndefined();
    expect(result.current.errorMessage).toBeNull();
  });

  it("asks the server for the chosen code and gives back what it says (the page works out nothing)", async () => {
    vi.mocked(voucherService.previewVoucher).mockResolvedValue(PREVIEW);
    selectVoucher("giam50k");

    const { result } = setup();

    await waitFor(() => expect(result.current.preview).toEqual(PREVIEW));
    expect(voucherService.previewVoucher).toHaveBeenCalledWith("giam50k");
    expect(result.current.errorMessage).toBeNull();
  });

  it("does not ask when it is switched off (a guest, an empty cart)", () => {
    selectVoucher("GIAM50K");

    const { result } = setup(false);

    expect(voucherService.previewVoucher).not.toHaveBeenCalled();
    expect(result.current.preview).toBeUndefined();
  });

  it("asks again for another code, and does not show the old code's amount meanwhile", async () => {
    vi.mocked(voucherService.previewVoucher).mockImplementation(async (code) =>
      code === "GIAM50K"
        ? PREVIEW
        : new Promise<VoucherPreview>(() => undefined),
    );
    selectVoucher("GIAM50K");
    const { result } = setup();
    await waitFor(() => expect(result.current.preview).toEqual(PREVIEW));

    act(() => selectVoucher("SALE10"));

    expect(result.current.code).toBe("SALE10");
    expect(result.current.preview).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
  });

  it.each([
    ["VOU-001", 404],
    ["VOU-002", 409],
    ["VOU-003", 409],
    ["VOU-004", 409],
    ["VOU-005", 409],
    ["ORD-003", 409],
  ])(
    "%s: the server refuses the code, so the code is dropped and the sentence is kept",
    async (code, status) => {
      vi.mocked(voucherService.previewVoucher).mockRejectedValue(
        failure(status, code),
      );
      selectVoucher("GIAM50K");

      const { result } = setup();

      await waitFor(() => expect(getSelectedVoucher()).toBeNull());
      expect(result.current.code).toBeNull();
      expect(result.current.refusedCode).toBe("GIAM50K");
      expect(result.current.errorMessage).toBeTruthy();
      expect(result.current.errorMessage).not.toMatch(/VOU|ORD-/);
      expect(sessionStorage.getItem("ecom.checkout.voucherCode")).toBeNull();
    },
  );

  it("says how much the order needs when the minimum is the reason", async () => {
    vi.mocked(voucherService.previewVoucher).mockRejectedValue(
      failure(409, "VOU-003", {
        reason: "BELOW_MINIMUM",
        minOrderValue: 200000,
      }),
    );
    selectVoucher("GIAM50K");

    const { result } = setup();

    await waitFor(() =>
      expect(result.current.errorMessage).toBe(
        "Đơn hàng cần từ 200.000 ₫ để dùng mã này.",
      ),
    );
  });

  it.each([
    ["the vouchers being out for a moment", failure(503, "VOU-007")],
    ["no network", failure(0, "NETWORK")],
    ["a server fault", failure(500, "SYS-001")],
    ["too many calls", failure(429, "AUTH-006")],
  ])(
    "%s: the code is KEPT and the sentence says to try again",
    async (_name, error) => {
      vi.mocked(voucherService.previewVoucher).mockRejectedValue(error);
      selectVoucher("GIAM50K");

      const { result } = setup();

      await waitFor(() => expect(result.current.errorMessage).toBeTruthy());
      expect(getSelectedVoucher()).toBe("GIAM50K");
      expect(result.current.code).toBe("GIAM50K");
      expect(result.current.preview).toBeUndefined();
    },
  );

  it("does not drop the code for an error that is not one of the API's", async () => {
    vi.mocked(voucherService.previewVoucher).mockRejectedValue(
      new Error("boom"),
    );
    selectVoucher("GIAM50K");

    setup();

    await waitFor(() =>
      expect(voucherService.previewVoucher).toHaveBeenCalledTimes(1),
    );
    expect(getSelectedVoucher()).toBe("GIAM50K");
  });

  it("asks again when the cart changes (the query sits under the cart root)", async () => {
    vi.mocked(voucherService.previewVoucher).mockResolvedValue(PREVIEW);
    selectVoucher("GIAM50K");
    const { result, queryClient } = setup();
    await waitFor(() => expect(result.current.preview).toEqual(PREVIEW));

    vi.mocked(voucherService.previewVoucher).mockResolvedValue({
      ...PREVIEW,
      subtotal: 640000,
      total: 590000,
    });
    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
    });

    await waitFor(() => expect(result.current.preview?.total).toBe(590000));
    expect(voucherService.previewVoucher).toHaveBeenCalledTimes(2);
  });
});
