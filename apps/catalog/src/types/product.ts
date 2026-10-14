export type ProductSortOption =
  "newest" | "price_asc" | "price_desc" | "relevance";

export interface Sku {
  id: string;
  productId: string;
  code: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  inStock?: boolean;
  stock?: number;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description?: string | null;
  thumbnail?: string | null;
  status: string;
  skus: Sku[];
  minPrice: number | null;
  onSale: boolean;
  discountPercent: number;
  inStock?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilterParams {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean | "true";
  onSale?: boolean | "true";
  sort?: ProductSortOption;
  cursor?: string;
  page?: number;
  limit?: number;
}

export interface ProductsPageMeta {
  page?: number;
  limit?: number;
  hasMore?: boolean;
  nextCursor?: string;
  total?: number;
  totalCapped?: boolean;
}

export interface ProductsResponse {
  products: Product[];
  meta: ProductsPageMeta;
}
