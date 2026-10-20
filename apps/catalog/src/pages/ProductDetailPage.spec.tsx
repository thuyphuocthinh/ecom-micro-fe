import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProductDetailPage } from "./ProductDetailPage.tsx";
import { productService } from "@/services/product.service.ts";
import { categoryService } from "@/services/category.service.ts";
import { toast } from "sonner";
import { ApiError, session } from "@ecom/api";
import { cartService } from "@/services/cart.service.ts";
import type { Product, Category } from "@/types";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("@/services/product.service.ts", () => ({
  productService: {
    getProductById: vi.fn(),
    getProducts: vi.fn(),
  },
}));

vi.mock("@/services/category.service.ts", () => ({
  categoryService: {
    getCategories: vi.fn(),
  },
}));

const mockProduct: Product = {
  id: "prod-aero2",
  categoryId: "cat-audio",
  name: "Tai nghe không dây Aero 2",
  description:
    "Aero 2 là tai nghe chụp tai không dây chống ồn chủ động cao cấp.",
  thumbnail: "https://example.com/aero2.jpg",
  status: "PUBLISHED",
  minPrice: 3990000,
  onSale: true,
  discountPercent: 13,
  inStock: true,
  createdAt: "2026-10-14T00:00:00Z",
  updatedAt: "2026-10-14T00:00:00Z",
  skus: [
    {
      id: "sku-ink",
      skuCode: "AERO2-INK",
      name: "Xanh đen",
      price: 3990000,
      compareAtPrice: 4590000,
      discountPercent: 13,
      inStock: true,
      stock: 24,
      attributes: { color: "Xanh đen", hex: "#101828" },
    },
    {
      id: "sku-wht",
      skuCode: "AERO2-WHT",
      name: "Trắng ngà",
      price: 4090000,
      compareAtPrice: null,
      discountPercent: 0,
      inStock: true,
      stock: 5,
      attributes: { color: "Trắng ngà", hex: "#f4f1ea" },
    },
  ],
};

const mockCategories: Category[] = [
  { id: "cat-audio", name: "Âm thanh", slug: "am-thanh" },
];

function renderPDP(initialRoute = "/products/prod-aero2") {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/search" element={<div>Trang tìm kiếm</div>} />
          <Route path="/checkout" element={<div>Trang thanh toán</div>} />
          <Route path="/cart" element={<div>Trang giỏ hàng</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("ProductDetailPage (AC-1, AC-3, AC-6, AC-11)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = vi.fn();
    vi.mocked(categoryService.getCategories).mockResolvedValue({
      data: mockCategories,
    } as any);
    vi.mocked(productService.getProducts).mockResolvedValue({
      data: [],
      meta: {},
    });
  });

  it("renders product detail page successfully (AC-1)", async () => {
    vi.mocked(productService.getProductById).mockResolvedValue(mockProduct);

    renderPDP();

    // Skeletons while loading
    expect(screen.getByTestId("product-detail-skeleton")).toBeInTheDocument();

    // Loaded
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Tai nghe không dây Aero 2" }),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("3.990.000 ₫")).toBeInTheDocument();
    expect(screen.getByText("Mô tả sản phẩm")).toBeInTheDocument();
    expect(screen.getByText("Thông số")).toBeInTheDocument();
  });

  it("updates price and SKU info when selecting another variant (AC-3)", async () => {
    vi.mocked(productService.getProductById).mockResolvedValue(mockProduct);
    const user = userEvent.setup();

    renderPDP();

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Tai nghe không dây Aero 2" }),
      ).toBeInTheDocument();
    });

    // Default SKU is Xanh đen at 3.990.000 ₫
    expect(screen.getByText("3.990.000 ₫")).toBeInTheDocument();

    // Select Trắng ngà
    const whiteVariant = screen.getByLabelText("Trắng ngà");
    await user.click(whiteVariant);

    // Price updates to 4.090.000 ₫
    await waitFor(() => {
      expect(screen.getByText("4.090.000 ₫")).toBeInTheDocument();
    });
    expect(screen.getByText(/AERO2-WHT/)).toBeInTheDocument();
  });

  it("dispatches cart:add event and shows toast on Add to Cart (AC-6)", async () => {
    vi.mocked(productService.getProductById).mockResolvedValue(mockProduct);
    const user = userEvent.setup();
    const cartAddSpy = vi.fn();
    window.addEventListener("cart:add", cartAddSpy);

    renderPDP();

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Tai nghe không dây Aero 2" }),
      ).toBeInTheDocument();
    });

    const addBtn = screen.getByRole("button", { name: /Thêm vào giỏ/ });
    await user.click(addBtn);

    expect(cartAddSpy).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringMatching(
        /Đã thêm 1 × Tai nghe không dây Aero 2 \(Xanh đen\) vào giỏ hàng/,
      ),
      expect.objectContaining({
        action: expect.objectContaining({ label: "Xem giỏ hàng" }),
      }),
    );
  });

  it("renders ProductNotFound when product fails to load (AC-11)", async () => {
    vi.mocked(productService.getProductById).mockRejectedValue(
      new Error("Product not found"),
    );

    renderPDP("/products/invalid-id");

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Không tìm thấy sản phẩm" }),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("link", { name: "Quay lại danh mục sản phẩm" }),
    ).toBeInTheDocument();
  });
});

describe("ProductDetailPage buying while signed in", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = vi.fn();
    vi.mocked(categoryService.getCategories).mockResolvedValue({
      data: mockCategories,
    } as any);
    vi.mocked(productService.getProducts).mockResolvedValue({
      data: [],
      meta: {},
    });
    vi.mocked(productService.getProductById).mockResolvedValue(mockProduct);
    session.set({ accessToken: "access-123", refreshToken: "refresh-123" });
  });

  afterEach(() => {
    session.clear();
    vi.restoreAllMocks();
  });

  const waitForPage = () =>
    screen.findByRole("heading", { name: "Tai nghe không dây Aero 2" });

  it("while the product is being added both buttons are busy, and pressing again sends no second request", async () => {
    const user = userEvent.setup();
    let finish!: () => void;
    const addItem = vi.spyOn(cartService, "addItem").mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = () => resolve({ data: {}, replayed: false } as never);
        }),
    );

    renderPDP();
    await waitForPage();
    const add = screen.getByRole("button", { name: /Thêm vào giỏ|Đang thêm/ });

    await user.click(add);
    await waitFor(() => expect(add).toBeDisabled());
    expect(add).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: "Mua ngay" })).toBeDisabled();

    await user.click(add);
    expect(addItem).toHaveBeenCalledTimes(1);

    finish();
    await waitFor(() => expect(add).toBeEnabled());
  });

  it("Mua ngay adds the product and then goes to the cart", async () => {
    const user = userEvent.setup();
    const addItem = vi
      .spyOn(cartService, "addItem")
      .mockResolvedValue({ data: {}, replayed: false } as never);

    renderPDP();
    await waitForPage();
    await user.click(screen.getByRole("button", { name: "Mua ngay" }));

    expect(await screen.findByText("Trang giỏ hàng")).toBeInTheDocument();
    expect(addItem).toHaveBeenCalledTimes(1);
  });

  it("Mua ngay stays on the page when the server refuses, and adds no second message of its own", async () => {
    const user = userEvent.setup();
    vi.spyOn(cartService, "addItem").mockRejectedValue(
      Object.assign(Object.create(ApiError.prototype), {
        status: 409,
        code: "INV-001",
        message: "Hết hàng",
      }),
    );

    renderPDP();
    await waitForPage();
    await user.click(screen.getByRole("button", { name: "Mua ngay" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Mua ngay" })).toBeEnabled(),
    );
    expect(screen.queryByText("Trang giỏ hàng")).not.toBeInTheDocument();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("Mua ngay stays on the page and says so when the network fails", async () => {
    const user = userEvent.setup();
    vi.spyOn(cartService, "addItem").mockRejectedValue(
      new TypeError("offline"),
    );

    renderPDP();
    await waitForPage();
    await user.click(screen.getByRole("button", { name: "Mua ngay" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Không thể thêm vào giỏ hàng, vui lòng thử lại",
      ),
    );
    expect(screen.queryByText("Trang giỏ hàng")).not.toBeInTheDocument();
  });
});
