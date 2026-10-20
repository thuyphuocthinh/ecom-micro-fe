import type { IconName } from "@ecom/ui";

export type HomeCategoryKind = "audio" | "tech" | "fashion" | "life";

export interface HomeProduct {
  id: string;
  skuId: string;
  name: string;
  /** Kept for the guest cart, whose lines show the picture. The card itself draws a shape. */
  thumbnail?: string | null;
  price: number;
  oldPrice?: number | null;
  kind: HomeCategoryKind;
  tint: string;
  tone: string;
}

/** What makes a product card look like a picture while there is none: a colour and a drawing. */
export type HomeProductDecoration = Pick<HomeProduct, "kind" | "tint" | "tone">;

/** The colours and size of a category tile. */
export interface HomeCategoryDecoration {
  tint: string;
  shapeBackground: string;
  spanCol?: string;
  spanRow?: string;
}

export interface HomeCategory extends HomeCategoryDecoration {
  /** The id the API gave: the link of the tile is made from it. */
  id: string;
  name: string;
  /** Not every category has one; the tile shows it only when there is. */
  description?: string;
}

export interface ValueProp {
  id: string;
  title: string;
  description: string;
  iconName: IconName;
}
