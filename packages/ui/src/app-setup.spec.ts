import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) =>
  readFileSync(new URL(path, import.meta.url), "utf8");

// AC-2: the three apps share the theme and load the fonts
describe.each(["shell", "catalog", "checkout"])("%s", (app) => {
  const css = read(`../../../apps/${app}/src/index.css`);
  const html = read(`../../../apps/${app}/index.html`);
  const packageJson = JSON.parse(read(`../../../apps/${app}/package.json`));

  it("imports Tailwind, then the shared theme, and scans packages/ui", () => {
    const tailwind = css.indexOf('@import "tailwindcss"');
    const theme = css.indexOf('@import "@ecom/ui/theme.css"');
    expect(tailwind).toBeGreaterThanOrEqual(0);
    expect(theme).toBeGreaterThan(tailwind);
    expect(css).toContain('@source "../../../packages/ui"');
  });

  it("depends on @ecom/ui", () => {
    expect(packageJson.dependencies["@ecom/ui"]).toBe("workspace:*");
  });

  it("is in Vietnamese and loads the two fonts from Google Fonts", () => {
    expect(html).toContain('<html lang="vi">');
    expect(html).toContain(
      'rel="preconnect" href="https://fonts.googleapis.com"',
    );
    expect(html).toContain("family=Be+Vietnam+Pro:wght@400;500;600;700");
    expect(html).toContain("family=Bricolage+Grotesque");
    expect(html).toContain("display=swap");
  });
});

describe("@ecom/ui", () => {
  it("exports the theme file", () => {
    const packageJson = JSON.parse(read("../package.json"));
    expect(packageJson.exports["./theme.css"]).toBe("./src/theme.css");
  });
});
