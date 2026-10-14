import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { Header } from "./Header.tsx";
import {
  AuthContext,
  type AuthContextValue,
} from "@/features/auth/auth-context.ts";

function renderHeader(authValue: Partial<AuthContextValue>, initialUrl = "/") {
  const fullValue: AuthContextValue = {
    status: "guest",
    user: null,
    cartCount: 0,
    login: vi.fn(),
    logout: vi.fn(),
    ...authValue,
  };

  return render(
    <AuthContext.Provider value={fullValue}>
      <MemoryRouter initialEntries={[initialUrl]}>
        <Header />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe("Header (AC-18, AC-20, AC-21)", () => {
  it("shows skeleton loader while checking session (AC-18)", () => {
    renderHeader({ status: "checking" });
    expect(screen.getByTestId("auth-skeleton")).toBeInTheDocument();
    expect(screen.queryByText("Đăng nhập")).not.toBeInTheDocument();
    expect(screen.queryByText("Đơn hàng")).not.toBeInTheDocument();
  });

  it("shows login link when guest (AC-20)", () => {
    renderHeader({ status: "guest" });
    expect(screen.getByText("Đăng nhập")).toBeInTheDocument();
    expect(screen.queryByText("Đơn hàng")).not.toBeInTheDocument();
  });

  it("shows user name, avatar, and opens dropdown with profile, orders, addresses, and logout (AC-20)", async () => {
    const user = userEvent.setup();
    const logout = vi.fn();
    renderHeader({
      status: "signedIn",
      user: {
        id: "u-1",
        displayName: "Nguyễn Văn A",
        email: "a@ecom.vn",
        role: "CUSTOMER",
      },
      logout,
    });

    expect(screen.getByText("Nguyễn Văn A")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument(); // Initial avatar
    expect(screen.queryByText("Đăng nhập")).not.toBeInTheDocument();

    // Menu should be closed initially
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    // Open dropdown menu
    const accountBtn = screen.getByRole("button", {
      name: /tài khoản của nguyễn văn a/i,
    });
    await user.click(accountBtn);

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByText("Hồ sơ của tôi")).toBeInTheDocument();
    expect(screen.getByText("Đơn hàng của tôi")).toBeInTheDocument();
    expect(screen.queryByText("Sổ địa chỉ")).not.toBeInTheDocument();
    expect(screen.getByText("Đăng xuất")).toBeInTheDocument();

    // Click logout calls logout
    await user.click(screen.getByText("Đăng xuất"));
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it("renders user avatar image when avatarUrl is provided", () => {
    renderHeader({
      status: "signedIn",
      user: {
        id: "u-1",
        displayName: "Nguyễn Văn A",
        email: "a@ecom.vn",
        role: "CUSTOMER",
        avatarUrl: "https://example.com/avatar.jpg",
      },
    });

    const img = screen.getByRole("img", { name: "Nguyễn Văn A" });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/avatar.jpg");
    expect(screen.queryByText("A")).not.toBeInTheDocument();
  });

  it("shows cart badge when signed in and cart has items (AC-21)", () => {
    renderHeader({
      status: "signedIn",
      cartCount: 3,
    });

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByLabelText("Giỏ hàng, 3 sản phẩm")).toBeInTheDocument();
  });

  it("hides cart badge when cartCount is 0 or user is guest (AC-21)", () => {
    const { rerender } = renderHeader({ status: "signedIn", cartCount: 0 });
    expect(screen.queryByText("0")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Giỏ hàng, đang trống")).toBeInTheDocument();

    rerender(
      <AuthContext.Provider
        value={{
          status: "guest",
          user: null,
          cartCount: 3,
          login: vi.fn(),
          logout: vi.fn(),
        }}
      >
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </AuthContext.Provider>,
    );
    expect(screen.queryByText("3")).not.toBeInTheDocument();
  });

  it("synchronizes search input with url search parameter q when on /search", () => {
    renderHeader({}, "/search?q=m%C3%A1y%20t%C3%ADnh");
    const input = screen.getByRole("searchbox", { name: "Tìm sản phẩm" });
    expect(input).toHaveValue("máy tính");
  });

  it("leaves search input empty when not on /search even if q parameter is present", () => {
    renderHeader({}, "/?q=máy tính");
    const input = screen.getByRole("searchbox", { name: "Tìm sản phẩm" });
    expect(input).toHaveValue("");
  });
});
