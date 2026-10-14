import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { api } from "@ecom/api";
import { LoginForm } from "./LoginForm.tsx";
import { AuthContext, type AuthContextValue } from "./auth-context.ts";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockLogin = vi.fn();

function renderLoginForm(initialEntry = "/login") {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const fullValue: AuthContextValue = {
    status: "guest",
    user: null,
    cartCount: 0,
    login: mockLogin,
    logout: vi.fn(),
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={fullValue}>
        <MemoryRouter initialEntries={[initialEntry]}>
          <LoginForm />
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

describe("LoginForm (AC-1, AC-2, AC-3, AC-4, AC-7, AC-8)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits valid credentials and calls login (AC-1)", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "post").mockResolvedValueOnce({
      data: { accessToken: "at-123", refreshToken: "rt-123" },
    } as never);

    renderLoginForm();

    await user.type(screen.getByLabelText("Email"), "customer@ecom.vn");
    await user.type(screen.getByLabelText("Mật khẩu"), "password123");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/login", {
        body: {
          email: "customer@ecom.vn",
          password: "password123",
        },
      });
      expect(mockLogin).toHaveBeenCalledWith({
        accessToken: "at-123",
        refreshToken: "rt-123",
      });
    });
  });

  it("validates on blur (onTouched) and clears error on change (AC-2)", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const emailInput = screen.getByLabelText("Email");

    // Typing initially: no error
    await user.type(emailInput, "invalid");
    expect(
      screen.queryByText("Email chưa đúng dạng, ví dụ ban@vi-du.com."),
    ).not.toBeInTheDocument();

    // Blur triggers validation
    await user.tab();
    expect(
      screen.getByText("Email chưa đúng dạng, ví dụ ban@vi-du.com."),
    ).toBeInTheDocument();

    // Fixing clears error immediately
    await user.type(emailInput, "@example.com");
    expect(
      screen.queryByText("Email chưa đúng dạng, ví dụ ban@vi-du.com."),
    ).not.toBeInTheDocument();
  });

  it("focuses first invalid field on empty submit without calling api (AC-3)", async () => {
    const user = userEvent.setup();
    const postSpy = vi.spyOn(api, "post");

    renderLoginForm();

    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    expect(postSpy).not.toHaveBeenCalled();
    expect(screen.getByText("Nhập email của bạn.")).toBeInTheDocument();
    expect(screen.getByText("Nhập mật khẩu.")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveFocus();
  });

  it("preserves inputs on backend error and does not render backend error in field (AC-4)", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "post").mockRejectedValueOnce(new Error("AUTH-001"));

    renderLoginForm();

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Mật khẩu");

    await user.type(emailInput, "customer@ecom.vn");
    await user.type(passwordInput, "wrongpassword");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    });

    // Inputs are preserved
    expect(emailInput).toHaveValue("customer@ecom.vn");
    expect(passwordInput).toHaveValue("wrongpassword");
    // No backend error in fields
    expect(screen.queryByText("AUTH-001")).not.toBeInTheDocument();
  });

  it("toggles password visibility when eye icon is clicked (AC-8)", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const passwordInput = screen.getByLabelText("Mật khẩu");
    const toggleButton = screen.getByRole("button", { name: "Hiện mật khẩu" });

    expect(passwordInput).toHaveAttribute("type", "password");

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");
    expect(
      screen.getByRole("button", { name: "Ẩn mật khẩu" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ẩn mật khẩu" }));
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("renders forgot password link leading to /forgot-password (AC-29)", () => {
    renderLoginForm("/login?returnTo=%2Fcheckout");
    const link = screen.getByRole("link", { name: "Quên mật khẩu?" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "href",
      "/forgot-password?returnTo=%2Fcheckout",
    );
  });
});
