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

  describe("loads lazily by default (AC-1)", () => {
    it("has loading=lazy and decoding=async when the page says nothing", () => {
      render(<Image src="https://example.com/a.jpg" alt="Sản phẩm" />);

      const img = screen.getByRole("img", { name: "Sản phẩm" });
      expect(img).toHaveAttribute("loading", "lazy");
      expect(img).toHaveAttribute("decoding", "async");
    });

    it("keeps what the page asks for: an eager, high priority photo", () => {
      render(
        <Image
          src="https://example.com/a.jpg"
          alt="Ảnh chính"
          loading="eager"
          fetchPriority="high"
          decoding="sync"
        />,
      );

      const img = screen.getByRole("img", { name: "Ảnh chính" });
      expect(img).toHaveAttribute("loading", "eager");
      expect(img).toHaveAttribute("fetchpriority", "high");
      expect(img).toHaveAttribute("decoding", "sync");
    });

    it("the page can also ask for loading=lazy or leave one of the two alone", () => {
      render(
        <Image src="https://example.com/a.jpg" alt="Ảnh" decoding="auto" />,
      );

      const img = screen.getByRole("img", { name: "Ảnh" });
      expect(img).toHaveAttribute("loading", "lazy");
      expect(img).toHaveAttribute("decoding", "auto");
    });

    it("the placeholder for a missing or broken picture has no <img> to load", () => {
      const { container } = render(<Image src="" alt="Không có ảnh" />);

      expect(container.querySelector("img")).toBeNull();
    });

    it("a list of 20 pictures asks the browser to defer every one of them", () => {
      const { container } = render(
        <ul>
          {Array.from({ length: 20 }, (_, i) => (
            <li key={i}>
              <Image src={`https://example.com/${i}.jpg`} alt={`Ảnh ${i}`} />
            </li>
          ))}
        </ul>,
      );

      const images = [...container.querySelectorAll("img")];
      expect(images).toHaveLength(20);
      expect(
        images.every((img) => img.getAttribute("loading") === "lazy"),
      ).toBe(true);
    });
  });
});
