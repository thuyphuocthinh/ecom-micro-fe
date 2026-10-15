import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SearchPage } from "./SearchPage.tsx";
import { productService } from "@/services/product.service.ts";
import { categoryService } from "@/services/category.service.ts";
import { FACETS_STALE_MS } from "@/features/products/hooks/useProductFacetsQuery.ts";
import type { CategoryFacet, Product } from "@/types";

vi.mock("@/services/product.service.ts", () => ({
  productService: { getProducts: vi.fn(), getProductFacets: vi.fn() },
}));
vi.mock("@/services/category.service.ts", () => ({
  categoryService: { getCategories: vi.fn() },
}));

const FACETS: CategoryFacet[] = [
  { categoryId: "cat-phones", name: "Điện thoại", count: 12 },
  { categoryId: "cat-laptops", name: "Laptop", count: 5 },
];

function product(id: string, name: string): Product {
  return {
    id,
    categoryId: "cat-phones",
    name,
    description: "",
    thumbnail: null,
    status: "PUBLISHED",
    minPrice: 1000000,
    onSale: false,
    discountPercent: 0,
    inStock: true,
    createdAt: "2026-10-14T00:00:00Z",
    updatedAt: "2026-10-14T00:00:00Z",
    skus: [],
  } as unknown as Product;
}

const NEWEST = [
  product("p1", "Điện thoại mới 1"),
  product("p2", "Điện thoại mới 2"),
];
const CHEAPEST = [product("p3", "Điện thoại rẻ 1")];

/** A response that the test finishes when it decides, to look at the page while it waits. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

const page = (data: Product[]) => ({
  data,
  meta: { page: 1, limit: 12, hasMore: false, total: data.length },
});

function renderPage(initialUrl = "/search", queryClient?: QueryClient) {
  const client =
    queryClient ??
    new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const view = render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[initialUrl]}>
        <Routes>
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return { client, ...view };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(categoryService.getCategories).mockResolvedValue({
    data: [],
  } as never);
  vi.mocked(productService.getProductFacets).mockResolvedValue(FACETS);
  vi.mocked(productService.getProducts).mockResolvedValue(
    page(NEWEST) as never,
  );
});

describe("no skeleton while the page refreshes in the background (AC-9)", () => {
  it("shows the skeleton only on the very first load", async () => {
    const first = deferred<unknown>();
    vi.mocked(productService.getProducts).mockReturnValueOnce(
      first.promise as never,
    );

    renderPage();
    expect(screen.getByTestId("product-grid-loading")).toBeInTheDocument();

    await act(async () => {
      first.resolve(page(NEWEST));
    });
    await screen.findByText("Điện thoại mới 1");
    expect(
      screen.queryByTestId("product-grid-loading"),
    ).not.toBeInTheDocument();
  });

  it("a refresh in the background with the same parameters never brings the skeleton back", async () => {
    const refresh = deferred<unknown>();
    const { client } = renderPage();
    await screen.findByText("Điện thoại mới 1");
    vi.mocked(productService.getProducts).mockReturnValueOnce(
      refresh.promise as never,
    );

    // The data is refreshed (what happens when it goes stale, or the tab is shown again)
    act(() => {
      void client.invalidateQueries({ queryKey: ["products"] });
    });
    await waitFor(() =>
      expect(productService.getProducts).toHaveBeenCalledTimes(2),
    );

    // While the new answer is on its way: the same cards, no skeleton, not dimmed
    expect(screen.getByText("Điện thoại mới 1")).toBeInTheDocument();
    expect(
      screen.queryByTestId("product-grid-loading"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("product-grid")).toHaveAttribute(
      "aria-busy",
      "false",
    );
    expect(screen.getByTestId("product-grid")).not.toHaveClass("opacity-60");

    await act(async () => {
      refresh.resolve(page(NEWEST));
    });
    expect(screen.getByText("Điện thoại mới 1")).toBeInTheDocument();
  });
});

describe("a new filter keeps the old results until the new ones arrive (AC-10)", () => {
  it("dims the old results and marks the grid busy, then replaces them", async () => {
    const user = userEvent.setup();
    const next = deferred<unknown>();
    renderPage();
    await screen.findByText("Điện thoại mới 1");
    vi.mocked(productService.getProducts).mockReturnValueOnce(
      next.promise as never,
    );

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Sắp xếp:" }),
      "price_asc",
    );

    // Waiting for the answer: the old cards are still there, dimmed, and there is no skeleton
    await waitFor(() =>
      expect(screen.getByTestId("product-grid")).toHaveAttribute(
        "aria-busy",
        "true",
      ),
    );
    expect(screen.getByTestId("product-grid")).toHaveClass("opacity-60");
    expect(screen.getByText("Điện thoại mới 1")).toBeInTheDocument();
    expect(
      screen.queryByTestId("product-grid-loading"),
    ).not.toBeInTheDocument();

    await act(async () => {
      next.resolve(page(CHEAPEST));
    });

    await screen.findByText("Điện thoại rẻ 1");
    expect(screen.queryByText("Điện thoại mới 1")).not.toBeInTheDocument();
    expect(screen.getByTestId("product-grid")).toHaveAttribute(
      "aria-busy",
      "false",
    );
    expect(screen.getByTestId("product-grid")).not.toHaveClass("opacity-60");
  });

  it("hides the load-more button while the results shown are the old ones", async () => {
    const user = userEvent.setup();
    vi.mocked(productService.getProducts).mockResolvedValueOnce({
      data: NEWEST,
      meta: { hasMore: true, nextCursor: "c2" },
    } as never);
    renderPage();
    await screen.findByRole("button", { name: "Xem thêm sản phẩm" });
    const next = deferred<unknown>();
    vi.mocked(productService.getProducts).mockReturnValueOnce(
      next.promise as never,
    );

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Sắp xếp:" }),
      "price_asc",
    );

    await waitFor(() =>
      expect(screen.getByTestId("product-grid")).toHaveAttribute(
        "aria-busy",
        "true",
      ),
    );
    expect(
      screen.queryByRole("button", { name: "Xem thêm sản phẩm" }),
    ).not.toBeInTheDocument();
    await act(async () => {
      next.resolve(page(CHEAPEST));
    });
  });

  it("when the new request fails the old results stay on screen", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("Điện thoại mới 1");
    vi.mocked(productService.getProducts).mockRejectedValueOnce(
      new Error("boom"),
    );

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Sắp xếp:" }),
      "price_asc",
    );

    await waitFor(() =>
      expect(productService.getProducts).toHaveBeenCalledTimes(2),
    );
    expect(
      screen.queryByTestId("product-grid-loading"),
    ).not.toBeInTheDocument();
  });
});

describe("the facets are not asked again for nothing (AC-11)", () => {
  it("changing the sort does not ask for the facets again", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("Điện thoại mới 1");
    expect(productService.getProductFacets).toHaveBeenCalledTimes(1);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Sắp xếp:" }),
      "price_asc",
    );
    await waitFor(() =>
      expect(productService.getProducts).toHaveBeenCalledTimes(2),
    );
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Sắp xếp:" }),
      "price_desc",
    );
    await waitFor(() =>
      expect(productService.getProducts).toHaveBeenCalledTimes(3),
    );

    expect(productService.getProductFacets).toHaveBeenCalledTimes(1);
  });

  it("choosing a category does not ask for the facets again", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("Điện thoại mới 1");

    await user.click(screen.getAllByRole("button", { name: /Điện thoại/i })[0]);
    await waitFor(() =>
      expect(productService.getProducts).toHaveBeenCalledTimes(2),
    );

    expect(productService.getProductFacets).toHaveBeenCalledTimes(1);
  });

  it("a filter that changes the counts (in stock) asks for the facets again", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("Điện thoại mới 1");

    await user.click(screen.getAllByLabelText("Chỉ sản phẩm còn hàng")[0]);

    await waitFor(() =>
      expect(productService.getProductFacets).toHaveBeenCalledTimes(2),
    );
  });

  it("the facets stay fresh for 5 minutes: opening the page again does not ask again", async () => {
    const first = renderPage();
    await screen.findByText("Điện thoại mới 1");
    expect(productService.getProductFacets).toHaveBeenCalledTimes(1);
    first.unmount();

    renderPage("/search", first.client);
    await screen.findByText("Điện thoại mới 1");

    expect(productService.getProductFacets).toHaveBeenCalledTimes(1);
    expect(FACETS_STALE_MS).toBe(5 * 60 * 1000);
  });

  it("the category list does not flicker while new counts load", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("Điện thoại mới 1");
    const slow = deferred<CategoryFacet[]>();
    vi.mocked(productService.getProductFacets).mockReturnValueOnce(
      slow.promise,
    );

    await user.click(screen.getAllByLabelText("Chỉ sản phẩm còn hàng")[0]);

    await waitFor(() =>
      expect(productService.getProductFacets).toHaveBeenCalledTimes(2),
    );
    expect(screen.getAllByText("Laptop").length).toBeGreaterThanOrEqual(1); // still there
    await act(async () => {
      slow.resolve(FACETS);
    });
  });
});
