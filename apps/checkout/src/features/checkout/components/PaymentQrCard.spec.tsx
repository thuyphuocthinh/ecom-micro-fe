import { createElement } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QRCodeSVG } from "qrcode.react";
import { PaymentQrCard } from "./PaymentQrCard.tsx";

// The real component draws; the wrapper only lets the test see what it was given to encode.
vi.mock("qrcode.react", async (importActual) => {
  const actual = await importActual<typeof import("qrcode.react")>();
  return {
    ...actual,
    QRCodeSVG: vi.fn((props: React.ComponentProps<typeof actual.QRCodeSVG>) =>
      createElement(actual.QRCodeSVG, props),
    ),
  };
});

const VIETQR =
  "00020101021238570010A000000727012700069704220113VQRQ0000abcde0208QRIBFTTA53037045405500005802VN62130809DH 1760000006304ABCD";

const renderCard = (props: Partial<Parameters<typeof PaymentQrCard>[0]> = {}) =>
  render(<PaymentQrCard amount={500000} orderCode="ord-12345678" {...props} />);

describe("PaymentQrCard", () => {
  it("draws a QR code that encodes the whole text of qrCode, untouched (AC-22)", () => {
    const { container } = renderCard({ qrCode: VIETQR });

    const picture = screen.getByRole("img", { name: "Mã QR thanh toán" });
    expect(picture.tagName.toLowerCase()).toBe("svg");
    expect(container.querySelectorAll("svg path").length).toBeGreaterThan(0);
    expect(vi.mocked(QRCodeSVG).mock.calls.at(-1)?.[0]).toMatchObject({
      value: VIETQR,
      level: "M",
      bgColor: "#ffffff",
      fgColor: "#000000",
    });
  });

  it.each([
    ["null", null],
    ["empty", ""],
    ["missing", undefined],
  ])(
    "draws nothing and says it is making the code when qrCode is %s (AC-23)",
    (_name, qrCode) => {
      renderCard({ qrCode, payUrl: "https://pay.payos.vn/web/abc123" });

      expect(screen.getByText("Đang tạo mã QR…")).toBeInTheDocument();
      expect(
        screen.queryByRole("img", { name: "Mã QR thanh toán" }),
      ).not.toBeInTheDocument();
      // The way out is still there
      expect(
        screen.getByRole("link", { name: /Mở trang thanh toán của cổng/ }),
      ).toBeInTheDocument();
    },
  );

  it("shows the gateway page as a link that opens in a new tab, safely (AC-24)", () => {
    renderCard({ qrCode: VIETQR, payUrl: "https://pay.payos.vn/web/abc123" });

    const link = screen.getByRole("link", {
      name: /Mở trang thanh toán của cổng/,
    });
    expect(link).toHaveAttribute("href", "https://pay.payos.vn/web/abc123");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it.each([null, undefined])(
    "has no link at all when payUrl is %s (AC-24)",
    (payUrl) => {
      renderCard({ qrCode: VIETQR, payUrl });

      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    },
  );
});
