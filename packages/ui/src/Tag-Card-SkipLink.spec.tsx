import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Card } from "./Card";
import { SkipLink } from "./SkipLink";
import { Tag } from "./Tag";

describe("Tag (AC-13)", () => {
  it("is a small pill", () => {
    render(<Tag>Giảm 13%</Tag>);

    const classes = screen.getByText("Giảm 13%").className;
    expect(classes).toContain("rounded-full");
    expect(classes).toContain("px-2.5");
    expect(classes).toContain("py-[3px]");
    expect(classes).toContain("text-[12.5px]");
    expect(classes).toContain("font-semibold");
  });

  it.each([
    ["sale", "bg-sale-tint", "text-sale"],
    ["ok", "bg-ok-tint", "text-ok"],
    ["warn", "bg-warn-tint", "text-warn"],
    ["brand", "bg-brand-tint", "text-brand-dark"],
  ] as const)("tone %s uses %s and %s", (tone, background, text) => {
    render(<Tag tone={tone}>x</Tag>);

    const classes = screen.getByText("x").className;
    expect(classes).toContain(background);
    expect(classes).toContain(text);
  });

  it("is brand by default", () => {
    render(<Tag>x</Tag>);

    expect(screen.getByText("x").className).toContain("bg-brand-tint");
  });
});

describe("Card (AC-13)", () => {
  it("is a white box with a thin border and 14px corners, and keeps what is put in it", () => {
    render(
      <Card data-testid="card" className="p-4">
        nội dung
      </Card>,
    );

    const card = screen.getByTestId("card");
    expect(card.className).toContain("bg-card");
    expect(card.className).toContain("border-line");
    expect(card.className).toContain("rounded-card");
    expect(card.className).toContain("p-4");
    expect(card).toHaveTextContent("nội dung");
  });
});

describe("SkipLink (AC-13)", () => {
  it("jumps to #main with the words of the design", () => {
    render(<SkipLink />);

    const link = screen.getByRole("link", {
      name: "Bỏ qua, tới nội dung chính",
    });
    expect(link).toHaveAttribute("href", "#main");
  });

  it("sits above the screen until it has focus, then shows in the top left corner", () => {
    render(<SkipLink />);
    const link = screen.getByRole("link");

    expect(link.className).toContain("-top-16");
    expect(link.className).toContain("focus-visible:top-3");
    expect(link.className).toContain("bg-ink");
    expect(link.className).toContain("text-white");
    expect(link.className).toContain("rounded-lg");
  });

  it("is the first thing the Tab key reaches", async () => {
    render(
      <>
        <SkipLink />
        <button>sau</button>
      </>,
    );

    await userEvent.tab();

    expect(
      screen.getByRole("link", { name: "Bỏ qua, tới nội dung chính" }),
    ).toHaveFocus();
  });
});
