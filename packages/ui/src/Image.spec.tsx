import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Image } from "./Image";

describe("Image component", () => {
  it("renders image tag when src is valid", () => {
    render(<Image src="https://example.com/test.jpg" alt="Sản phẩm A" />);
    const img = screen.getByRole("img", { name: "Sản phẩm A" });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/test.jpg");
  });

  it("renders custom fallback node when src is empty", () => {
    render(
      <Image
        src=""
        alt="Sản phẩm B"
        fallback={<span data-testid="fallback-node">Không có ảnh</span>}
      />,
    );
    expect(screen.getByTestId("fallback-node")).toHaveTextContent(
      "Không có ảnh",
    );
  });

  it("renders default svg placeholder when image errors and no fallback node", () => {
    render(<Image src="https://example.com/invalid.jpg" alt="Lỗi tải" />);
    const img = screen.getByRole("img", { name: "Lỗi tải" });

    // Trigger error
    fireEvent.error(img);

    // Fallback div with role=img
    const placeholder = screen.getByRole("img", { name: "Lỗi tải" });
    expect(placeholder.tagName.toLowerCase()).toBe("div");
  });

  it("switches to fallbackSrc if primary image fails", () => {
    render(
      <Image
        src="https://example.com/bad.jpg"
        fallbackSrc="https://example.com/backup.jpg"
        alt="Ảnh dự phòng"
      />,
    );
    const img = screen.getByRole("img", { name: "Ảnh dự phòng" });
    expect(img).toHaveAttribute("src", "https://example.com/bad.jpg");

    // Fail primary
    fireEvent.error(img);

    // Should switch to fallbackSrc
    expect(img).toHaveAttribute("src", "https://example.com/backup.jpg");
  });

  it("adds preload link to head when preload is true", () => {
    render(
      <Image
        src="https://example.com/preload.jpg"
        alt="Preload"
        preload={true}
      />,
    );
    const link = document.querySelector('link[rel="preload"][as="image"]');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://example.com/preload.jpg");
  });
});
