import { api } from "@ecom/api";
import type {
  OrderCounts,
  OrderDetail,
  OrderFilterParams,
  OrderSummary,
} from "@/types";

export interface GetOrdersOptions extends OrderFilterParams {
  status?: string;
  createdFrom?: string;
  createdTo?: string;
  q?: string;
  cursor?: string;
  limit?: number;
}

export const orderService = {
  getOrders(options: GetOrdersOptions = {}) {
    const query: Record<string, string | number> = {};
    if (options.status) query.status = options.status;
    if (options.createdFrom) query.createdFrom = options.createdFrom;
    if (options.createdTo) query.createdTo = options.createdTo;
    if (options.q) query.q = options.q;
    if (options.cursor) query.cursor = options.cursor;
    if (options.limit) query.limit = options.limit;

    return api.get("/orders", { query }) as Promise<{
      data: OrderSummary[];
      meta?: { nextCursor?: string; hasMore?: boolean };
    }>;
  },

  getOrderCounts(
    options: { createdFrom?: string; createdTo?: string; q?: string } = {},
  ) {
    const query: Record<string, string> = {};
    if (options.createdFrom) query.createdFrom = options.createdFrom;
    if (options.createdTo) query.createdTo = options.createdTo;
    if (options.q) query.q = options.q;

    return api.get("/orders/counts", { query }) as Promise<{
      data: OrderCounts;
    }>;
  },

  getOrder(id: string) {
    return api.get("/orders/{id}", {
      params: { id },
    }) as unknown as Promise<{ data: OrderDetail }>;
  },

  cancelOrder(id: string) {
    return api.post("/orders/{id}/cancel", {
      params: { id },
    });
  },
};
