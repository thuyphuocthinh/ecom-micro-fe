import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import { HomePage } from "@/pages/HomePage.tsx";
import { GUEST_CART_STORAGE_KEY } from "@/utils/cart.ts";
import {
  catalogService,
  type ApiCategory,
  type ApiProduct,
} from "@/services/catalog.service.ts";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function renderHomePage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const API_CATEGORIES: ApiCategory[] = [
  { id: "seed_cat_electronics", name: "Điện tử" },
  { id: "seed_cat_fashion", name: "Thời trang" },
  { id: "seed_cat_home", name: "Đời sống" },
  {
    id: "seed_cat_books",
    name: "Sách",
    description: "Sách giấy và sách điện tử",
  },
];

function apiProduct(
  index: number,
  overrides: Partial<ApiProduct> = {},
): ApiProduct {
  return {
    id: `prod-${index}`,
    name: `Sản phẩm số ${index}`,
    minPrice: 100000 * index,
    onSale: false,
    skus: [{ id: `sku-${index}`, price: 100000 * index }],
    ...overrides,
  };
}

const API_PRODUCTS: ApiProduct[] = Array.from({ length: 8 }, (_, i) =>
  apiProduct(i + 1),
);

/** The API as it answers when everything is fine. */
function mockHomeApi() {
  vi.spyOn(catalogService, "getCategories").mockResolvedValue(API_CATEGORIES);
  vi.spyOn(catalogService, "getBestsellers").mockResolvedValue(API_PRODUCTS);
}

describe("HomePage Integration (shell-home)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    localStorage.clear();
    mockHomeApi();
  });

  it("renders Hero Section with title, description, CTAs and featured card (AC-1)", () => {
    renderHomePage();

    expect(
      screen.getByRole("heading", {
        name: "Những món dùng mỗi ngày, giá rõ ràng ngay từ đầu.",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Tai nghe, sạc nhanh, balo, áo thun\. Trả tiền trực tuyến hoặc tiền mặt khi nhận hàng\./i,
      ),
    ).toBeInTheDocument();

    const newLink = screen.getByRole("link", { name: "Xem sản phẩm mới" });
    expect(newLink).toBeInTheDocument();
    expect(newLink).toHaveAttribute("href", "/search?sort=createdAt_desc");

    const saleLink = screen.getByRole("link", { name: "Xem hàng giảm giá" });
    expect(saleLink).toBeInTheDocument();
    expect(saleLink).toHaveAttribute("href", "/search?onSale=true");

    const heroSection = screen.getByRole("region", {
      name: "Những món dùng mỗi ngày, giá rõ ràng ngay từ đầu.",
    });
    expect(
      within(heroSection).getByRole("img", {
        name: "Tai nghe không dây Aero 2 trên nền xanh nhạt (ảnh minh hoạ)",
      }),
    ).toBeInTheDocument();
    expect(within(heroSection).getByText("Giảm 13%")).toBeInTheDocument();
  });

  it("renders Category Section with the categories of the API (AC-2, AC-17)", async () => {
    renderHomePage();

    expect(
      screen.getByRole("heading", { name: "Mua theo nhóm" }),
    ).toBeInTheDocument();
    for (const category of API_CATEGORIES) {
      expect(
        await screen.findByRole("heading", { name: category.name }),
      ).toBeInTheDocument();
    }
  });

  it("each category tile leads to the search page by the id the API gave (AC-17)", async () => {
    renderHomePage();

    for (const category of API_CATEGORIES) {
      const tile = (
        await screen.findByRole("heading", { name: category.name })
      ).closest("a");
      expect(tile).toHaveAttribute("href", `/search?category=${category.id}`);
    }
    // nothing made up: no link by the old fake names
    const hrefs = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));
    for (const fake of ["audio", "tech", "fashion", "lifestyle", "life"]) {
      expect(hrefs).not.toContain(`/search?category=${fake}`);
    }
  });

  it("shows a category description only when the API has one (AC-17)", async () => {
    renderHomePage();

    expect(
      await screen.findByText("Sách giấy và sách điện tử"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Tai nghe, loa Bluetooth"),
    ).not.toBeInTheDocument();
  });

  it("renders Best Sellers Section with the 8 products of the API and the all-products link (AC-3)", async () => {
    renderHomePage();

    expect(
      screen.getByRole("heading", { name: "Bán chạy tuần này" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Xem tất cả sản phẩm" }),
    ).toHaveAttribute("href", "/search");

    for (const product of API_PRODUCTS) {
      expect(
        await screen.findByRole("heading", { name: product.name }),
      ).toBeInTheDocument();
    }
  });

  it("a product card leads to the page of that product (AC-21)", async () => {
    renderHomePage();

    const card = (
      await screen.findByRole("heading", { name: "Sản phẩm số 3" })
    ).closest("a");

    expect(card).toHaveAttribute("href", "/products/prod-3");
  });

  it("a product card has no star, no score and no review count (AC-19)", async () => {
    renderHomePage();
    await screen.findByRole("heading", { name: "Sản phẩm số 1" });

    expect(screen.queryByText(/Đánh giá/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\(\d[\d.,]*\)/)).not.toBeInTheDocument();
    const card = screen
      .getByRole("heading", { name: "Sản phẩm số 1" })
      .closest("li") as HTMLElement;
    expect(card.querySelector("svg")).toBeNull();
    // the price and the add button stay
    expect(within(card).getByText(/100\.000/)).toBeInTheDocument();
    expect(
      within(card).getByRole("button", { name: "Thêm vào giỏ: Sản phẩm số 1" }),
    ).toBeInTheDocument();
  });

  it("a product on sale shows the crossed-out price and the discount from compareAtPrice", async () => {
    vi.spyOn(catalogService, "getBestsellers").mockResolvedValue([
      apiProduct(1, {
        name: "Áo giảm giá",
        minPrice: 3990000,
        onSale: true,
        skus: [{ id: "sku-sale", price: 3990000, compareAtPrice: 4590000 }],
      }),
    ]);

    renderHomePage();

    const card = (
      await screen.findByRole("heading", { name: "Áo giảm giá" })
    ).closest("li") as HTMLElement;
    expect(within(card).getByText("Giảm 13%")).toBeInTheDocument();
    expect(within(card).getByText(/4\.590\.000/)).toBeInTheDocument();
  });

  it("shows skeleton cards while the products load (AC-20)", async () => {
    let resolve!: (value: ApiProduct[]) => void;
    vi.spyOn(catalogService, "getBestsellers").mockReturnValue(
      new Promise<ApiProduct[]>((r) => {
        resolve = r;
      }),
    );

    renderHomePage();

    expect(
      document.querySelectorAll(".animate-pulse").length,
    ).toBeGreaterThanOrEqual(8);
    expect(screen.queryByText("Chưa có sản phẩm nào")).not.toBeInTheDocument();
    resolve([]);
    await screen.findByText("Chưa có sản phẩm nào");
  });

  it("when the API has no products it says so, and shows no sample product (AC-20)", async () => {
    vi.spyOn(catalogService, "getBestsellers").mockResolvedValue([]);

    renderHomePage();

    expect(await screen.findByText("Chưa có sản phẩm nào")).toBeInTheDocument();
    for (const sample of [
      "Sạc nhanh GaN 65W",
      "Áo thun cotton cổ tròn",
      "Balo chống nước 18L",
      "Loa Bluetooth mini",
    ]) {
      expect(screen.queryByText(sample)).not.toBeInTheDocument();
    }
  });

  it("when the API has no categories it says so, and shows no sample category (AC-20)", async () => {
    vi.spyOn(catalogService, "getCategories").mockResolvedValue([]);

    renderHomePage();

    expect(await screen.findByText("Chưa có danh mục nào")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Âm thanh" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Phụ kiện công nghệ" }),
    ).not.toBeInTheDocument();
  });

  it("when the products fail to load it shows an error with a retry that asks again (AC-20)", async () => {
    const user = userEvent.setup();
    const getBestsellers = vi
      .spyOn(catalogService, "getBestsellers")
      .mockRejectedValueOnce(new Error("boom"));

    renderHomePage();

    expect(
      await screen.findByText("Không tải được danh sách sản phẩm."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Sạc nhanh GaN 65W")).not.toBeInTheDocument();

    getBestsellers.mockResolvedValue(API_PRODUCTS);
    await user.click(screen.getByRole("button", { name: "Thử lại" }));

    expect(
      await screen.findByRole("heading", { name: "Sản phẩm số 1" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Không tải được danh sách sản phẩm."),
    ).not.toBeInTheDocument();
  });

  it("when the categories fail to load it shows an error with a retry (AC-20)", async () => {
    const user = userEvent.setup();
    const getCategories = vi
      .spyOn(catalogService, "getCategories")
      .mockRejectedValueOnce(new Error("boom"));

    renderHomePage();
    expect(
      await screen.findByText("Không tải được danh mục."),
    ).toBeInTheDocument();

    getCategories.mockResolvedValue(API_CATEGORIES);
    await user.click(screen.getByRole("button", { name: "Thử lại" }));

    expect(
      await screen.findByRole("heading", { name: "Điện tử" }),
    ).toBeInTheDocument();
  });

  it("renders dynamically fetched products from catalog API", async () => {
    vi.spyOn(catalogService, "getBestsellers").mockResolvedValueOnce([
      {
        id: "api-prod-1",
        name: "Tai nghe chống ồn Pro Max",
        minPrice: 5000000,
        onSale: true,
        skus: [{ id: "sku-api-1", price: 5000000, compareAtPrice: 6000000 }],
      },
    ]);

    renderHomePage();

    expect(
      await screen.findByRole("heading", { name: "Tai nghe chống ồn Pro Max" }),
    ).toBeInTheDocument();
  });

  it("renders Value Propositions with 3 commitments (AC-6)", () => {
    renderHomePage();

    expect(
      screen.getByRole("heading", { name: "Vì sao mua ở đây" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Hàng được giữ khi bạn thanh toán"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Bấm hai lần cũng chỉ trừ tiền một lần"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Huỷ đơn đã trả thì tiền tự quay về"),
    ).toBeInTheDocument();
  });

  it("adds Hero product to cart, dispatches cart:changed event and shows toast (AC-4, AC-5)", async () => {
    const user = userEvent.setup();
    const cartChangedHandler = vi.fn();
    window.addEventListener("cart:changed", cartChangedHandler);

    renderHomePage();

    const heroSection = screen.getByRole("region", {
      name: "Những món dùng mỗi ngày, giá rõ ràng ngay từ đầu.",
    });
    const heroAddBtn = within(heroSection).getByRole("button", {
      name: "Thêm vào giỏ: Tai nghe không dây Aero 2",
    });
    await user.click(heroAddBtn);

    const raw = localStorage.getItem(GUEST_CART_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const cart = JSON.parse(raw!);
    expect(cart).toHaveLength(1);
    expect(cart[0].productName).toBe("Tai nghe không dây Aero 2");
    expect(cart[0].quantity).toBe(1);

    expect(cartChangedHandler).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith(
      "Đã thêm Tai nghe không dây Aero 2 vào giỏ hàng",
      expect.objectContaining({
        action: expect.objectContaining({
          label: "Xem giỏ hàng",
        }),
      }),
    );

    window.removeEventListener("cart:changed", cartChangedHandler);
  });

  it("increments item quantity when added multiple times (AC-4)", async () => {
    const user = userEvent.setup();

    renderHomePage();

    const addButton = await screen.findByRole("button", {
      name: "Thêm vào giỏ: Sản phẩm số 2",
    });

    await user.click(addButton);
    await user.click(addButton);

    const raw = localStorage.getItem(GUEST_CART_STORAGE_KEY);
    const cart = JSON.parse(raw!);
    const item = cart.find((i: { skuId: string }) => i.skuId === "sku-2");
    expect(item).toBeDefined();
    expect(item.quantity).toBe(2);
  });
});
