import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContext, type AuthContextValue } from "@/features/auth";
import type { UserProfile } from "@/types";
import { AccountLayout } from "@/layouts/AccountLayout.tsx";
import { ProfilePage } from "./ProfilePage.tsx";

const mockUser: UserProfile = {
  id: "u-123",
  email: "nguyenvana@example.com",
  displayName: "Nguyễn Văn A",
  role: "CUSTOMER",
  avatarUrl: null,
  hasPassword: true,
  googleLinked: false,
  createdAt: "2026-10-14T08:00:00.000Z",
};

function LocationDisplay() {
  const location = useLocation();
  return (
    <div data-testid="location-display">
      {location.pathname + location.search}
    </div>
  );
}

function renderProfileRoute(
  authStatus: AuthContextValue["status"] = "signedIn",
  initialPath = "/account/profile",
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const authValue: AuthContextValue = {
    status: authStatus,
    user: authStatus === "signedIn" ? mockUser : null,
    cartCount: 0,
    login: vi.fn(),
    logout: vi.fn(),
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route path="/account" element={<AccountLayout />}>
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            <Route
              path="/login"
              element={
                <div>
                  <h1>Trang đăng nhập</h1>
                  <LocationDisplay />
                </div>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

describe("ProfilePage & AccountLayout (AC-1, AC-2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects guest user to /login?returnTo=%2Faccount%2Fprofile (AC-1)", () => {
    renderProfileRoute("guest");

    expect(screen.getByText("Trang đăng nhập")).toBeInTheDocument();
    expect(screen.getByTestId("location-display")).toHaveTextContent(
      "/login?returnTo=%2Faccount%2Fprofile",
    );
    expect(screen.queryByText("Hồ sơ của tôi")).toBeNull();
  });

  it("renders loading indicator while session is checking", () => {
    renderProfileRoute("checking");

    expect(screen.getByTestId("auth-loading")).toBeInTheDocument();
    expect(screen.queryByText("Hồ sơ của tôi")).toBeNull();
  });

  it("renders AccountLayout with AccountNav and ProfilePage sections when signed in (AC-1, AC-2)", () => {
    renderProfileRoute("signedIn");

    // AccountNav sidebar elements
    const nav = screen.getByRole("navigation", { name: "Tài khoản" });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Hồ sơ của tôi/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("link", { name: /Đơn hàng của tôi/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Sổ địa chỉ/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Đăng xuất/ }),
    ).toBeInTheDocument();

    // Main page title
    expect(
      screen.getByRole("heading", { name: "Hồ sơ của tôi", level: 1 }),
    ).toBeInTheDocument();

    // 3 Cards: Thông tin cá nhân, Đổi mật khẩu, Thiết bị đã đăng nhập
    expect(
      screen.getByRole("heading", { name: "Thông tin cá nhân", level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Đổi mật khẩu", level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Thiết bị đã đăng nhập", level: 2 }),
    ).toBeInTheDocument();
  });
});
