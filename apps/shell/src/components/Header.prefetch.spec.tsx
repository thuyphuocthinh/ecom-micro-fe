import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContext } from "@/features/auth/auth-context.ts";
import { catalogService } from "@/services/catalog.service.ts";
import { Header } from "./Header.tsx";

// What the real loaders do is tested in libs/remote-loaders.spec.ts; here: which page each element asks for
const prefetched = vi.hoisted(() => vi.fn());
vi.mock("@/libs/remote-loaders.ts", () => ({
  prefetchOnIntent: (path: string) => ({
    onMouseEnter: () => prefetched(path),
    onFocus: () => prefetched(path),
  }),
}));

function renderHeader() {
  vi.spyOn(catalogService, "getCategories").mockResolvedValue([
    { id: "seed_cat_electronics", name: "Điện tử" },
  ]);
  return render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <AuthContext.Provider
        value={{
          status: "guest",
          user: null,
          cartCount: 0,
          login: vi.fn(),
          logout: vi.fn(),
        }}
      >
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
  prefetched.mockClear();
});

describe("the header asks for the next page ahead when the customer shows intent (AC-13)", () => {
  it("asks for nothing just by being on the page", () => {
    renderHeader();

    expect(prefetched).not.toHaveBeenCalled();
  });

  it("the mouse over the cart link asks for the cart page", async () => {
    renderHeader();

    await userEvent.hover(screen.getByRole("link", { name: /Giỏ hàng/ }));

    expect(prefetched).toHaveBeenCalledWith("/cart");
  });

  it("the keyboard focus on the cart link asks for it too", () => {
    renderHeader();

    fireEvent.focus(screen.getByRole("link", { name: /Giỏ hàng/ }));

    expect(prefetched).toHaveBeenCalledWith("/cart");
  });

  it("the mouse over the search button asks for the search page", async () => {
    renderHeader();

    await userEvent.hover(screen.getByRole("button", { name: "Tìm kiếm" }));

    expect(prefetched).toHaveBeenCalledWith("/search");
  });

  it("the links of the category row ask for the search page", async () => {
    renderHeader();

    await userEvent.hover(await screen.findByRole("link", { name: "Điện tử" }));
    await userEvent.hover(screen.getByRole("link", { name: "Đang giảm giá" }));

    expect(prefetched).toHaveBeenCalledWith("/search");
  });
});
