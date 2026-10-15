import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import { HomePage } from "@/pages/HomePage.tsx";
import { GUEST_CART_STORAGE_KEY } from "@/utils/cart.ts";
import { catalogService, type ApiProduct } from "@/services/catalog.service.ts";

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

describe("HomePage Integration (shell-home)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
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

  it("renders Category Section with 4 category cards (AC-2)", () => {
    renderHomePage();

    expect(
      screen.getByRole("heading", { name: "Mua theo nhóm" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Âm thanh" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Phụ kiện công nghệ" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Thời trang" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Đời sống" }),
    ).toBeInTheDocument();

    const audioLink = screen.getByRole("link", {
      name: /Âm thanh Tai nghe, loa Bluetooth/i,
    });
    expect(audioLink).toHaveAttribute("href", "/search?category=audio");
  });

  it("renders Best Sellers Section with 8 products and 'Xem tất cả sản phẩm' link (AC-3)", () => {
    renderHomePage();

    expect(
      screen.getByRole("heading", { name: "Bán chạy tuần này" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Xem tất cả sản phẩm" }),
    ).toHaveAttribute("href", "/search");

    expect(
      screen.getByRole("heading", { name: "Sạc nhanh GaN 65W" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Áo thun cotton cổ tròn" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Balo chống nước 18L" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Bình giữ nhiệt 500 ml" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Đèn bàn LED cảm ứng" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Loa Bluetooth mini" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Bàn phím cơ không dây" }),
    ).toBeInTheDocument();
  });

  it("renders dynamically fetched products from catalog API", async () => {
    const mockProducts: ApiProduct[] = [
      {
        id: "api-prod-1",
        name: "Tai nghe chống ồn Pro Max",
        minPrice: 5000000,
        onSale: true,
        rating: 5.0,
        reviewsCount: 99,
        skus: [{ id: "sku-api-1", price: 5000000, originalPrice: 6000000 }],
      },
    ];

    vi.spyOn(catalogService, "getBestsellers").mockResolvedValueOnce(
      mockProducts,
    );

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

    const ganButton = screen.getByRole("button", {
      name: "Thêm vào giỏ: Sạc nhanh GaN 65W",
    });

    await user.click(ganButton);
    await user.click(ganButton);

    const raw = localStorage.getItem(GUEST_CART_STORAGE_KEY);
    const cart = JSON.parse(raw!);
    const ganItem = cart.find(
      (i: { skuId: string }) => i.skuId === "sku-gan-65w",
    );
    expect(ganItem).toBeDefined();
    expect(ganItem.quantity).toBe(2);
  });
});
