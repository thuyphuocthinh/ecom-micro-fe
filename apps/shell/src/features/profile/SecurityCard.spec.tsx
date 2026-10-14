import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { api, ApiError } from "@ecom/api";
import { toast } from "sonner";
import { AuthContext, type AuthContextValue } from "@/features/auth";
import type { UserProfile } from "@/types";
import { SecurityCard } from "./SecurityCard.tsx";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const mockUser: UserProfile = {
  id: "u-1",
  email: "customer@example.com",
  displayName: "Nguyễn Văn A",
  role: "CUSTOMER",
  avatarUrl: null,
  hasPassword: true,
  googleLinked: false,
  createdAt: "2026-10-14T10:00:00.000Z",
};

function renderSecurityCard(userOverride?: Partial<UserProfile>) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const authValue: AuthContextValue = {
    status: "signedIn",
    user: { ...mockUser, ...userOverride },
    cartCount: 0,
    login: vi.fn(),
    logout: vi.fn(),
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authValue}>
        <SecurityCard />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

describe("SecurityCard (AC-6, AC-7, AC-8)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Google security notice and hides password form when hasPassword is false (AC-6)", () => {
    renderSecurityCard({ hasPassword: false, googleLinked: true });

    expect(screen.getByText("Đổi mật khẩu")).toBeInTheDocument();
    expect(
      screen.getByText("Tài khoản bảo mật qua Google"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Tài khoản của bạn được liên kết và đăng nhập an toàn qua Google/,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Mật khẩu hiện tại")).toBeNull();
    expect(screen.queryByRole("button", { name: "Đổi mật khẩu" })).toBeNull();
  });

  it("renders password change form when hasPassword is true (AC-6)", () => {
    renderSecurityCard({ hasPassword: true });

    expect(screen.getByLabelText("Mật khẩu hiện tại")).toBeInTheDocument();
    expect(screen.getByLabelText("Mật khẩu mới")).toBeInTheDocument();
    expect(screen.getByLabelText("Xác nhận mật khẩu mới")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Đổi mật khẩu" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Tài khoản bảo mật qua Google")).toBeNull();
  });

  it("validates that new password cannot be the same as current password (AC-7)", async () => {
    const user = userEvent.setup();
    renderSecurityCard({ hasPassword: true });

    await user.type(screen.getByLabelText("Mật khẩu hiện tại"), "Password123!");
    await user.type(screen.getByLabelText("Mật khẩu mới"), "Password123!");
    await user.type(
      screen.getByLabelText("Xác nhận mật khẩu mới"),
      "Password123!",
    );
    await user.click(screen.getByRole("button", { name: "Đổi mật khẩu" }));

    await waitFor(() => {
      expect(
        screen.getByText("Mật khẩu mới không được trùng với mật khẩu hiện tại"),
      ).toBeInTheDocument();
    });
  });

  it("validates that confirm password matches new password (AC-7)", async () => {
    const user = userEvent.setup();
    renderSecurityCard({ hasPassword: true });

    await user.type(
      screen.getByLabelText("Mật khẩu hiện tại"),
      "OldPassword123!",
    );
    await user.type(screen.getByLabelText("Mật khẩu mới"), "NewPassword456!");
    await user.type(
      screen.getByLabelText("Xác nhận mật khẩu mới"),
      "WrongPassword789!",
    );
    await user.click(screen.getByRole("button", { name: "Đổi mật khẩu" }));

    await waitFor(() => {
      expect(
        screen.getByText("Mật khẩu xác nhận không khớp"),
      ).toBeInTheDocument();
    });
  });

  it("submits POST /auth/change-password on valid data and clears inputs on success (AC-7)", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "post").mockResolvedValueOnce({
      data: null,
      statusCode: 204,
      message: "Success",
    } as never);

    renderSecurityCard({ hasPassword: true });

    const curInput = screen.getByLabelText("Mật khẩu hiện tại");
    const newInput = screen.getByLabelText("Mật khẩu mới");
    const confirmInput = screen.getByLabelText("Xác nhận mật khẩu mới");

    await user.type(curInput, "OldPassword123!");
    await user.type(newInput, "NewPassword456!");
    await user.type(confirmInput, "NewPassword456!");

    await user.click(screen.getByRole("button", { name: "Đổi mật khẩu" }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/change-password", {
        body: {
          currentPassword: "OldPassword123!",
          newPassword: "NewPassword456!",
        },
      });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Đã đổi mật khẩu. Các thiết bị khác sẽ phải đăng nhập lại.",
      );
    });

    // Form inputs should be reset to empty
    expect(curInput).toHaveValue("");
    expect(newInput).toHaveValue("");
    expect(confirmInput).toHaveValue("");
  });

  it("preserves input values on backend error (AC-8)", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "post").mockRejectedValueOnce(
      new ApiError({
        status: 400,
        code: "AUTH-012",
        message: "Mật khẩu hiện tại không chính xác.",
      }),
    );

    renderSecurityCard({ hasPassword: true });

    const curInput = screen.getByLabelText("Mật khẩu hiện tại");
    const newInput = screen.getByLabelText("Mật khẩu mới");
    const confirmInput = screen.getByLabelText("Xác nhận mật khẩu mới");

    await user.type(curInput, "WrongOldPassword123!");
    await user.type(newInput, "NewPassword456!");
    await user.type(confirmInput, "NewPassword456!");

    await user.click(screen.getByRole("button", { name: "Đổi mật khẩu" }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    });

    // Inputs should still preserve values so user can fix current password without re-typing
    expect(curInput).toHaveValue("WrongOldPassword123!");
    expect(newInput).toHaveValue("NewPassword456!");
    expect(confirmInput).toHaveValue("NewPassword456!");
  });
});
