import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) =>
  readFileSync(new URL(path, import.meta.url), "utf8");
const theme = read("./theme.css");

/** Every `--name: value;` declared in the file. */
function tokens(css: string): Record<string, string> {
  const found: Record<string, string> = {};
  for (const match of css.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
    found[match[1]] = match[2].trim();
  }
  return found;
}

const declared = tokens(theme);

// The values of store.css of the canvas "Ecom storefront" (version 1791896214-ad5b)
const COLORS: Record<string, string> = {
  ink: "#101828",
  "ink-2": "#344054",
  muted: "#5b6472",
  line: "#e3e6ec",
  canvas: "#f6f7f9",
  card: "#ffffff",
  brand: "#2f6fed",
  "brand-dark": "#2559c9",
  "brand-tint": "#eaf0ff",
  sale: "#c7321a",
  "sale-tint": "#fde9e5",
  ok: "#0b7a55",
  "ok-tint": "#e3f5ee",
  warn: "#8a5a00",
  "warn-tint": "#fff3d6",
  err: "#b42318",
  "err-tint": "#fdecea",
  "field-border": "#c9ced8",
  placeholder: "#7a8392",
};

describe("design tokens (AC-1)", () => {
  it.each(Object.entries(COLORS))("color %s is %s", (name, value) => {
    expect(declared[`--color-${name}`]).toBe(value);
  });

  it("has the two fonts of the design", () => {
    expect(declared["--font-body"]).toContain("Be Vietnam Pro");
    expect(declared["--font-head"]).toMatch(/^"Bricolage Grotesque"/);
  });

  it("has the two corner radii", () => {
    expect(declared["--radius-control"]).toBe("10px");
    expect(declared["--radius-card"]).toBe("14px");
  });

  it("declares them inside @theme so Tailwind makes bg-brand, rounded-control...", () => {
    expect(theme).toMatch(/@theme\s*{[^}]*--color-brand:/s);
  });
});

describe("base rules of the page (AC-2, AC-3, AC-4)", () => {
  it("sets the body: body font, canvas background, ink text, 15px, line height 1.5", () => {
    const body = theme.match(/\bbody\s*{([^}]*)}/s)?.[1] ?? "";
    expect(body).toContain("var(--font-body)");
    expect(body).toContain("var(--color-canvas)");
    expect(body).toContain("var(--color-ink)");
    expect(body).toMatch(/font-size:\s*15px/);
    expect(body).toMatch(/line-height:\s*1\.5/);
  });

  it("sets h1 to h3: head font, bold, tight letters and lines, balanced wrap", () => {
    const heading = theme.match(/h1,\s*h2,\s*h3\s*{([^}]*)}/s)?.[1] ?? "";
    expect(heading).toContain("var(--font-head)");
    expect(heading).toMatch(/font-weight:\s*700/);
    expect(heading).toMatch(/letter-spacing:\s*-0\.02em/);
    expect(heading).toMatch(/line-height:\s*1\.12/);
    expect(heading).toMatch(/text-wrap:\s*balance/);
  });

  it("shows a 3px brand focus ring 2px away, only for the keyboard", () => {
    const ring = theme.match(/:focus-visible\s*{([^}]*)}/s)?.[1] ?? "";
    expect(ring).toMatch(/outline:\s*3px solid var\(--color-brand\)/);
    expect(ring).toMatch(/outline-offset:\s*2px/);
    expect(theme).toMatch(/:focus:not\(:focus-visible\)\s*{\s*outline:\s*none/);
  });

  it("turns animations and transitions off when the user asks for less motion", () => {
    const reduced =
      theme.match(/prefers-reduced-motion:\s*reduce\)\s*{(.*)}\s*}/s)?.[1] ??
      "";
    expect(reduced).toMatch(/transition:\s*none\s*!important/);
    expect(reduced).toMatch(/animation:\s*none\s*!important/);
  });
});

// WCAG 2: contrast ratio between two colors
function luminance(hex: string): number {
  const channel = (offset: number) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}
function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

describe("text is readable on its background (AC-14)", () => {
  const WHITE = "#ffffff";
  const c = (name: string) => COLORS[name];

  it.each([
    ["ink on white", c("ink"), WHITE],
    ["ink-2 on white", c("ink-2"), WHITE],
    ["muted on white", c("muted"), WHITE],
    ["white on brand", WHITE, c("brand")],
    ["white on brand-dark", WHITE, c("brand-dark")],
    ["err on white", c("err"), WHITE],
    ["ok on ok-tint", c("ok"), c("ok-tint")],
    ["sale on sale-tint", c("sale"), c("sale-tint")],
    ["warn on warn-tint", c("warn"), c("warn-tint")],
    ["brand-dark on brand-tint", c("brand-dark"), c("brand-tint")],
    ["white on ink", WHITE, c("ink")],
  ])("%s is at least 4.5:1", (_name, foreground, background) => {
    expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });

  it("the sanity check of the formula: black on white is 21:1", () => {
    expect(contrast("#000000", WHITE)).toBeCloseTo(21, 0);
  });
});
