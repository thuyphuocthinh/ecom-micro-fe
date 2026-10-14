import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { api } from "@ecom/api";
import { toast } from "sonner";
import { AuthContext, type AuthContextValue } from "@/features/auth";
import type { UserProfile } from "@/types";
import { ProfileInfoCard } from "./ProfileInfoCard.tsx";

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

function renderProfileInfoCard(userOverride?: Partial<UserProfile>) {
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
        <ProfileInfoCard />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

describe("ProfileInfoCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders user information correctly (AC-2)", () => {
    renderProfileInfoCard();

    expect(screen.getByText("Thông tin cá nhân")).toBeInTheDocument();
    expect(screen.getByLabelText("Họ và tên")).toHaveValue("Nguyễn Văn A");
    expect(
      screen.getByDisplayValue("customer@example.com"),
    ).toBeInTheDocument();
    expect(screen.getByText("Đã xác minh")).toBeInTheDocument();
    expect(screen.getByText("Khách hàng")).toBeInTheDocument();
    expect(screen.getByText("Đăng nhập bằng mật khẩu")).toBeInTheDocument();
    expect(screen.getByText(/Tham gia từ/)).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument(); // initial letter
    expect(screen.queryByRole("button", { name: "Xóa ảnh" })).toBeNull();
  });

  it("renders custom avatar and 'Xóa ảnh' button when avatarUrl exists (AC-2, AC-5)", () => {
    renderProfileInfoCard({
      avatarUrl: "https://example.com/avatar.jpg",
    });

    const img = screen.getByAltText("Nguyễn Văn A");
    expect(img).toHaveAttribute("src", "https://example.com/avatar.jpg");
    expect(screen.getByRole("button", { name: "Xóa ảnh" })).toBeInTheDocument();
  });

  it("calls DELETE /users/me/avatar when 'Xóa ảnh' is clicked (AC-5)", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "delete").mockResolvedValueOnce({
      data: null,
      statusCode: 204,
      message: "Success",
    } as never);

    renderProfileInfoCard({
      avatarUrl: "https://example.com/avatar.jpg",
    });

    const removeBtn = screen.getByRole("button", { name: "Xóa ảnh" });
    await user.click(removeBtn);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("/users/me/avatar");
    });
  });

  it("validates empty name and displays error (AC-3)", async () => {
    const user = userEvent.setup();
    renderProfileInfoCard();

    const nameInput = screen.getByLabelText("Họ và tên");
    await user.clear(nameInput);
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText("Họ và tên không được để trống"),
      ).toBeInTheDocument();
    });
  });

  it("submits PATCH /users/me when display name is updated (AC-3)", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "patch").mockResolvedValueOnce({
      data: { ...mockUser, displayName: "Nguyễn Văn B" },
      statusCode: 200,
      message: "Success",
    } as never);

    renderProfileInfoCard();

    const nameInput = screen.getByLabelText("Họ và tên");
    await user.clear(nameInput);
    await user.type(nameInput, "Nguyễn Văn B");

    const saveBtn = screen.getByRole("button", { name: "Lưu thay đổi" });
    expect(saveBtn).not.toBeDisabled();
    await user.click(saveBtn);

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith("/users/me", {
        body: { displayName: "Nguyễn Văn B" },
      });
    });
  });

  it("reverts name changes when 'Bỏ thay đổi' is clicked", async () => {
    const user = userEvent.setup();
    renderProfileInfoCard();

    const nameInput = screen.getByLabelText("Họ và tên");
    await user.type(nameInput, " Modified");

    expect(
      screen.getByRole("button", { name: "Bỏ thay đổi" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Bỏ thay đổi" }));

    expect(nameInput).toHaveValue("Nguyễn Văn A");
    expect(screen.queryByRole("button", { name: "Bỏ thay đổi" })).toBeNull();
  });

  it("rejects invalid file formats on avatar selection (AC-4)", () => {
    renderProfileInfoCard();

    const fileInput = screen.getByLabelText(
      "Tải lên ảnh đại diện mới",
    ) as HTMLInputElement;
    const txtFile = new File(["dummy"], "avatar.txt", { type: "text/plain" });

    fireEvent.change(fileInput, { target: { files: [txtFile] } });

    expect(toast.error).toHaveBeenCalledWith(
      "Chỉ chấp nhận file ảnh định dạng JPEG, PNG hoặc WebP",
    );
  });

  it("rejects oversized file (>10MB) on avatar selection (AC-4)", async () => {
    const user = userEvent.setup();
    renderProfileInfoCard();

    const fileInput = screen.getByLabelText(
      "Tải lên ảnh đại diện mới",
    ) as HTMLInputElement;
    const hugeFile = new File(["huge data"], "huge.png", { type: "image/png" });
    Object.defineProperty(hugeFile, "size", { value: 11 * 1024 * 1024 });

    await user.upload(fileInput, hugeFile);

    expect(toast.error).toHaveBeenCalledWith("Dung lượng ảnh tối đa 10 MB");
  });

  it("opens crop modal when valid image is selected (AC-4)", async () => {
    const user = userEvent.setup();
    renderProfileInfoCard();

    const fileInput = screen.getByLabelText(
      "Tải lên ảnh đại diện mới",
    ) as HTMLInputElement;
    const validFile = new File(["valid image"], "photo.jpg", {
      type: "image/jpeg",
    });

    await user.upload(fileInput, validFile);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Cắt ảnh đại diện")).toBeInTheDocument();
  });
});
