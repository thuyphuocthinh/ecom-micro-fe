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
  async getProducts(
    params: ProductFilterParams = {},
  ): Promise<GetProductsResponse> {
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

    const res = await api.get("/catalog/products", {
      query,
    });
    // The client has already taken the list out of the answer: `res.data` is the list and `res.meta`
    // is the paging (`nextCursor` or `page`/`total`), side by side.
    return {
      data: (res.data ?? []) as Product[],
      meta: (res.meta ?? {}) as ProductsPageMeta,
    };
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

    const res = await api.get("/catalog/products/facets", {
      query,
    });
    return (res.data ?? []) as CategoryFacet[];
  },

  async getProductById(id: string): Promise<Product> {
    const res = await api.get("/catalog/products/{identifier}", {
      params: { identifier: id },
    });
    return res.data as Product;
  },
};
