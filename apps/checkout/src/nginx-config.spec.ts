import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// The tests run from the folder of the app (apps/checkout), so the gateway is two levels up
const config = readFileSync(
  resolve(process.cwd(), "..", "..", "gateway", "nginx.conf"),
  "utf8",
);

/** The text of the block that opens with `header` (up to its closing brace). */
function block(header: RegExp): string {
  const start = config.search(header);
  if (start === -1) return "";
  const open = config.indexOf("{", start);
  const close = config.indexOf("}", open);
  return config.slice(open + 1, close);
}

describe("nginx gateway: the status stream of an order (AC-10)", () => {
  const stream = block(/location ~ \^\/api\/v1\/orders\/\[\^\/\]\+\/events\$/);

  it("has its own location for /api/v1/orders/<id>/events", () => {
    expect(stream).not.toBe("");
    expect(stream).toMatch(/proxy_pass\s+http:\/\/backend_api;/);
  });

  it("does not buffer or cache the answer, so each message reaches the browser at once", () => {
    expect(stream).toMatch(/proxy_buffering\s+off;/);
    expect(stream).toMatch(/proxy_cache\s+off;/);
  });

  it("speaks HTTP/1.1 with the connection kept open", () => {
    expect(stream).toMatch(/proxy_http_version\s+1\.1;/);
    expect(stream).toMatch(/proxy_set_header\s+Connection\s+"";/);
  });

  it("waits longer than the longest stream (30 minutes) for the backend to write", () => {
    const seconds = Number(stream.match(/proxy_read_timeout\s+(\d+)s;/)?.[1]);
    expect(seconds).toBeGreaterThan(30 * 60);
  });

  it("is a regex location, so it wins over the prefix one for the rest of the API", () => {
    expect(config).toMatch(/location ~ \^\/api\/v1\/orders\//);
    expect(config.indexOf("orders/[^/]+/events")).toBeLessThan(
      config.indexOf("location /api/v1/ {"),
    );
  });

  it("leaves the other API routes as they were: plain proxy, no changes", () => {
    const rest = block(/location \/api\/v1\/ \{/);
    expect(rest).toMatch(/proxy_pass\s+http:\/\/backend_api;/);
    expect(rest).not.toMatch(/proxy_buffering/);
    expect(rest).not.toMatch(/proxy_read_timeout/);
  });
});
