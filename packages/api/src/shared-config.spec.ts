import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// AC-13: the apps must share ONE copy of @ecom/api, or each would keep its own token
describe.each(["shell", "catalog", "checkout"])("%s vite config", (app) => {
  it("shares @ecom/api as a singleton", () => {
    const config = readFileSync(
      new URL(`../../../apps/${app}/vite.config.ts`, import.meta.url),
      "utf8",
    );

    expect(config).toMatch(/"@ecom\/api":\s*{\s*singleton:\s*true/);
  });

  it("lists @ecom/api as a dependency", () => {
    const packageJson = JSON.parse(
      readFileSync(
        new URL(`../../../apps/${app}/package.json`, import.meta.url),
        "utf8",
      ),
    );

    expect(packageJson.dependencies["@ecom/api"]).toBe("workspace:*");
  });
});
