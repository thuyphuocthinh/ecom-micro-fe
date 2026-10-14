import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { AvatarCropModal } from "./AvatarCropModal.tsx";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("AvatarCropModal", () => {
  const fakeFile = new File(["dummy content"], "avatar.jpg", {
    type: "image/jpeg",
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock URL.createObjectURL and revokeObjectURL
    window.URL.createObjectURL = vi.fn(
      () => "blob:http://localhost/fake-avatar",
    );
    window.URL.revokeObjectURL = vi.fn();

    // Mock HTMLCanvasElement.prototype.getContext and toBlob
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      fillStyle: "",
      fillRect: vi.fn(),
      drawImage: vi.fn(),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;

    HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
      callback(new Blob(["cropped-data"], { type: "image/jpeg" }));
    });
  });

  it("does not render when open is false", () => {
    render(
      <AvatarCropModal
        open={false}
        imageFile={fakeFile}
        onClose={vi.fn()}
        onCropComplete={vi.fn()}
      />,
    );

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders modal with header, viewport, zoom controls and action buttons when open is true", () => {
    render(
      <AvatarCropModal
        open={true}
        imageFile={fakeFile}
        onClose={vi.fn()}
        onCropComplete={vi.fn()}
      />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Cắt ảnh đại diện")).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: "Độ phóng to ảnh" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Thu nhỏ" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Phóng to" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hủy" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Cắt & Lưu ảnh" }),
    ).toBeInTheDocument();
  });

  it("calls onClose when Hủy button or close X is clicked", async () => {
    const onClose = vi.fn();
    render(
      <AvatarCropModal
        open={true}
        imageFile={fakeFile}
        onClose={onClose}
        onCropComplete={vi.fn()}
      />,
    );

    const cancelButton = screen.getByRole("button", { name: "Hủy" });
    await userEvent.click(cancelButton);
    expect(onClose).toHaveBeenCalledTimes(1);

    const closeX = screen.getByRole("button", { name: "Đóng" });
    await userEvent.click(closeX);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("calls onClose on Escape key press", () => {
    const onClose = vi.fn();
    render(
      <AvatarCropModal
        open={true}
        imageFile={fakeFile}
        onClose={onClose}
        onCropComplete={vi.fn()}
      />,
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("adjusts zoom via zoom in / zoom out buttons and slider", async () => {
    render(
      <AvatarCropModal
        open={true}
        imageFile={fakeFile}
        onClose={vi.fn()}
        onCropComplete={vi.fn()}
      />,
    );

    const slider = screen.getByRole("slider", {
      name: "Độ phóng to ảnh",
    }) as HTMLInputElement;
    expect(slider.value).toBe("1");

    const zoomInBtn = screen.getByRole("button", { name: "Phóng to" });
    await userEvent.click(zoomInBtn);
    expect(slider.value).toBe("1.2");

    const zoomOutBtn = screen.getByRole("button", { name: "Thu nhỏ" });
    await userEvent.click(zoomOutBtn);
    expect(slider.value).toBe("1");

    fireEvent.change(slider, { target: { value: "2.5" } });
    expect(slider.value).toBe("2.5");
  });

  it("rejects invalid dropped file type with toast", () => {
    render(
      <AvatarCropModal
        open={true}
        imageFile={fakeFile}
        onClose={vi.fn()}
        onCropComplete={vi.fn()}
      />,
    );

    const dropZone = screen
      .getByText("Cắt ảnh đại diện")
      .closest("div[class*='bg-white rounded-2xl']")!;
    const pdfFile = new File(["dummy pdf"], "doc.pdf", {
      type: "application/pdf",
    });

    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [pdfFile],
      },
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Chỉ chấp nhận file ảnh định dạng JPEG, PNG hoặc WebP",
    );
  });

  it("rejects oversized dropped file (>10MB) with toast", () => {
    render(
      <AvatarCropModal
        open={true}
        imageFile={fakeFile}
        onClose={vi.fn()}
        onCropComplete={vi.fn()}
      />,
    );

    const dropZone = screen
      .getByText("Cắt ảnh đại diện")
      .closest("div[class*='bg-white rounded-2xl']")!;
    const hugeFile = new File(["huge data"], "huge.png", { type: "image/png" });
    Object.defineProperty(hugeFile, "size", { value: 11 * 1024 * 1024 });

    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [hugeFile],
      },
    });

    expect(toast.error).toHaveBeenCalledWith("Dung lượng ảnh tối đa 10 MB");
  });
});
