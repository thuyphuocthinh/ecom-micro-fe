import type { OrderCounts, OrderTabKey } from "@/types";

export interface OrderStatusTabsProps {
  activeTab: OrderTabKey;
  counts?: OrderCounts;
  onTabChange: (tab: OrderTabKey) => void;
}

interface TabConfig {
  key: OrderTabKey;
  label: string;
  getCount: (counts?: OrderCounts) => number;
}

const TAB_CONFIGS: TabConfig[] = [
  {
    key: "all",
    label: "Tất cả",
    getCount: (c) =>
      c
        ? (c.PENDING ?? 0) +
          (c.PAYMENT_PROCESSING ?? 0) +
          (c.CONFIRMED ?? 0) +
          (c.SHIPPING ?? 0) +
          (c.DELIVERED ?? 0) +
          (c.CANCELLED ?? 0) +
          (c.EXPIRED ?? 0)
        : 0,
  },
  {
    key: "waiting",
    label: "Chờ thanh toán",
    getCount: (c) => (c ? (c.PENDING ?? 0) + (c.PAYMENT_PROCESSING ?? 0) : 0),
  },
  {
    key: "confirmed",
    label: "Đã xác nhận",
    getCount: (c) => c?.CONFIRMED ?? 0,
  },
  {
    key: "shipping",
    label: "Đang giao",
    getCount: (c) => c?.SHIPPING ?? 0,
  },
  {
    key: "delivered",
    label: "Đã giao",
    getCount: (c) => c?.DELIVERED ?? 0,
  },
  {
    key: "closed",
    label: "Đã huỷ",
    getCount: (c) => (c ? (c.CANCELLED ?? 0) + (c.EXPIRED ?? 0) : 0),
  },
];

export function OrderStatusTabs({
  activeTab,
  counts,
  onTabChange,
}: OrderStatusTabsProps) {
  return (
    <div
      role="group"
      aria-label="Lọc theo trạng thái"
      className="flex gap-2 overflow-x-auto pb-1 no-scrollbar"
    >
      {TAB_CONFIGS.map((t) => {
        const isSelected = activeTab === t.key;
        const count = t.getCount(counts);

        return (
          <button
            key={t.key}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onTabChange(t.key)}
            className={`inline-flex items-center gap-2 min-h-[44px] px-4 rounded-full border text-[14.5px] font-semibold whitespace-nowrap transition-colors cursor-pointer select-none ${
              isSelected
                ? "bg-ink border-ink text-white"
                : "bg-white border-[#c9ced8] text-ink-2 hover:border-ink hover:text-ink"
            }`}
          >
            <span>{t.label}</span>{" "}
            <span className="text-[12.5px] opacity-80 tnum font-normal">
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
