import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { toast } from "sonner";
import { api, ApiError } from "@ecom/api";
import { RegisterPage } from "./RegisterPage.tsx";
import {
  AuthContext,
  type AuthContextValue,
} from "../features/auth/auth-context.ts";

vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockLogin = vi.fn();

function renderRegisterPage() {
  const fullValue: AuthContextValue = {
    status: "guest",
    user: null,
    cartCount: 0,
    login: mockLogin,
    logout: vi.fn(),
  };

  return render(
    <AuthContext.Provider value={fullValue}>
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe("RegisterPage & Verification flow (AC-9, AC-11, AC-12, AC-13, AC-14, AC-15, AC-16)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("transitions from step 1 to step 2 upon successful register request (AC-9)", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "post").mockResolvedValueOnce({
      data: { resendAvailableInSeconds: 60, verificationExpiresInSeconds: 900 },
    } as never);

    renderRegisterPage();

    await user.type(screen.getByLabelText("Họ và tên"), "Nguyễn Văn A");
    await user.type(screen.getByLabelText("Email"), "newuser@ecom.vn");
    await user.type(screen.getByLabelText("Mật khẩu"), "securepass123");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Tạo tài khoản" }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/register", {
        body: {
          displayName: "Nguyễn Văn A",
          email: "newuser@ecom.vn",
          password: "securepass123",
        },
      });
    });

    // Step 2 elements visible
    expect(screen.getByText("Xác minh email")).toBeInTheDocument();
    expect(screen.getByText("newuser@ecom.vn")).toBeInTheDocument();
    expect(screen.getByLabelText("Mã xác minh 6 chữ số")).toBeInTheDocument();
    expect(screen.getByText(/Gửi lại sau 01:00/)).toBeInTheDocument();
  });

  it("submits 6-digit code in step 2 and logs in on success (AC-13)", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "post")
      .mockResolvedValueOnce({
        data: {
          resendAvailableInSeconds: 60,
          verificationExpiresInSeconds: 900,
        },
      } as never)
      .mockResolvedValueOnce({
        data: { accessToken: "at-1", refreshToken: "rt-1" },
      } as never);

    renderRegisterPage();

    // Complete Step 1
    await user.type(screen.getByLabelText("Họ và tên"), "Nguyễn Văn A");
    await user.type(screen.getByLabelText("Email"), "newuser@ecom.vn");
    await user.type(screen.getByLabelText("Mật khẩu"), "securepass123");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Tạo tài khoản" }));

    await screen.findByText("Xác minh email");

    // Complete Step 2
    await user.type(screen.getByLabelText("Mã xác minh 6 chữ số"), "123456");
    await user.click(screen.getByRole("button", { name: "Xác minh" }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/verify-email", {
        body: {
          email: "newuser@ecom.vn",
          code: "123456",
          password: "securepass123",
        },
      });
      expect(mockLogin).toHaveBeenCalledWith({
        accessToken: "at-1",
        refreshToken: "rt-1",
      });
      expect(toast.success).toHaveBeenCalledWith(
        "Chào mừng, Nguyễn Văn A! Tài khoản đã sẵn sàng.",
      );
    });
  });

  it("stays on step 2 when code is invalid or expired (AC-14)", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "post")
      .mockResolvedValueOnce({
        data: {
          resendAvailableInSeconds: 60,
          verificationExpiresInSeconds: 900,
        },
      } as never)
      .mockRejectedValueOnce(
        new ApiError({
          status: 400,
          code: "AUTH-008",
          message: "Invalid code",
        }),
      );

    renderRegisterPage();

    await user.type(screen.getByLabelText("Họ và tên"), "Nguyễn Văn A");
    await user.type(screen.getByLabelText("Email"), "newuser@ecom.vn");
    await user.type(screen.getByLabelText("Mật khẩu"), "securepass123");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Tạo tài khoản" }));

    await screen.findByText("Xác minh email");

    await user.type(screen.getByLabelText("Mã xác minh 6 chữ số"), "999999");
    await user.click(screen.getByRole("button", { name: "Xác minh" }));

    // User is still on Step 2
    expect(screen.getByText("Xác minh email")).toBeInTheDocument();
  });

  it("returns to step 1 when registration session expired with AUTH-011 (AC-15)", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "post")
      .mockResolvedValueOnce({
        data: {
          resendAvailableInSeconds: 60,
          verificationExpiresInSeconds: 900,
        },
      } as never)
      .mockRejectedValueOnce(
        new ApiError({
          status: 400,
          code: "AUTH-011",
          message: "Session expired",
        }),
      );

    renderRegisterPage();

    await user.type(screen.getByLabelText("Họ và tên"), "Nguyễn Văn A");
    await user.type(screen.getByLabelText("Email"), "newuser@ecom.vn");
    await user.type(screen.getByLabelText("Mật khẩu"), "securepass123");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Tạo tài khoản" }));

    await screen.findByText("Xác minh email");

    await user.type(screen.getByLabelText("Mã xác minh 6 chữ số"), "123456");
    await user.click(screen.getByRole("button", { name: "Xác minh" }));

    // Returns to step 1
    await screen.findByText("Đăng ký");
    expect(screen.getByLabelText("Email")).toHaveValue("newuser@ecom.vn");
    expect(screen.getByLabelText("Mật khẩu")).toHaveValue("");
  });

  it("handles resend countdown and requests new code when countdown reaches 0 (AC-16)", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    vi.spyOn(api, "post")
      .mockResolvedValueOnce({
        data: {
          resendAvailableInSeconds: 2,
          verificationExpiresInSeconds: 900,
        },
      } as never)
      .mockResolvedValueOnce({
        data: { resendAvailableInSeconds: 60 },
      } as never);

    renderRegisterPage();

    await user.type(screen.getByLabelText("Họ và tên"), "Nguyễn Văn A");
    await user.type(screen.getByLabelText("Email"), "newuser@ecom.vn");
    await user.type(screen.getByLabelText("Mật khẩu"), "securepass123");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Tạo tài khoản" }));

    await screen.findByText("Xác minh email");
    expect(screen.getByText("Gửi lại sau 00:02")).toBeDisabled();

    // Advance 2 seconds
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    const resendBtn = screen.getByRole("button", { name: "Gửi lại mã" });
    expect(resendBtn).not.toBeDisabled();

    await user.click(resendBtn);

    expect(api.post).toHaveBeenCalledWith("/auth/resend-verification", {
      body: {
        email: "newuser@ecom.vn",
      },
    });
    expect(toast.success).toHaveBeenCalledWith("Đã gửi mã mới");

    vi.useRealTimers();
  });
});
