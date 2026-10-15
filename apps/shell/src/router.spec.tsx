import { describe, it, expect } from "vitest";
import { router } from "./router.tsx";

describe("router configuration", () => {
  it("defines store routes with lazy loaded pages", () => {
    const storeRoute = router.routes[0];
    expect(storeRoute).toBeDefined();
    expect(storeRoute?.children).toBeDefined();

    const storePaths = storeRoute?.children?.map((r) => r.path);
    expect(storePaths).toContain("/");
    expect(storePaths).toContain("/search");
    expect(storePaths).toContain("/products/:id");
    expect(storePaths).toContain("/products");
    expect(storePaths).toContain("/account/orders/:id");
    expect(storePaths).toContain("/cart");
    expect(storePaths).toContain("/checkout");
    expect(storePaths).toContain("/checkout/payment");
    expect(storePaths).toContain("/checkout/success");
    expect(storePaths).toContain("*");

    const accountRoute = storeRoute?.children?.find(
      (r) => r.path === "/account",
    );
    expect(accountRoute?.children).toBeDefined();

    const accountPaths = accountRoute?.children?.map((r) => r.path);
    expect(accountPaths).toContain("profile");
    expect(accountPaths).toContain("addresses");
    expect(accountPaths).toContain("orders");
  });

  it("defines auth routes with lazy loaded pages", () => {
    const authRoute = router.routes[1];
    expect(authRoute).toBeDefined();
    expect(authRoute?.children).toBeDefined();

    const authPaths = authRoute?.children?.map((r) => r.path);
    expect(authPaths).toContain("/login");
    expect(authPaths).toContain("/register");
    expect(authPaths).toContain("/forgot-password");
  });
});
