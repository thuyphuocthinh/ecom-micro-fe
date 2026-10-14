import { describe, expect, it, vi } from "vitest";
import { createSession } from "./session";
import { failure, setup, success, type RecordedCall } from "./test-helpers";

const isRefresh = (call: RecordedCall) => call.url.endsWith("/auth/refresh");

describe("an expired access token (AC-5)", () => {
  it("renews the tokens and sends the same request again, once", async () => {
    const session = createSession();
    session.set({ accessToken: "old", refreshToken: "R1" });
    const { api, calls } = setup((call) => {
      if (isRefresh(call))
        return success({ accessToken: "new", refreshToken: "R2" });
      return call.headers.Authorization === "Bearer new"
        ? success([{ id: "o1" }])
        : failure(401, "AUTH-002", "Token has expired");
    }, session);

    const result = await api.get("/orders");

    expect(result.data).toEqual([{ id: "o1" }]);
    expect(calls.map((call) => `${call.method} ${call.url}`)).toEqual([
      "GET /api/v1/orders",
      "POST /api/v1/auth/refresh",
      "GET /api/v1/orders",
    ]);
    expect(calls[1].body).toEqual({ refreshToken: "R1" });
    expect(calls[1].headers.Authorization).toBeUndefined();
    expect(session.getAccessToken()).toBe("new");
    expect(session.getRefreshToken()).toBe("R2");
  });

  it("does not renew a second time when the new token is refused too", async () => {
    const session = createSession();
    session.set({ accessToken: "old", refreshToken: "R1" });
    const { api, calls } = setup(
      (call) =>
        isRefresh(call)
          ? success({ accessToken: "new", refreshToken: "R2" })
          : failure(401, "AUTH-002"),
      session,
    );

    const error = await api.get("/orders").catch((e) => e);

    expect(error).toMatchObject({ status: 401, code: "AUTH-002" });
    expect(calls.filter(isRefresh)).toHaveLength(1);
    expect(calls).toHaveLength(3);
  });
});

describe("many calls expiring together (AC-6)", () => {
  it("renews once and every call is sent again with the new token", async () => {
    const session = createSession();
    session.set({ accessToken: "old", refreshToken: "R1" });
    const { api, calls } = setup(async (call) => {
      if (isRefresh(call)) {
        await new Promise((resolve) => setTimeout(resolve, 20)); // slow enough for the others to pile up
        return success({ accessToken: "new", refreshToken: "R2" });
      }
      return call.headers.Authorization === "Bearer new"
        ? success({ ok: true })
        : failure(401, "AUTH-002");
    }, session);

    const results = await Promise.all(
      Array.from({ length: 5 }, () => api.get("/cart")),
    );

    expect(results.map((result) => result.data)).toEqual(
      Array(5).fill({ ok: true }),
    );
    expect(calls.filter(isRefresh)).toHaveLength(1);
    expect(
      calls.filter((call) => call.headers.Authorization === "Bearer new"),
    ).toHaveLength(5);
  });
});

describe("a login that cannot be renewed (AC-7)", () => {
  it("clears the tokens, tells the shell once, and throws the first 401", async () => {
    const session = createSession();
    session.set({ accessToken: "old", refreshToken: "R1" });
    const expired = vi.fn();
    session.onExpired(expired);
    const { api, calls } = setup(
      (call) =>
        isRefresh(call)
          ? failure(401, "AUTH-003", "Token has been revoked")
          : failure(401, "AUTH-002", "Token has expired"),
      session,
    );

    const errors = await Promise.all([
      api.get("/orders").catch((e) => e),
      api.get("/cart").catch((e) => e),
    ]);

    expect(errors.map((error) => error.code)).toEqual(["AUTH-002", "AUTH-002"]);
    expect(session.getAccessToken()).toBeNull();
    expect(session.getRefreshToken()).toBeNull();
    expect(expired).toHaveBeenCalledTimes(1);
    expect(calls.filter(isRefresh)).toHaveLength(1);
  });

  it("gives up at once when there is no refresh token", async () => {
    const session = createSession();
    const expired = vi.fn();
    session.onExpired(expired);
    const { api, calls } = setup(() => failure(401, "AUTH-002"), session);

    await expect(api.get("/orders")).rejects.toMatchObject({
      code: "AUTH-002",
    });

    expect(calls.filter(isRefresh)).toHaveLength(0);
    expect(expired).toHaveBeenCalledTimes(1);
  });

  it("does not try to renew, nor end the login, for a wrong password (AUTH-001)", async () => {
    const session = createSession();
    session.set({ accessToken: "t", refreshToken: "R1" });
    const expired = vi.fn();
    session.onExpired(expired);
    const { api, calls } = setup(() => failure(401, "AUTH-001"), session);

    await expect(api.get("/orders")).rejects.toMatchObject({
      code: "AUTH-001",
    });

    expect(calls).toHaveLength(1);
    expect(expired).not.toHaveBeenCalled();
    expect(session.getAccessToken()).toBe("t");
  });

  it.each(["AUTH-003", "AUTH-004"])(
    "does not try to renew a token the backend refuses outright (%s)",
    async (code) => {
      const session = createSession();
      session.set({ accessToken: "t", refreshToken: "R1" });
      const { api, calls } = setup(() => failure(401, code), session);

      await expect(api.get("/orders")).rejects.toMatchObject({ code });

      expect(calls).toHaveLength(1); // no /auth/refresh
    },
  );

  it("treats a network failure while renewing as a lost login", async () => {
    const session = createSession();
    session.set({ accessToken: "old", refreshToken: "R1" });
    const expired = vi.fn();
    session.onExpired(expired);
    const { api } = setup(
      (call) =>
        isRefresh(call)
          ? new TypeError("Failed to fetch")
          : failure(401, "AUTH-002"),
      session,
    );

    await expect(api.get("/orders")).rejects.toMatchObject({
      code: "AUTH-002",
    });

    expect(expired).toHaveBeenCalledTimes(1);
  });
});
