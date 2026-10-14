import { api } from "@ecom/api";
import type { CartResponse } from "@/types";

export const cartService = {
  async getCart(): Promise<CartResponse> {
    const res = await api.get("/cart");
    return (res.data || {
      items: [],
      subtotal: 0,
      lineCount: 0,
      quantityCount: 0,
    }) as CartResponse;
  },

  async addItem(skuId: string, quantity: number) {
    return api.post("/cart/items", {
      body: { skuId, quantity },
    });
  },

  async setQuantity(skuId: string, quantity: number) {
    return api.put("/cart/items/{skuId}", {
      params: { skuId },
      body: { quantity },
    });
  },

  async removeItem(skuId: string) {
    return api.delete("/cart/items/{skuId}", {
      params: { skuId },
    });
  },

  async clearCart() {
    return api.delete("/cart");
  },
};
