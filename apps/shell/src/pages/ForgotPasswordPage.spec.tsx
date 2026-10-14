import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { toast } from "sonner";
import { api, ApiError } from "@ecom/api";
import { ForgotPasswordPage } from "./ForgotPasswordPage.tsx";
import {
  AuthContext,
  type AuthContextValue,
} from "@/features/auth/auth-context.ts";
import { savePendingPasswordReset } from "@/utils/pending-password-reset.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function renderForgotPasswordPage() {
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
    login: vi.fn(),
    logout: vi.fn(),
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={fullValue}>
        <MemoryRouter>
          <ForgotPasswordPage />
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

describe("ForgotPasswordPage flow (AC-29, AC-30, AC-31, AC-32, AC-33, AC-34, AC-35)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it("transitions from step 1 to step 2 upon successful forgot-password request (AC-30)", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "post").mockResolvedValueOnce({
      data: {
        resendAvailableInSeconds: 300,
      },
    } as never);

    renderForgotPasswordPage();

    expect(
      screen.getByRole("heading", { name: "Quên mật khẩu" }),
    ).toBeInTheDocument();

    const emailInput = screen.getByLabelText("Email");
    await user.type(emailInput, "user@ecom.vn");
    await user.click(screen.getByRole("button", { name: "Gửi mã xác nhận" }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/forgot-password", {
        body: {
          email: "user@ecom.vn",
        },
      });
    });

    // Step 2 is shown
    expect(
      await screen.findByRole("heading", { name: "Đặt lại mật khẩu" }),
    ).toBeInTheDocument();
    expect(screen.getByText("user@ecom.vn")).toBeInTheDocument();
    expect(screen.getByLabelText("Mã xác minh 6 chữ số")).toBeInTheDocument();
    expect(screen.getByLabelText("Mật khẩu mới")).toBeInTheDocument();
  });

  it("submits 6-digit code and new password in step 2 and navigates to login on success (AC-31, AC-33)", async () => {
    const user = userEvent.setup();

    vi.spyOn(api, "post")
      .mockResolvedValueOnce({
        data: { resendAvailableInSeconds: 300 },
      } as never)
      .mockResolvedValueOnce({} as never); // reset-password

    renderForgotPasswordPage();

    await user.type(screen.getByLabelText("Email"), "user@ecom.vn");
    await user.click(screen.getByRole("button", { name: "Gửi mã xác nhận" }));

    await screen.findByRole("heading", { name: "Đặt lại mật khẩu" });

    await user.type(screen.getByLabelText("Mã xác minh 6 chữ số"), "123456");
    await user.type(screen.getByLabelText("Mật khẩu mới"), "newpassword123");
    await user.click(screen.getByRole("button", { name: "Đặt lại mật khẩu" }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/reset-password", {
        body: {
          email: "user@ecom.vn",
          code: "123456",
          newPassword: "newpassword123",
        },
      });
    });

    expect(toast.success).toHaveBeenCalledWith(
      "Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.",
    );
    expect(sessionStorage.getItem("ecom.pendingPasswordReset")).toBeNull();
  });

  it("stays on step 2 when code is invalid or expired (AC-34)", async () => {
    const user = userEvent.setup();

    vi.spyOn(api, "post")
      .mockResolvedValueOnce({
        data: { resendAvailableInSeconds: 300 },
      } as never)
      .mockRejectedValueOnce(
        new ApiError({
          status: 400,
          code: "AUTH-008",
          message: "Mã xác thực không hợp lệ hoặc đã hết hạn",
        }),
      );

    renderForgotPasswordPage();

    await user.type(screen.getByLabelText("Email"), "user@ecom.vn");
    await user.click(screen.getByRole("button", { name: "Gửi mã xác nhận" }));

    await screen.findByRole("heading", { name: "Đặt lại mật khẩu" });

    await user.type(screen.getByLabelText("Mã xác minh 6 chữ số"), "000000");
    await user.type(screen.getByLabelText("Mật khẩu mới"), "newpassword123");
    await user.click(screen.getByRole("button", { name: "Đặt lại mật khẩu" }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledTimes(2);
    });

    // Stays on step 2
    expect(
      screen.getByRole("heading", { name: "Đặt lại mật khẩu" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Mã xác minh 6 chữ số")).toHaveValue("000000");
  });

  it("handles resend countdown and requests new code when countdown reaches 0 (AC-32)", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    vi.spyOn(api, "post")
      .mockResolvedValueOnce({
        data: { resendAvailableInSeconds: 2 },
      } as never)
      .mockResolvedValueOnce({
        data: { resendAvailableInSeconds: 300 },
      } as never);

    renderForgotPasswordPage();

    await user.type(screen.getByLabelText("Email"), "user@ecom.vn");
    await user.click(screen.getByRole("button", { name: "Gửi mã xác nhận" }));

    await screen.findByRole("heading", { name: "Đặt lại mật khẩu" });
    expect(screen.getByText("Gửi lại sau 00:02")).toBeDisabled();

    // Advance 2 seconds
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    const resendBtn = screen.getByRole("button", { name: "Gửi lại mã" });
    expect(resendBtn).not.toBeDisabled();

    await user.click(resendBtn);

    expect(api.post).toHaveBeenCalledWith("/auth/forgot-password", {
      body: {
        email: "user@ecom.vn",
      },
    });
    expect(toast.success).toHaveBeenCalledWith("Đã gửi mã mới");

    vi.useRealTimers();
  });

  it("restores step 2 and preserves countdown on page reload (AC-35)", () => {
    vi.useFakeTimers();
    savePendingPasswordReset({
      email: "user@ecom.vn",
      resendAvailableInSeconds: 45,
    });

    renderForgotPasswordPage();

    expect(
      screen.getByRole("heading", { name: "Đặt lại mật khẩu" }),
    ).toBeInTheDocument();
    expect(screen.getByText("user@ecom.vn")).toBeInTheDocument();
    expect(screen.getByText("Gửi lại sau 00:45")).toBeDisabled();

    // Advance 10s
    act(() => {
      vi.advanceTimersByTime(10 * 1000);
    });
    expect(screen.getByText("Gửi lại sau 00:35")).toBeDisabled();

    vi.useRealTimers();
  });

  it("allows user to go back to step 1 and change email", async () => {
    const user = userEvent.setup();

    vi.spyOn(api, "post").mockResolvedValueOnce({
      data: { resendAvailableInSeconds: 300 },
    } as never);

    renderForgotPasswordPage();

    await user.type(screen.getByLabelText("Email"), "user@ecom.vn");
    await user.click(screen.getByRole("button", { name: "Gửi mã xác nhận" }));

    await screen.findByRole("heading", { name: "Đặt lại mật khẩu" });

    // Click "Đổi email khác"
    await user.click(screen.getByRole("button", { name: "Đổi email khác" }));

    expect(
      await screen.findByRole("heading", { name: "Quên mật khẩu" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveValue("user@ecom.vn");
    expect(sessionStorage.getItem("ecom.pendingPasswordReset")).toBeNull();
  });
});
