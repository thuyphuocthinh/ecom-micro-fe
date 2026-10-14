import { api } from "@ecom/api";
export type { CartSummary } from "@/types";

export const cartService = {
  getCart(options?: { silent?: boolean }) {
    return api.get("/cart", options);
  },
};
