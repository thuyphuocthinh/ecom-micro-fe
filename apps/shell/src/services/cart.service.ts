import { api } from "@ecom/api";
export type { CartSummary } from "@/types";

export const cartService = {
  getCart(options?: { silent?: boolean }) {
    return api.get("/cart", options);
  },

  /** Puts `quantity` of a SKU into the signed-in customer's cart (the cart on the server). */
  addItem(skuId: string, quantity = 1) {
    return api.post("/cart/items", {
      body: { skuId, quantity },
    });
  },
};
