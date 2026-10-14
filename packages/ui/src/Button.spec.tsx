import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button, buttonClasses, linkClasses } from "./Button";
import { Spinner } from "./Spinner";

describe("Button (AC-5)", () => {
  it("is type=button by default so it never submits a form by accident", () => {
    render(<Button>Mua</Button>);

    expect(screen.getByRole("button", { name: "Mua" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("can be a submit button, and passes every button attribute on", () => {
    render(
      <Button type="submit" name="go" aria-label="Gửi">
        Gửi
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Gửi" });
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveAttribute("name", "go");
  });

  it("is at least 44px tall, 52px when large, with a 10px radius and bold text", () => {
    const { rerender } = render(<Button>Mua</Button>);
    const classes = () => screen.getByRole("button").className;

    expect(classes()).toContain("min-h-11");
    expect(classes()).toContain("rounded-control");
    expect(classes()).toContain("font-semibold");
    expect(classes()).toContain("px-5");

    rerender(<Button size="lg">Mua</Button>);
    expect(classes()).toContain("min-h-13");
    expect(classes()).toContain("px-7");
  });

  it.each([
    ["primary", ["bg-brand", "text-white", "hover:bg-brand-dark"]],
    [
      "secondary",
      [
        "bg-white",
        "border-field-border",
        "hover:bg-canvas",
        "hover:border-ink-2",
      ],
    ],
    ["ghost", ["bg-transparent", "text-ink-2", "hover:bg-ink/6"]],
  ] as const)("%s has the colours of the design", (variant, expected) => {
    render(<Button variant={variant}>Mua</Button>);

    for (const name of expected) {
      expect(screen.getByRole("button").className).toContain(name);
    }
  });

  it("is primary by default", () => {
    render(<Button>Mua</Button>);

    expect(screen.getByRole("button").className).toContain("bg-brand");
  });

  it("fades and cannot be pressed when disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Mua
      </Button>,
    );

    const button = screen.getByRole("button");
    await userEvent.click(button);

    expect(button).toBeDisabled();
    expect(button.className).toContain("disabled:opacity-55");
    expect(button.className).toContain("disabled:cursor-not-allowed");
    expect(onClick).not.toHaveBeenCalled();
  });

  it("adds the page's own classes", () => {
    render(<Button className="w-full">Mua</Button>);

    expect(screen.getByRole("button").className).toContain("w-full");
  });
});

describe("a button that is working (AC-6)", () => {
  it("shows a spinner, says it is busy, and cannot be pressed again", async () => {
    const onClick = vi.fn();
    const { container } = render(
      <Button loading onClick={onClick}>
        Đang đăng nhập…
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Đang đăng nhập…" });
    await userEvent.click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("keeps the height of an idle button", () => {
    const { rerender } = render(<Button>Mua</Button>);
    const idle = screen.getByRole("button").className;

    rerender(<Button loading>Mua</Button>);

    expect(screen.getByRole("button").className).toBe(idle);
  });

  it("is not busy and has no spinner when idle", () => {
    const { container } = render(<Button>Mua</Button>);

    expect(screen.getByRole("button")).not.toHaveAttribute("aria-busy");
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
  });
});

describe("a link that looks like a button (AC-7)", () => {
  it("gets the same classes as the button of that kind, and stays a real link", () => {
    render(
      <a
        href="/login"
        className={buttonClasses({ variant: "secondary", size: "lg" })}
      >
        Đăng nhập
      </a>,
    );

    const link = screen.getByRole("link", { name: "Đăng nhập" });
    expect(link).toHaveAttribute("href", "/login");
    expect(link.className).toContain("border-field-border");
    expect(link.className).toContain("min-h-13");
    expect(link.className).toContain("no-underline");
  });

  it("matches what Button renders", () => {
    render(<Button variant="ghost">Mua</Button>);

    expect(screen.getByRole("button").className).toBe(
      buttonClasses({ variant: "ghost" }),
    );
  });

  it("has a style for links inside a sentence: bold brand colour, underlined", () => {
    const classes = linkClasses();

    expect(classes).toContain("text-brand");
    expect(classes).toContain("font-semibold");
    expect(classes).toContain("underline");
    expect(classes).toContain("hover:text-brand-dark");
  });
});

describe("Spinner (AC-8)", () => {
  it("is an 18px ring in the text colour, hidden from screen readers", () => {
    const { container } = render(<Spinner />);
    const ring = container.firstElementChild as HTMLElement;

    expect(ring).toHaveAttribute("aria-hidden", "true");
    expect(ring.className).toContain("size-[18px]");
    expect(ring.className).toContain("rounded-full");
    expect(ring.className).toContain("border-current/40");
    expect(ring.className).toContain("border-t-current");
    expect(ring.className).toContain("motion-safe:animate-spin");
  });
});
