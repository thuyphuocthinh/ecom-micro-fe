import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "@ecom/api";
import { checkoutService } from "./checkout.service.ts";

describe("checkoutService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches user addresses via getAddresses", async () => {
    const mockAddresses = [
      {
        id: "addr-1",
        recipientName: "Nguyễn Văn A",
        phone: "0901234567",
        provinceCode: "01",
        provinceName: "Hà Nội",
        wardCode: "001",
        wardName: "Phường Phúc Xá",
        street: "12 Đường Thử",
        label: "Nhà",
        isDefault: true,
        createdAt: "2026-10-15T00:00:00Z",
        updatedAt: "2026-10-15T00:00:00Z",
      },
    ];

    vi.spyOn(api, "get").mockResolvedValueOnce({
      data: mockAddresses,
    } as unknown as never);

    const result = await checkoutService.getAddresses();
    expect(api.get).toHaveBeenCalledWith("/users/me/addresses");
    expect(result).toEqual(mockAddresses);
  });

  it("creates new address via createAddress", async () => {
    const payload = {
      recipientName: "Nguyễn Văn B",
      phone: "0909999999",
      wardCode: "002",
      street: "88 Đường Mẫu",
      label: "Công ty",
      isDefault: false,
    };
    const created = { id: "addr-2", ...payload };

    vi.spyOn(api, "post").mockResolvedValueOnce({
      data: created,
    } as unknown as never);

    const result = await checkoutService.createAddress(payload);
    expect(api.post).toHaveBeenCalledWith("/users/me/addresses", {
      body: payload,
    });
    expect(result).toEqual(created);
  });

  it("fetches provinces via getProvinces", async () => {
    const mockProvinces = [
      {
        code: "01",
        name: "Hà Nội",
        fullName: "Thành phố Hà Nội",
        type: "CITY",
      },
    ];
    vi.spyOn(api, "get").mockResolvedValueOnce({
      data: mockProvinces,
    } as unknown as never);

    const result = await checkoutService.getProvinces();
    expect(api.get).toHaveBeenCalledWith("/locations/provinces");
    expect(result).toEqual(mockProvinces);
  });

  it("fetches wards via getWards", async () => {
    const mockWards = [
      {
        code: "001",
        name: "Phúc Xá",
        fullName: "Phường Phúc Xá",
        type: "WARD",
      },
    ];
    vi.spyOn(api, "get").mockResolvedValueOnce({
      data: mockWards,
    } as unknown as never);

    const result = await checkoutService.getWards("01");
    expect(api.get).toHaveBeenCalledWith("/locations/provinces/{code}/wards", {
      params: { code: "01" },
    });
    expect(result).toEqual(mockWards);
  });

  it("places order with idempotencyKey via placeOrder", async () => {
    const payload = {
      addressId: "addr-1",
      paymentMethod: "COD" as const,
    };
    const mockOrder = {
      id: "ord-123",
      status: "CONFIRMED",
      paymentMethod: "COD",
      total: 500000,
    };

    vi.spyOn(api, "post").mockResolvedValueOnce({
      data: mockOrder,
    } as unknown as never);

    const result = await checkoutService.placeOrder(payload, "key-123");
    expect(api.post).toHaveBeenCalledWith("/orders", {
      body: payload,
      idempotencyKey: "key-123",
    });
    expect(result).toEqual(mockOrder);
  });

  it("gets order details via getOrder", async () => {
    const mockOrder = { id: "ord-123", total: 500000 };
    vi.spyOn(api, "get").mockResolvedValueOnce({
      data: mockOrder,
    } as unknown as never);

    const result = await checkoutService.getOrder("ord-123");
    expect(api.get).toHaveBeenCalledWith("/orders/{id}", {
      params: { id: "ord-123" },
    });
    expect(result).toEqual(mockOrder);
  });

  it("gets order payments via getOrderPayments", async () => {
    const mockPayments = [
      {
        id: "pay-1",
        status: "INITIATED",
        amount: 500000,
        qrCode: "00020101021238570010A000000727",
        payUrl: "https://pay.payos.vn/web/abc123",
      },
    ];
    vi.spyOn(api, "get").mockResolvedValueOnce({
      data: mockPayments,
    } as unknown as never);

    const result = await checkoutService.getOrderPayments("ord-123");
    expect(api.get).toHaveBeenCalledWith("/orders/{orderId}/payments", {
      params: { orderId: "ord-123" },
    });
    expect(result).toEqual(mockPayments);
  });

  it("starts payment via startPayment", async () => {
    const mockPayment = {
      id: "pay-1",
      orderId: "ord-123",
      status: "INITIATED",
      qrCode: "00020101021238570010A000000727",
      payUrl: "https://pay.payos.vn/web/abc123",
    };
    vi.spyOn(api, "post").mockResolvedValueOnce({
      data: mockPayment,
    } as unknown as never);

    const result = await checkoutService.startPayment("ord-123", "key-pay");
    expect(api.post).toHaveBeenCalledWith("/orders/{orderId}/payments", {
      params: { orderId: "ord-123" },
      idempotencyKey: "key-pay",
    });
    expect(result).toEqual(mockPayment);
  });
});
