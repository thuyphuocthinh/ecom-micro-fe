import { api } from "@ecom/api";
import type {
  Product,
  ProductFilterParams,
  ProductsPageMeta,
  CategoryFacet,
} from "@/types";

export interface GetProductsResponse {
  data: Product[];
  meta: ProductsPageMeta;
}

export const productService = {
  getProducts(params: ProductFilterParams = {}) {
    const query: Record<string, string | number> = {};
    if (params.search?.trim()) query.search = params.search.trim();
    if (params.categoryId) query.categoryId = params.categoryId;
    if (typeof params.minPrice === "number" && !isNaN(params.minPrice)) {
      query.minPrice = params.minPrice;
    }
    if (typeof params.maxPrice === "number" && !isNaN(params.maxPrice)) {
      query.maxPrice = params.maxPrice;
    }
    if (params.inStock === true || params.inStock === "true") {
      query.inStock = "true";
    }
    if (params.onSale === true || params.onSale === "true") {
      query.onSale = "true";
    }
    if (params.sort) query.sort = params.sort;
    if (params.cursor) query.cursor = params.cursor;
    if (typeof params.page === "number" && params.page > 0) {
      query.page = params.page;
    }
    if (typeof params.limit === "number" && params.limit > 0) {
      query.limit = params.limit;
    }

    return api.get("/catalog/products", {
      query,
    }) as unknown as Promise<GetProductsResponse>;
  },

  async getProductFacets(
    params: ProductFilterParams = {},
    parentId?: string,
  ): Promise<CategoryFacet[]> {
    const query: Record<string, string | number> = {};
    if (parentId) query.parentId = parentId;
    if (params.search?.trim()) query.search = params.search.trim();
    if (typeof params.minPrice === "number" && !isNaN(params.minPrice)) {
      query.minPrice = params.minPrice;
    }
    if (typeof params.maxPrice === "number" && !isNaN(params.maxPrice)) {
      query.maxPrice = params.maxPrice;
    }
    if (params.inStock === true || params.inStock === "true") {
      query.inStock = "true";
    }
    if (params.onSale === true || params.onSale === "true") {
      query.onSale = "true";
    }

    const res = (await api.get("/catalog/products/facets", {
      query,
    })) as unknown as CategoryFacet[] | { data: CategoryFacet[] };

    if (Array.isArray(res)) return res;
    if (
      res &&
      typeof res === "object" &&
      "data" in res &&
      Array.isArray(res.data)
    ) {
      return res.data;
    }
    return [];
  },

  async getProductById(id: string): Promise<Product> {
    const res = (await api.get("/catalog/products/{id}", {
      params: { id },
    })) as unknown as Product | { data: Product };

    if (res && typeof res === "object" && "data" in res && res.data) {
      return res.data;
    }
    return res as unknown as Product;
  },
};
