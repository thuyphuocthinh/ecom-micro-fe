import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import {
  SELECTED_VOUCHER_KEY,
  clearVoucher,
  getSelectedVoucher,
  rejectVoucher,
  resetSelectedVoucherForTests,
  selectVoucher,
  useSelectedVoucher,
} from "./useSelectedVoucher.ts";

describe("useSelectedVoucher", () => {
  beforeEach(() => {
    sessionStorage.clear();
    resetSelectedVoucherForTests();
  });

  it("starts with no code and no refusal", () => {
    const { result } = renderHook(() => useSelectedVoucher());

    expect(result.current.code).toBeNull();
    expect(result.current.refusal).toBeNull();
  });

  it("keeps the code as text in sessionStorage, trimmed, and nothing else", () => {
    const { result } = renderHook(() => useSelectedVoucher());

    act(() => result.current.select("  GIAM50K "));

    expect(result.current.code).toBe("GIAM50K");
    expect(sessionStorage.getItem(SELECTED_VOUCHER_KEY)).toBe("GIAM50K");
    expect(JSON.stringify({ ...sessionStorage })).not.toContain("50000");
  });

  it("one code at most: choosing another replaces the old one", () => {
    const { result } = renderHook(() => useSelectedVoucher());

    act(() => result.current.select("GIAM50K"));
    act(() => result.current.select("SALE10"));

    expect(result.current.code).toBe("SALE10");
    expect(sessionStorage.getItem(SELECTED_VOUCHER_KEY)).toBe("SALE10");
  });

  it("choosing an empty text drops the code", () => {
    const { result } = renderHook(() => useSelectedVoucher());
    act(() => result.current.select("GIAM50K"));

    act(() => result.current.select("   "));

    expect(result.current.code).toBeNull();
    expect(sessionStorage.getItem(SELECTED_VOUCHER_KEY)).toBeNull();
  });

  it("clearing drops the code and the refusal", () => {
    const { result } = renderHook(() => useSelectedVoucher());
    act(() => result.current.select("GIAM50K"));
    act(() => result.current.reject({ code: "GIAM50K", message: "Hết lượt" }));

    act(() => result.current.clear());

    expect(result.current.code).toBeNull();
    expect(result.current.refusal).toBeNull();
  });

  it("a refusal drops the code, keeps the sentence for the screen, and is not stored", () => {
    const { result } = renderHook(() => useSelectedVoucher());
    act(() => result.current.select("GIAM50K"));

    act(() =>
      result.current.reject({
        code: "GIAM50K",
        message: "Mã giảm giá này đã hết lượt dùng.",
      }),
    );

    expect(result.current.code).toBeNull();
    expect(result.current.refusal).toEqual({
      code: "GIAM50K",
      message: "Mã giảm giá này đã hết lượt dùng.",
    });
    expect(sessionStorage.getItem(SELECTED_VOUCHER_KEY)).toBeNull();
  });

  it("choosing a code after a refusal forgets the refusal", () => {
    const { result } = renderHook(() => useSelectedVoucher());
    act(() => result.current.reject({ code: "OLD", message: "Hết lượt" }));

    act(() => result.current.select("SALE10"));

    expect(result.current.refusal).toBeNull();
    expect(result.current.code).toBe("SALE10");
  });

  it("two places that use it see the same code at once (the cart page and the checkout page)", () => {
    const cart = renderHook(() => useSelectedVoucher());
    const checkout = renderHook(() => useSelectedVoucher());

    act(() => cart.result.current.select("GIAM50K"));
    expect(checkout.result.current.code).toBe("GIAM50K");

    act(() => checkout.result.current.clear());
    expect(cart.result.current.code).toBeNull();
  });

  it("can be changed outside React too, and reads the same", () => {
    const { result } = renderHook(() => useSelectedVoucher());

    act(() => selectVoucher("SALE10"));
    expect(getSelectedVoucher()).toBe("SALE10");
    expect(result.current.code).toBe("SALE10");

    act(() => rejectVoucher({ code: "SALE10", message: "x" }));
    expect(getSelectedVoucher()).toBeNull();

    act(() => clearVoucher());
    expect(result.current.refusal).toBeNull();
  });

  it("still works when the browser blocks sessionStorage: the code lives in memory", () => {
    const blocked = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("blocked");
      });
    const { result } = renderHook(() => useSelectedVoucher());

    act(() => result.current.select("GIAM50K"));

    expect(result.current.code).toBe("GIAM50K");
    blocked.mockRestore();
  });
});
