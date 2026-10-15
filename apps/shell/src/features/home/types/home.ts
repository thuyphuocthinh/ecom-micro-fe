import type { IconName } from "@ecom/ui";

export type HomeCategoryKind = "audio" | "tech" | "fashion" | "life";

export interface HomeProduct {
  id: string;
  skuId: string;
  name: string;
  price: number;
  oldPrice?: number | null;
  kind: HomeCategoryKind;
  tint: string;
  tone: string;
  rating: number;
  reviews: number;
}

export interface HomeCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  tint: string;
  shapeBackground: string;
  spanCol?: string;
  spanRow?: string;
}

export interface ValueProp {
  id: string;
  title: string;
  description: string;
  iconName: IconName;
}
