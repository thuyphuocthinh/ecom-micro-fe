import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, session } from "@ecom/api";
import { AuthProvider, useAuth } from "./index.ts";

vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function Consumer() {
  const { status, user, cartCount, logout } = useAuth();
  return (
    <div>
      <div data-testid="status">{status}</div>
      <div data-testid="user">{user ? user.displayName : "none"}</div>
      <div data-testid="cart">{cartCount}</div>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

function renderWithProviders() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe("AuthProvider (AC-18, AC-19, AC-22, AC-23, AC-27)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    session.clear();
  });

  it("initializes as guest when no token is present", () => {
    renderWithProviders();
    expect(screen.getByTestId("status")).toHaveTextContent("guest");
    expect(screen.getByTestId("user")).toHaveTextContent("none");
  });

  it("restores session and loads user when token exists (AC-18)", async () => {
    session.set({ accessToken: "access-123", refreshToken: "refresh-123" });
    vi.spyOn(api, "get").mockResolvedValueOnce({
      data: {
        id: "u-1",
        displayName: "Nguyễn Văn A",
        email: "a@ecom.vn",
        role: "CUSTOMER",
      },
    } as never);

    renderWithProviders();
    expect(screen.getByTestId("status")).toHaveTextContent("checking");

    await screen.findByText("Nguyễn Văn A");
    expect(screen.getByTestId("status")).toHaveTextContent("signedIn");
  });

  it("clears session and transitions to guest without toast on restore failure (AC-19)", async () => {
    session.set({ accessToken: "invalid", refreshToken: "invalid" });
    vi.spyOn(api, "get").mockRejectedValueOnce(new Error("Unauthorized"));

    renderWithProviders();
    expect(screen.getByTestId("status")).toHaveTextContent("checking");

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(screen.getByTestId("status")).toHaveTextContent("guest");
    expect(session.getAccessToken()).toBeNull();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("handles logout by clearing tokens, user, and transitioning to guest (AC-22)", async () => {
    session.set({ accessToken: "access-123", refreshToken: "refresh-123" });
    vi.spyOn(api, "get").mockResolvedValueOnce({
      data: {
        id: "u-1",
        displayName: "Nguyễn Văn A",
        email: "a@ecom.vn",
        role: "CUSTOMER",
      },
    } as never);
    vi.spyOn(api, "post").mockResolvedValueOnce({ data: null } as never);

    renderWithProviders();
    await screen.findByText("Nguyễn Văn A");

    await act(async () => {
      screen.getByText("Logout").click();
    });

    expect(screen.getByTestId("status")).toHaveTextContent("guest");
    expect(session.getAccessToken()).toBeNull();
  });

  it("notifies when session expires and shows info toast (AC-23)", async () => {
    session.set({ accessToken: "access-123", refreshToken: "refresh-123" });
    vi.spyOn(api, "get").mockResolvedValueOnce({
      data: {
        id: "u-1",
        displayName: "Nguyễn Văn A",
        email: "a@ecom.vn",
        role: "CUSTOMER",
      },
    } as never);

    renderWithProviders();
    await screen.findByText("Nguyễn Văn A");

    act(() => {
      session.notifyExpired();
    });

    expect(screen.getByTestId("status")).toHaveTextContent("guest");
    expect(toast.info).toHaveBeenCalledWith(
      "Phiên đăng nhập đã hết hạn, hãy đăng nhập lại.",
    );
  });

  it("syncs login/logout across tabs via storage event (AC-27)", async () => {
    renderWithProviders();
    expect(screen.getByTestId("status")).toHaveTextContent("guest");

    session.set({ accessToken: "new-token", refreshToken: "new-refresh" });
    vi.spyOn(api, "get").mockResolvedValueOnce({
      data: {
        id: "u-2",
        displayName: "Trần Thị B",
        email: "b@ecom.vn",
        role: "CUSTOMER",
      },
    } as never);

    await act(async () => {
      window.dispatchEvent(
        new StorageEvent("storage", { key: "ecom.accessToken" }),
      );
    });

    await screen.findByText("Trần Thị B");
    expect(screen.getByTestId("status")).toHaveTextContent("signedIn");
  });
});
