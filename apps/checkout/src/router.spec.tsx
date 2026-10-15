import { describe, it, expect } from "vitest";
import { router } from "@/router.tsx";

describe("checkout router configuration", () => {
  it("defines checkout layout with lazy routes correctly", () => {
    expect(router.routes).toHaveLength(1);

    const rootRoute = router.routes[0];
    expect(rootRoute).toBeDefined();
    expect(rootRoute?.children).toBeDefined();

    const paths = rootRoute?.children?.map((r) => r.path);
    expect(paths).toContain("/cart");
    expect(paths).toContain("/checkout");
    expect(paths).toContain("/checkout/payment");
    expect(paths).toContain("/checkout/success");
    expect(paths).toContain("*");
  });
});
