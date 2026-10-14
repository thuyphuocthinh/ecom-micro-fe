import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route, useLocation } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SearchPage } from "./SearchPage.tsx";
import { productService } from "@/services/product.service.ts";
import { categoryService } from "@/services/category.service.ts";
import type { Product, Category, CategoryFacet } from "@/types";

vi.mock("@/services/product.service.ts", () => ({
  productService: {
    getProducts: vi.fn(),
    getProductFacets: vi.fn(),
  },
}));

vi.mock("@/services/category.service.ts", () => ({
  categoryService: {
    getCategories: vi.fn(),
  },
}));

const mockCategories: Category[] = [
  { id: "cat-phones", name: "Điện thoại", slug: "dien-thoai" },
  { id: "cat-laptops", name: "Laptop", slug: "laptop" },
];

const mockFacets: CategoryFacet[] = [
  { categoryId: "cat-phones", name: "Điện thoại", count: 12 },
  { categoryId: "cat-laptops", name: "Laptop", count: 5 },
];

const mockProducts: Product[] = [
  {
    id: "prod-1",
    categoryId: "cat-phones",
    name: "iPhone 15 Pro Max",
    description: "Apple flagship titanium",
    thumbnail: "https://example.com/iphone.jpg",
    status: "PUBLISHED",
    minPrice: 30000000,
    onSale: true,
    discountPercent: 10,
    inStock: true,
    createdAt: "2026-10-14T00:00:00Z",
    updatedAt: "2026-10-14T00:00:00Z",
    skus: [
      {
        id: "sku-1",
        productId: "prod-1",
        code: "IP15-256",
        name: "256GB Natural",
        price: 30000000,
        originalPrice: 33000000,
        inStock: true,
      },
    ],
  },
  {
    id: "prod-2",
    categoryId: "cat-laptops",
    name: "MacBook Air M3",
    description: "Apple M3 15-inch",
    thumbnail: "https://example.com/macbook.jpg",
    status: "PUBLISHED",
    minPrice: 28000000,
    onSale: false,
    discountPercent: 0,
    inStock: true,
    createdAt: "2026-10-14T01:00:00Z",
    updatedAt: "2026-10-14T01:00:00Z",
    skus: [
      {
        id: "sku-2",
        productId: "prod-2",
        code: "MBA-15",
        name: "512GB Midnight",
        price: 28000000,
        inStock: true,
      },
    ],
  },
];

function LocationTracker() {
  const location = useLocation();
  return <div data-testid="location-search">{location.search}</div>;
}

function renderSearchPage(initialUrl = "/search") {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialUrl]}>
        <Routes>
          <Route
            path="/search"
            element={
              <>
                <SearchPage />
                <LocationTracker />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("SearchPage Integration (AC-1 to AC-9)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(categoryService.getCategories).mockResolvedValue({
      data: mockCategories,
    });
    vi.mocked(productService.getProductFacets).mockResolvedValue(mockFacets);
    vi.mocked(productService.getProducts).mockResolvedValue({
      data: mockProducts,
      meta: {
        page: 1,
        limit: 12,
        hasMore: false,
        total: 2,
      },
    });
  });

  it("renders header, total products count, facets and product cards (AC-1, AC-2, AC-3)", async () => {
    renderSearchPage();

    // Check title and count
    expect(
      screen.getByRole("heading", { level: 1, name: "Tất cả sản phẩm" }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("2 sản phẩm")).toBeInTheDocument();
    });

    // Check products rendered
    expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();
    expect(screen.getByText("MacBook Air M3")).toBeInTheDocument();

    // Check category facets rendered
    expect(screen.getAllByText("Điện thoại").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Laptop").length).toBeGreaterThanOrEqual(1);
  });

  it("updates URL when a category facet is clicked (AC-3)", async () => {
    const user = userEvent.setup();
    renderSearchPage();

    await waitFor(() => {
      expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();
      expect(
        screen.getAllByRole("button", { name: /Điện thoại/i }).length,
      ).toBeGreaterThanOrEqual(1);
    });

    // Find category button in sidebar
    const phoneButtons = screen.getAllByRole("button", { name: /Điện thoại/i });
    await user.click(phoneButtons[0]);

    // Check that URL updated with category param
    expect(screen.getByTestId("location-search")).toHaveTextContent(
      "category=cat-phones",
    );
  });

  it("validates price range and updates URL on apply, clears price on clear (AC-4)", async () => {
    const user = userEvent.setup();
    renderSearchPage();

    await waitFor(() => {
      expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();
    });

    const minInputs = screen.getAllByPlaceholderText("Từ ₫");
    const maxInputs = screen.getAllByPlaceholderText("Đến ₫");
    const applyButtons = screen.getAllByRole("button", { name: "Áp dụng giá" });

    // Test invalid price (min > max)
    await user.clear(minInputs[0]);
    await user.type(minInputs[0], "50000000");
    await user.clear(maxInputs[0]);
    await user.type(maxInputs[0], "10000000");
    await user.click(applyButtons[0]);

    expect(
      screen.getByText("Giá tối thiểu phải nhỏ hơn hoặc bằng giá tối đa"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("location-search")).not.toHaveTextContent(
      "minPrice",
    );

    // Test valid price (10M to 30M)
    await user.clear(minInputs[0]);
    await user.type(minInputs[0], "10000000");
    await user.clear(maxInputs[0]);
    await user.type(maxInputs[0], "30000000");
    await user.click(applyButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId("location-search")).toHaveTextContent(
        "minPrice=10000000",
      );
      expect(screen.getByTestId("location-search")).toHaveTextContent(
        "maxPrice=30000000",
      );
    });

    // Test clear price
    const clearPriceBtns = screen.getAllByRole("button", { name: "Xóa" });
    await user.click(clearPriceBtns[0]);

    await waitFor(() => {
      expect(screen.getByTestId("location-search")).not.toHaveTextContent(
        "minPrice",
      );
      expect(screen.getByTestId("location-search")).not.toHaveTextContent(
        "maxPrice",
      );
    });
  });

  it("updates URL when toggling inStock and onSale filters (AC-5)", async () => {
    const user = userEvent.setup();
    renderSearchPage();

    await waitFor(() => {
      expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();
    });

    const inStockCheckboxes = screen.getAllByLabelText("Chỉ sản phẩm còn hàng");
    const onSaleCheckboxes = screen.getAllByLabelText("Đang giảm giá");

    await user.click(inStockCheckboxes[0]);
    expect(screen.getByTestId("location-search")).toHaveTextContent(
      "inStock=true",
    );

    await user.click(onSaleCheckboxes[0]);
    expect(screen.getByTestId("location-search")).toHaveTextContent(
      "onSale=true",
    );
  });

  it("updates URL when changing sort option (AC-6)", async () => {
    const user = userEvent.setup();
    renderSearchPage();

    await waitFor(() => {
      expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();
    });

    const sortSelect = screen.getByRole("combobox", { name: "Sắp xếp:" });
    await user.selectOptions(sortSelect, "price_asc");

    expect(screen.getByTestId("location-search")).toHaveTextContent(
      "sort=price_asc",
    );
  });

  it("renders empty state and allows resetting filters (AC-8)", async () => {
    vi.mocked(productService.getProducts).mockResolvedValueOnce({
      data: [],
      meta: {
        page: 1,
        limit: 12,
        hasMore: false,
        total: 0,
      },
    });

    const user = userEvent.setup();
    renderSearchPage("/search?category=cat-empty&minPrice=999999999");

    await waitFor(() => {
      expect(
        screen.getByText("Không tìm thấy sản phẩm phù hợp"),
      ).toBeInTheDocument();
    });

    const clearButton = screen.getByRole("button", {
      name: /xoá tất cả bộ lọc/i,
    });
    await user.click(clearButton);

    expect(screen.getByTestId("location-search")).toHaveTextContent("");
  });

  it("loads more products when clicking load more button (AC-7)", async () => {
    vi.mocked(productService.getProducts)
      .mockResolvedValueOnce({
        data: [mockProducts[0]],
        meta: {
          page: 1,
          limit: 1,
          hasMore: true,
          nextCursor: "cursor-2",
          total: 2,
        },
      })
      .mockResolvedValueOnce({
        data: [mockProducts[1]],
        meta: {
          page: 2,
          limit: 1,
          hasMore: false,
          total: 2,
        },
      });

    const user = userEvent.setup();
    renderSearchPage();

    await waitFor(() => {
      expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();
    });

    const loadMoreButton = screen.getByRole("button", {
      name: "Xem thêm sản phẩm",
    });
    expect(loadMoreButton).toBeInTheDocument();

    await user.click(loadMoreButton);

    await waitFor(() => {
      expect(screen.getByText("MacBook Air M3")).toBeInTheDocument();
    });
  });

  it("opens and closes mobile filter drawer (AC-9)", async () => {
    const user = userEvent.setup();
    renderSearchPage();

    await waitFor(() => {
      expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();
    });

    // Mobile filter toggle
    const filterBtn = screen.getByRole("button", { name: "Bộ lọc" });
    await user.click(filterBtn);

    // Dialog should be visible
    const dialog = screen.getByRole("dialog", { name: "Bộ lọc tìm kiếm" });
    expect(dialog).toBeInTheDocument();

    // Close button
    const closeBtn = screen.getByRole("button", { name: "Đóng bộ lọc" });
    await user.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("dispatches custom events when adding product to cart", async () => {
    const user = userEvent.setup();
    const cartAddSpy = vi.fn();
    const cartChangedSpy = vi.fn();

    window.addEventListener("cart:add", cartAddSpy);
    window.addEventListener("cart:changed", cartChangedSpy);

    renderSearchPage();

    await waitFor(() => {
      expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();
    });

    const addButtons = screen.getAllByRole("button", { name: /Thêm vào giỏ/i });
    await user.click(addButtons[0]);

    expect(cartAddSpy).toHaveBeenCalledTimes(1);
    expect(cartChangedSpy).toHaveBeenCalledTimes(1);

    window.removeEventListener("cart:add", cartAddSpy);
    window.removeEventListener("cart:changed", cartChangedSpy);
  });
});
