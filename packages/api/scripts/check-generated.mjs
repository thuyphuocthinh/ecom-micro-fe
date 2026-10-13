// Fails when src/generated/schema.d.ts is not what openapi.json produces (someone changed one and
// forgot the other). Does not need the backend: it only reads the files in this package.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const folder = mkdtempSync(join(tmpdir(), "ecom-api-"));
const generated = join(folder, "schema.d.ts");

try {
  execFileSync(
    "pnpm",
    ["exec", "openapi-typescript", "openapi.json", "-o", generated],
    {
      stdio: "ignore",
      shell: true,
    },
  );
  const normalize = (text) => text.replace(/\r\n/g, "\n");
  const expected = normalize(readFileSync(generated, "utf8"));
  const target = process.argv[2] ?? "src/generated/schema.d.ts";
  const actual = normalize(readFileSync(target, "utf8"));
  if (expected !== actual) {
    console.error(
      `${target} does not match openapi.json. Run: pnpm --filter @ecom/api generate`,
    );
    process.exit(1);
  }
  console.log("Generated types match openapi.json");
} finally {
  rmSync(folder, { recursive: true, force: true });
}
