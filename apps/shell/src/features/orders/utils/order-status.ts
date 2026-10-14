import type { OrderStatus, OrderTabKey, OrderRangeKey } from "@/types";

export interface OrderStatusMeta {
  label: string;
  bg: string;
  fg: string;
  tone: "brand" | "ok" | "warn" | "default" | "sale";
}

export const ORDER_STATUS_MAP: Record<OrderStatus, OrderStatusMeta> = {
  PENDING: {
    label: "Chờ thanh toán",
    bg: "#fff3d6",
    fg: "#8a5a00",
    tone: "warn",
  },
  PAYMENT_PROCESSING: {
    label: "Chờ thanh toán",
    bg: "#fff3d6",
    fg: "#8a5a00",
    tone: "warn",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    bg: "#eaf0ff",
    fg: "#2559c9",
    tone: "brand",
  },
  SHIPPING: {
    label: "Đang giao",
    bg: "#eaf0ff",
    fg: "#2559c9",
    tone: "brand",
  },
  DELIVERED: {
    label: "Đã giao",
    bg: "#e3f5ee",
    fg: "#0b7a55",
    tone: "ok",
  },
  CANCELLED: {
    label: "Đã huỷ",
    bg: "#f1f3f6",
    fg: "#5b6472",
    tone: "default",
  },
  EXPIRED: {
    label: "Hết hạn thanh toán",
    bg: "#f1f3f6",
    fg: "#5b6472",
    tone: "default",
  },
};

export function getOrderStatusMeta(status: OrderStatus): OrderStatusMeta {
  return (
    ORDER_STATUS_MAP[status] ?? {
      label: status,
      bg: "#f1f3f6",
      fg: "#5b6472",
      tone: "default",
    }
  );
}

export function isOrderCancellable(status: OrderStatus): boolean {
  return status === "PENDING" || status === "CONFIRMED";
}

export function isOrderRebuyable(status: OrderStatus): boolean {
  return (
    status === "DELIVERED" || status === "CANCELLED" || status === "EXPIRED"
  );
}

export function isOrderPayable(status: OrderStatus): boolean {
  return status === "PENDING" || status === "PAYMENT_PROCESSING";
}

export function mapTabToStatusParam(tab: OrderTabKey): string | undefined {
  switch (tab) {
    case "waiting":
      return "PENDING,PAYMENT_PROCESSING";
    case "confirmed":
      return "CONFIRMED";
    case "shipping":
      return "SHIPPING";
    case "delivered":
      return "DELIVERED";
    case "closed":
      return "CANCELLED,EXPIRED";
    case "all":
    default:
      return undefined;
  }
}

export function calculateDateRange(
  range: OrderRangeKey | undefined,
  from?: string,
  to?: string,
): {
  createdFrom?: string;
  createdTo?: string;
  isValid: boolean;
  error?: string;
} {
  if (!range || range === "all") return { isValid: true };

  const now = new Date();
  if (range === "30d") {
    const d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { createdFrom: d.toISOString(), isValid: true };
  }
  if (range === "3m") {
    const d = new Date(now.getTime() - 92 * 24 * 60 * 60 * 1000);
    return { createdFrom: d.toISOString(), isValid: true };
  }
  if (range === "year") {
    const d = new Date(now.getFullYear(), 0, 1);
    return { createdFrom: d.toISOString(), isValid: true };
  }
  if (range === "custom") {
    if (from && to && new Date(from) > new Date(to)) {
      return {
        isValid: false,
        error: "Ngày bắt đầu phải trước hoặc cùng ngày kết thúc.",
      };
    }
    return {
      createdFrom: from
        ? new Date(`${from}T00:00:00.000`).toISOString()
        : undefined,
      createdTo: to ? new Date(`${to}T23:59:59.999`).toISOString() : undefined,
      isValid: true,
    };
  }
  return { isValid: true };
}
