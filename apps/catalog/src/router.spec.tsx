import { describe, it, expect } from "vitest";
import { router } from "@/router.tsx";

describe("catalog router configuration", () => {
  it("defines catalog layout, home, and search routes correctly", () => {
    expect(router.routes).toHaveLength(1);

    const rootRoute = router.routes[0];
    expect(rootRoute).toBeDefined();
    expect(rootRoute?.children).toBeDefined();

    const paths = rootRoute?.children?.map((r) => r.path);
    expect(paths).toContain("/");
    expect(paths).toContain("/search");
    expect(paths).toContain("/products");
  });
});
