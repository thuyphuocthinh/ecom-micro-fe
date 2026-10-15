import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// The tests run from the folder of the app (apps/shell), so its neighbours are one level up
const read = (app: string) =>
  readFileSync(resolve(process.cwd(), "..", app, "vite.config.ts"), "utf8");

// AC-14: no app downloads the types of the others (the pages are loaded at runtime, not at build time)
describe.each(["shell", "catalog", "checkout"])(
  "%s vite config (AC-14)",
  (app) => {
    it("turns off the Module Federation type download (dts: false)", () => {
      const federation =
        read(app).match(/federation\(\{[\s\S]*?\n {6}\}\)/)?.[0] ?? "";

      expect(federation).not.toBe("");
      expect(federation).toMatch(/dts:\s*false/);
    });
  },
);
