import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { Header } from "./Header.tsx";
import {
  AuthContext,
  type AuthContextValue,
} from "../features/auth/auth-context.ts";

function renderHeader(authValue: Partial<AuthContextValue>) {
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
      <MemoryRouter>
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

  it("shows user name, avatar, orders link, and logout button when signed in (AC-20)", () => {
    renderHeader({
      status: "signedIn",
      user: {
        id: "u-1",
        displayName: "Nguyễn Văn A",
        email: "a@ecom.vn",
        role: "CUSTOMER",
      },
    });

    expect(screen.getByText("Đơn hàng")).toBeInTheDocument();
    expect(screen.getByText("Nguyễn Văn A")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument(); // Initial avatar
    expect(screen.getByText("Đăng xuất")).toBeInTheDocument();
    expect(screen.queryByText("Đăng nhập")).not.toBeInTheDocument();
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
});
