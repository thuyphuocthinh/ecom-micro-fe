import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route, useLocation } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { api } from "@ecom/api";
import { AuthContext, type AuthContextValue } from "@/features/auth";
import type { UserProfile, Address } from "@/types";
import { AccountLayout } from "@/layouts/AccountLayout.tsx";
import { AddressesPage } from "./AddressesPage.tsx";

const mockUser: UserProfile = {
  id: "u-123",
  email: "customer@example.com",
  displayName: "Nguyễn Văn A",
  role: "CUSTOMER",
  avatarUrl: null,
  hasPassword: true,
  googleLinked: false,
  createdAt: "2026-10-14T08:00:00.000Z",
};

const mockAddressList: Address[] = [
  {
    id: "addr-1",
    recipientName: "Nguyễn Văn A",
    phone: "0901234567",
    provinceCode: "01",
    provinceName: "Thành phố Hà Nội",
    wardCode: "00001",
    wardName: "Phường Phúc Xá",
    street: "Số 123 Đường Láng",
    label: "Nhà riêng",
    isDefault: true,
    createdAt: "2026-10-14T10:00:00.000Z",
    updatedAt: "2026-10-14T10:00:00.000Z",
  },
  {
    id: "addr-2",
    recipientName: "Trần Thị B",
    phone: "0987654321",
    provinceCode: "79",
    provinceName: "Thành phố Hồ Chí Minh",
    wardCode: "26734",
    wardName: "Phường Bến Nghé",
    street: "Số 456 Lê Lợi",
    label: "Văn phòng",
    isDefault: false,
    createdAt: "2026-10-14T10:00:00.000Z",
    updatedAt: "2026-10-14T10:00:00.000Z",
  },
];

function LocationDisplay() {
  const location = useLocation();
  return (
    <div data-testid="location-display">
      {location.pathname + location.search}
    </div>
  );
}

function renderAddressesRoute(
  authStatus: AuthContextValue["status"] = "signedIn",
  initialPath = "/account/addresses",
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
              <Route path="addresses" element={<AddressesPage />} />
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

describe("AddressesPage (AC-1, AC-2, AC-3, AC-4, AC-10, AC-11)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects guest to /login?returnTo=/account/addresses (AC-1)", () => {
    renderAddressesRoute("guest");

    expect(screen.getByText("Trang đăng nhập")).toBeInTheDocument();
    expect(screen.getByTestId("location-display")).toHaveTextContent(
      "/login?returnTo=%2Faccount%2Faddresses",
    );
  });

  it("renders AccountNav with active 'Sổ địa chỉ', counter and address cards (AC-1, AC-2)", async () => {
    vi.spyOn(api, "get").mockImplementation(async (url: string) => {
      if (url === "/users/me/addresses") {
        return { data: mockAddressList } as never;
      }
      return { data: [] } as never;
    });

    renderAddressesRoute("signedIn");

    // Nav link should be active
    const navLink = screen.getByRole("link", { name: "Sổ địa chỉ" });
    expect(navLink).toHaveAttribute("aria-current", "page");

    // Header and counter
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: "Sổ địa chỉ" }),
      ).toBeInTheDocument();
      expect(screen.getByText("Đã lưu 2/10 địa chỉ")).toBeInTheDocument();
    });

    // Address cards
    expect(screen.getByText("Nhà riêng")).toBeInTheDocument();
    expect(screen.getByText("Văn phòng")).toBeInTheDocument();
    expect(screen.getByText("Mặc định")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Thêm địa chỉ mới" }),
    ).toBeInTheDocument();
  });

  it("renders Empty State when address list is empty and opens form on click (AC-3, AC-5)", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "get").mockImplementation(async (url: string) => {
      if (url === "/users/me/addresses") {
        return { data: [] } as never;
      }
      if (url === "/locations/provinces") {
        return { data: [] } as never;
      }
      return { data: [] } as never;
    });

    renderAddressesRoute("signedIn");

    await waitFor(() => {
      expect(screen.getByText("Bạn chưa lưu địa chỉ nào")).toBeInTheDocument();
      expect(screen.getByText("Đã lưu 0/10 địa chỉ")).toBeInTheDocument();
    });

    const addFirstBtn = screen.getByRole("button", {
      name: "Thêm địa chỉ đầu tiên",
    });
    await user.click(addFirstBtn);

    expect(
      screen.getByRole("heading", { level: 2, name: "Địa chỉ mới" }),
    ).toBeInTheDocument();
  });

  it("disables adding and displays limit message when 10 addresses exist (AC-4)", async () => {
    const tenAddresses: Address[] = Array.from({ length: 10 }, (_, i) => ({
      ...mockAddressList[0]!,
      id: `addr-${i + 1}`,
      label: `Địa chỉ ${i + 1}`,
      isDefault: i === 0,
    }));

    vi.spyOn(api, "get").mockImplementation(async (url: string) => {
      if (url === "/users/me/addresses") {
        return { data: tenAddresses } as never;
      }
      return { data: [] } as never;
    });

    renderAddressesRoute("signedIn");

    await waitFor(() => {
      expect(screen.getByText("Đã lưu 10/10 địa chỉ")).toBeInTheDocument();
      expect(
        screen.getByText("Đã đạt giới hạn tối đa 10 địa chỉ"),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Thêm địa chỉ mới" }),
      ).not.toBeInTheDocument();
    });
  });

  it("sets address as default when 'Đặt làm mặc định' is clicked (AC-10)", async () => {
    const user = userEvent.setup();
    const putSpy = vi
      .spyOn(api, "put")
      .mockResolvedValueOnce({ data: {} } as never);

    vi.spyOn(api, "get").mockImplementation(async (url: string) => {
      if (url === "/users/me/addresses") {
        return { data: mockAddressList } as never;
      }
      return { data: [] } as never;
    });

    renderAddressesRoute("signedIn");

    await waitFor(() => {
      expect(screen.getByText("Văn phòng")).toBeInTheDocument();
    });

    const setDefaultBtn = screen.getByRole("button", {
      name: /đặt văn phòng làm mặc định/i,
    });
    await user.click(setDefaultBtn);

    await waitFor(() => {
      expect(putSpy).toHaveBeenCalledWith("/users/me/addresses/{id}/default", {
        params: { id: "addr-2" },
      });
    });
  });

  it("opens DeleteAddressModal on delete click and calls DELETE endpoint on confirmation (AC-11)", async () => {
    const user = userEvent.setup();
    const deleteSpy = vi
      .spyOn(api, "delete")
      .mockResolvedValueOnce({ data: {} } as never);

    vi.spyOn(api, "get").mockImplementation(async (url: string) => {
      if (url === "/users/me/addresses") {
        return { data: mockAddressList } as never;
      }
      return { data: [] } as never;
    });

    renderAddressesRoute("signedIn");

    await waitFor(() => {
      expect(screen.getByText("Nhà riêng")).toBeInTheDocument();
    });

    const deleteBtn = screen.getByRole("button", {
      name: "Xoá địa chỉ Nhà riêng",
    });
    await user.click(deleteBtn);

    // Modal should appear
    expect(screen.getByText("Xóa địa chỉ nhận hàng?")).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", { name: "Xóa địa chỉ" });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith("/users/me/addresses/{id}", {
        params: { id: "addr-1" },
      });
    });
  });
});
