import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { catalogService } from "@/services/catalog.service.ts";
import { CategoryNav } from "./CategoryNav.tsx";
import { CategorySection } from "@/features/home/components/CategorySection.tsx";

const ROOTS = [
  { id: "seed_cat_electronics", name: "Điện tử" },
  { id: "seed_cat_fashion", name: "Thời trang" },
];

function renderNav(
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  }),
) {
  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CategoryNav />
        </MemoryRouter>
      </QueryClientProvider>,
    ),
  };
}

const hrefOf = (name: string) =>
  screen.getByRole("link", { name }).getAttribute("href");

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("the category row of the header (AC-15, AC-16)", () => {
  it("has the two fixed links, with the right addresses", async () => {
    vi.spyOn(catalogService, "getCategories").mockResolvedValue([]);

    renderNav();

    expect(hrefOf("Tất cả sản phẩm")).toBe("/search");
    expect(hrefOf("Đang giảm giá")).toBe("/search?onSale=true");
  });

  it("the sale link filters by onSale, the name the search page reads (AC-16)", () => {
    vi.spyOn(catalogService, "getCategories").mockResolvedValue([]);

    renderNav();

    const url = new URL(hrefOf("Đang giảm giá")!, "http://localhost");
    expect(url.searchParams.get("onSale")).toBe("true");
    expect(url.searchParams.has("sale")).toBe(false);
  });

  it("shows the root categories of the API between them, each linking by id", async () => {
    vi.spyOn(catalogService, "getCategories").mockResolvedValue(ROOTS);

    renderNav();

    expect(
      await screen.findByRole("link", { name: "Điện tử" }),
    ).toHaveAttribute("href", "/search?category=seed_cat_electronics");
    expect(hrefOf("Thời trang")).toBe("/search?category=seed_cat_fashion");
    const names = screen.getAllByRole("link").map((link) => link.textContent);
    expect(names).toEqual([
      "Tất cả sản phẩm",
      "Điện tử",
      "Thời trang",
      "Đang giảm giá",
    ]);
  });

  it("has none of the old made-up category links", async () => {
    vi.spyOn(catalogService, "getCategories").mockResolvedValue(ROOTS);

    renderNav();
    await screen.findByRole("link", { name: "Điện tử" });

    const hrefs = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));
    for (const fake of ["audio", "tech", "fashion", "lifestyle"]) {
      expect(hrefs).not.toContain(`/search?category=${fake}`);
    }
    expect(
      screen.queryByRole("link", { name: "Âm thanh" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Phụ kiện công nghệ" }),
    ).not.toBeInTheDocument();
  });

  it("while the categories load, only the two fixed links show (no made-up link)", () => {
    vi.spyOn(catalogService, "getCategories").mockReturnValue(
      new Promise(() => undefined),
    );

    renderNav();

    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("when the API fails, only the two fixed links stay", async () => {
    const getCategories = vi
      .spyOn(catalogService, "getCategories")
      .mockRejectedValue(new Error("boom"));

    renderNav();
    await waitFor(() => expect(getCategories).toHaveBeenCalled());

    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("an id with special characters stays one value in the link", async () => {
    vi.spyOn(catalogService, "getCategories").mockResolvedValue([
      { id: "a&b c", name: "Lạ" },
    ]);

    renderNav();

    expect(await screen.findByRole("link", { name: "Lạ" })).toHaveAttribute(
      "href",
      "/search?category=a%26b%20c",
    );
  });

  it("is one nav landmark named Danh mục", () => {
    vi.spyOn(catalogService, "getCategories").mockResolvedValue([]);

    renderNav();

    expect(
      screen.getByRole("navigation", { name: "Danh mục" }),
    ).toBeInTheDocument();
  });
});

describe("the header and the home page share the categories (AC-15)", () => {
  it("both on one page ask the API once", async () => {
    const getCategories = vi
      .spyOn(catalogService, "getCategories")
      .mockResolvedValue(ROOTS);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CategoryNav />
          <CategorySection />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByRole("heading", { name: "Điện tử" });
    await screen.findAllByRole("link", { name: /Điện tử/ });

    expect(getCategories).toHaveBeenCalledTimes(1);
  });

  it("a second visit inside ten minutes does not ask again", async () => {
    const getCategories = vi
      .spyOn(catalogService, "getCategories")
      .mockResolvedValue(ROOTS);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const first = renderNav(queryClient);
    await screen.findByRole("link", { name: "Điện tử" });
    first.unmount();
    renderNav(queryClient);
    await screen.findByRole("link", { name: "Điện tử" });

    expect(getCategories).toHaveBeenCalledTimes(1);
  });
});
