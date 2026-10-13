// Downloads the Swagger JSON of the running backend into openapi.json (formatted, so diffs stay small).
// Usage: pnpm --filter @ecom/api fetch-openapi   (API_URL defaults to http://localhost:4000)
import { writeFile } from "node:fs/promises";

const apiUrl = process.env.API_URL ?? "http://localhost:4000";
const url = `${apiUrl}/api/v1/docs-json`;

const response = await fetch(url);
if (!response.ok) {
  console.error(
    `Could not read ${url}: HTTP ${response.status}. Is the backend running?`,
  );
  process.exit(1);
}

const document = await response.json();
await writeFile(
  new URL("../openapi.json", import.meta.url),
  `${JSON.stringify(document, null, 2)}\n`,
);
console.log(`openapi.json updated from ${url}`);
