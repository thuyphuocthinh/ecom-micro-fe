import { describe, it, expect } from "vitest";
import {
  getOrderStatusMeta,
  calculateDateRange,
  mapTabToStatusParam,
  isOrderCancellable,
  isOrderRebuyable,
  isOrderPayable,
} from "./order-status.ts";
import {
  formatOrderCode,
  formatVnd,
  calculateMinutesLeft,
} from "./order-format.ts";

describe("order-status utils", () => {
  it("should return correct status metadata for each status", () => {
    expect(getOrderStatusMeta("CONFIRMED")).toMatchObject({
      label: "Đã xác nhận",
      tone: "brand",
    });
    expect(getOrderStatusMeta("PAYMENT_PROCESSING")).toMatchObject({
      label: "Chờ thanh toán",
      tone: "warn",
    });
    expect(getOrderStatusMeta("SHIPPING")).toMatchObject({
      label: "Đang giao",
      tone: "brand",
    });
    expect(getOrderStatusMeta("DELIVERED")).toMatchObject({
      label: "Đã giao",
      tone: "ok",
    });
    expect(getOrderStatusMeta("CANCELLED")).toMatchObject({
      label: "Đã huỷ",
      tone: "default",
    });
    expect(getOrderStatusMeta("EXPIRED")).toMatchObject({
      label: "Hết hạn thanh toán",
      tone: "default",
    });
  });

  it("should correctly calculate date ranges", () => {
    const r30d = calculateDateRange("30d");
    expect(r30d.createdFrom).toBeDefined();

    const r3m = calculateDateRange("3m");
    expect(r3m.createdFrom).toBeDefined();

    const rYear = calculateDateRange("year");
    expect(rYear.createdFrom).toBeDefined();

    const rCustom = calculateDateRange("custom", "2026-10-01", "2026-10-10");
    expect(rCustom.createdFrom).toBeDefined();
    expect(rCustom.createdTo).toBeDefined();

    const rAll = calculateDateRange("all");
    expect(rAll.createdFrom).toBeUndefined();
    expect(rAll.createdTo).toBeUndefined();
  });

  it("should map tabs to order status parameters", () => {
    expect(mapTabToStatusParam("all")).toBeUndefined();
    expect(mapTabToStatusParam("waiting")).toBe("PENDING,PAYMENT_PROCESSING");
    expect(mapTabToStatusParam("confirmed")).toBe("CONFIRMED");
    expect(mapTabToStatusParam("shipping")).toBe("SHIPPING");
    expect(mapTabToStatusParam("delivered")).toBe("DELIVERED");
    expect(mapTabToStatusParam("closed")).toBe("CANCELLED,EXPIRED");
  });

  it("should identify cancellable orders correctly", () => {
    expect(isOrderCancellable("PENDING")).toBe(true);
    expect(isOrderCancellable("CONFIRMED")).toBe(true);
    expect(isOrderCancellable("SHIPPING")).toBe(false);
    expect(isOrderCancellable("DELIVERED")).toBe(false);
    expect(isOrderCancellable("CANCELLED")).toBe(false);
  });

  it("should identify rebuyable orders correctly", () => {
    expect(isOrderRebuyable("DELIVERED")).toBe(true);
    expect(isOrderRebuyable("CANCELLED")).toBe(true);
    expect(isOrderRebuyable("EXPIRED")).toBe(true);
    expect(isOrderRebuyable("PENDING")).toBe(false);
    expect(isOrderRebuyable("CONFIRMED")).toBe(false);
  });

  it("should identify payable orders correctly", () => {
    expect(isOrderPayable("PAYMENT_PROCESSING")).toBe(true);
    expect(isOrderPayable("PENDING")).toBe(true);
    expect(isOrderPayable("CONFIRMED")).toBe(false);
  });
});

describe("order-format utils", () => {
  it("should format order code to 8 uppercase chars", () => {
    expect(formatOrderCode("3fa85f64-1234-abcd-ef01-23456789abcd")).toBe(
      "3FA85F64",
    );
    expect(formatOrderCode("b27c91d0")).toBe("B27C91D0");
  });

  it("should format VND currency", () => {
    const formatted = formatVnd(1000000);
    expect(formatted).toContain("1.000.000");
    expect(formatted).toContain("₫");
  });

  it("should calculate minutes left until expiry", () => {
    const future = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    expect(calculateMinutesLeft(future)).toBe(15);

    const past = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(calculateMinutesLeft(past)).toBe(0);

    expect(calculateMinutesLeft(null)).toBeNull();
  });
});
