import { api } from "@ecom/api";

export const cartService = {
  addItem(skuId: string, quantity = 1) {
    return api.post("/cart/items", {
      body: { skuId, quantity },
    });
  },
};
