import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getGuestCartItems,
  saveGuestCartItems,
  addGuestCartItem,
  updateGuestCartItemQuantity,
  removeGuestCartItem,
  clearGuestCart,
  toCartResponse,
} from "./guest-cart.ts";
import type { GuestCartItem } from "@/types";

describe("guest-cart utilities", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const sampleItem: GuestCartItem = {
    skuId: "sku-1",
    productName: "Sản phẩm A",
    price: 100000,
    addedPrice: 100000,
    quantity: 2,
    available: 10,
  };

  it("reads and writes guest cart to localStorage", () => {
    expect(getGuestCartItems()).toEqual([]);

    saveGuestCartItems([sampleItem]);
    expect(getGuestCartItems()).toEqual([sampleItem]);
  });

  it("adds an item or increments quantity if already exists", () => {
    addGuestCartItem(sampleItem);
    expect(getGuestCartItems()).toHaveLength(1);
    expect(getGuestCartItems()[0].quantity).toBe(2);

    // Add again with quantity 3 -> total 5
    addGuestCartItem({ ...sampleItem, quantity: 3 });
    expect(getGuestCartItems()).toHaveLength(1);
    expect(getGuestCartItems()[0].quantity).toBe(5);
  });

  it("updates item quantity and clamps to 99", () => {
    saveGuestCartItems([sampleItem]);

    updateGuestCartItemQuantity("sku-1", 10);
    expect(getGuestCartItems()[0].quantity).toBe(10);

    updateGuestCartItemQuantity("sku-1", 150);
    expect(getGuestCartItems()[0].quantity).toBe(99);

    // Quantity <= 0 removes item
    updateGuestCartItemQuantity("sku-1", 0);
    expect(getGuestCartItems()).toHaveLength(0);
  });

  it("removes an item and returns the removed item", () => {
    saveGuestCartItems([sampleItem]);

    const { items, removedItem } = removeGuestCartItem("sku-1");
    expect(items).toHaveLength(0);
    expect(removedItem?.skuId).toBe("sku-1");
    expect(getGuestCartItems()).toHaveLength(0);
  });

  it("clears guest cart", () => {
    saveGuestCartItems([sampleItem]);
    expect(getGuestCartItems()).toHaveLength(1);

    clearGuestCart();
    expect(getGuestCartItems()).toHaveLength(0);
  });

  it("transforms guest items to CartResponse structure correctly", () => {
    const items: GuestCartItem[] = [
      {
        skuId: "sku-1",
        productName: "Item 1",
        price: 100000,
        addedPrice: 100000,
        quantity: 2,
      },
      {
        skuId: "sku-2",
        productName: "Item 2",
        price: 50000,
        addedPrice: 60000,
        quantity: 3,
      },
    ];

    const res = toCartResponse(items);
    // subtotal = 100000*2 + 50000*3 = 350000
    expect(res.subtotal).toBe(350000);
    expect(res.lineCount).toBe(2);
    expect(res.quantityCount).toBe(5);
    expect(res.items).toHaveLength(2);
  });
});
