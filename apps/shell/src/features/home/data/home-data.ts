import type {
  HomeCategoryDecoration,
  HomeProduct,
  HomeProductDecoration,
  ValueProp,
} from "@/features/home/types/home.ts";

/**
 * The featured card of the hero. It is a showcase of the design, not a product of the catalog (the
 * catalog has no such product), so it is not shown by the API-driven sections below.
 */
export const HERO_PRODUCT: HomeProduct = {
  id: "prod-aero-2",
  skuId: "sku-aero-2-navy",
  name: "Tai nghe không dây Aero 2",
  price: 3990000,
  oldPrice: 4590000,
  kind: "audio",
  tint: "#dce6ff",
  tone: "#101828",
};

/**
 * Only the look of a product card (the colour and the drawing that stands for the picture), taken in turn
 * by position. Never a name, a price or a number: those come from the API.
 */
export const PRODUCT_DECORATIONS: HomeProductDecoration[] = [
  { kind: "audio", tint: "#dce6ff", tone: "#101828" },
  { kind: "tech", tint: "#e3f1ea", tone: "#a9d3bd" },
  { kind: "fashion", tint: "#fdeedd", tone: "#f2c48f" },
  { kind: "fashion", tint: "#e9edf3", tone: "#b8c2d3" },
  { kind: "life", tint: "#ece8f8", tone: "#cdc3ee" },
  { kind: "life", tint: "#fff3d6", tone: "#f3d58a" },
  { kind: "audio", tint: "#e0f2f6", tone: "#9dd1dc" },
  { kind: "tech", tint: "#f0e6ee", tone: "#d9bdd3" },
];

/**
 * Only the look of a category tile (colours; the first tiles are bigger), taken in turn by position. The
 * name and the link of a tile come from the API.
 */
export const HOME_CATEGORY_DECORATIONS: HomeCategoryDecoration[] = [
  { tint: "#dce6ff", shapeBackground: "#bcd0ff", spanRow: "md:row-span-2" },
  { tint: "#e3f1ea", shapeBackground: "#b9dcc9", spanCol: "md:col-span-2" },
  { tint: "#fdeedd", shapeBackground: "#f6cfa3" },
  { tint: "#ece8f8", shapeBackground: "#d3cbef" },
];

export const VALUE_PROPS: ValueProp[] = [
  {
    id: "val-hold",
    title: "Hàng được giữ khi bạn thanh toán",
    description:
      "Bấm thanh toán là hàng được giữ cho bạn trong 15 phút, không lo bị người khác mua mất.",
    iconName: "credit-card",
  },
  {
    id: "val-idempotent",
    title: "Bấm hai lần cũng chỉ trừ tiền một lần",
    description:
      "Mạng chập chờn hay lỡ tay bấm lại, đơn của bạn vẫn chỉ có một lần thanh toán.",
    iconName: "shield-check",
  },
  {
    id: "val-refund",
    title: "Huỷ đơn đã trả thì tiền tự quay về",
    description:
      "Bạn không cần liên hệ ai: huỷ đơn trước khi giao, tiền được hoàn lại tự động.",
    iconName: "rotate-ccw",
  },
];
