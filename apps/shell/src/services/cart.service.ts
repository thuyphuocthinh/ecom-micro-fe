import { api } from "@ecom/api";

export interface CartSummary {
  lineCount?: number;
  totalQuantity?: number;
  subtotal?: number;
}

export const cartService = {
  getCart(options?: { silent?: boolean }) {
    return api.get("/cart", options);
  },
};
