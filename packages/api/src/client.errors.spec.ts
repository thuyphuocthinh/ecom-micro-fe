import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "./errors";
import { createSession } from "./session";
import { failure, setup, success } from "./test-helpers";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

function listenTo(api: ReturnType<typeof setup>["api"]) {
  const listener = vi.fn<(error: ApiError) => void>();
  api.onError(listener);
  return listener;
}

describe("every failure is reported once, in one place (AC-14)", () => {
  it("calls the listener once with the ApiError, and the call still throws it", async () => {
    const { api } = setup(() => failure(409, "ORD-001"));
    const listener = listenTo(api);

    const error = await api
      .post("/orders", {
        body: { addressId: "a", paymentMethod: "COD" },
        idempotencyKey: "key-12345678",
      })
      .catch((e) => e);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0]).toBe(error);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.userMessage).toContain("không còn đủ hàng");
  });

  it.each([
    ["a lost connection", () => new TypeError("Failed to fetch")],
    [
      "an answer that is not JSON",
      () => new Response("<html>", { status: 502 }),
    ],
  ])("reports %s", async (_name, reply) => {
    const { api } = setup(reply);
    const listener = listenTo(api);

    await api.get("/cart").catch(() => undefined);

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("reports nothing for a call that succeeds", async () => {
    const { api } = setup(() => success([]));
    const listener = listenTo(api);

    await api.get("/orders");

    expect(listener).not.toHaveBeenCalled();
  });
});

describe("what is not an error (AC-19)", () => {
  it("does not report a cancelled call", async () => {
    const { api } = setup(() => new DOMException("aborted", "AbortError"));
    const listener = listenTo(api);

    await api.get("/cart").catch(() => undefined);

    expect(listener).not.toHaveBeenCalled();
  });

  it("does not report an expired token that was renewed and the call then worked", async () => {
    const session = createSession();
    session.set({ accessToken: "old", refreshToken: "R1" });
    const { api } = setup(
      (call) =>
        call.url.endsWith("/auth/refresh")
          ? success({ accessToken: "new", refreshToken: "R2" })
          : call.headers.Authorization === "Bearer new"
            ? success([])
            : failure(401, "AUTH-002"),
      session,
    );
    const listener = listenTo(api);

    await api.get("/orders");

    expect(listener).not.toHaveBeenCalled();
  });

  it("reports the failure of the second try once, when the renewed call fails too", async () => {
    const session = createSession();
    session.set({ accessToken: "old", refreshToken: "R1" });
    const { api } = setup(
      (call) =>
        call.url.endsWith("/auth/refresh")
          ? success({ accessToken: "new", refreshToken: "R2" })
          : call.headers.Authorization === "Bearer new"
            ? failure(409, "ORD-001")
            : failure(401, "AUTH-002"),
      session,
    );
    const listener = listenTo(api);

    await api.get("/orders").catch(() => undefined);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].code).toBe("ORD-001");
  });
});

describe("a call that handles the failure itself (AC-20)", () => {
  it("is not reported with silent: true, but still throws", async () => {
    const { api } = setup(() => failure(500, "SYS-001"));
    const listener = listenTo(api);

    const error = await api.get("/users/me", { silent: true }).catch((e) => e);

    expect(listener).not.toHaveBeenCalled();
    expect(error).toBeInstanceOf(ApiError);
  });
});

describe("a login that is over (AC-21)", () => {
  it("is not reported when the token expired and could not be renewed", async () => {
    const session = createSession();
    session.set({ accessToken: "old", refreshToken: "R1" });
    const expired = vi.fn();
    session.onExpired(expired);
    const { api } = setup(
      (call) =>
        call.url.endsWith("/auth/refresh")
          ? failure(401, "AUTH-003")
          : failure(401, "AUTH-002"),
      session,
    );
    const listener = listenTo(api);

    await api.get("/orders").catch(() => undefined);

    expect(listener).not.toHaveBeenCalled();
    expect(expired).toHaveBeenCalledTimes(1);
  });

  it.each(["AUTH-003", "AUTH-004"])(
    "ends the login once when a call with a token gets %s, however many calls fail together",
    async (code) => {
      const session = createSession();
      session.set({ accessToken: "t", refreshToken: "R1" });
      const expired = vi.fn();
      session.onExpired(expired);
      const { api } = setup(() => failure(401, code), session);
      const listener = listenTo(api);

      const errors = await Promise.all(
        Array.from({ length: 4 }, () => api.get("/orders").catch((e) => e)),
      );

      expect(errors.every((e) => e instanceof ApiError)).toBe(true);
      expect(session.getAccessToken()).toBeNull();
      expect(session.getRefreshToken()).toBeNull();
      expect(expired).toHaveBeenCalledTimes(1);
      expect(listener).not.toHaveBeenCalled();
    },
  );

  it("reports AUTH-004 for a visitor who sent no token, and keeps the session as it is", async () => {
    const session = createSession();
    const expired = vi.fn();
    session.onExpired(expired);
    const { api } = setup(() => failure(401, "AUTH-004"), session);
    const listener = listenTo(api);

    await api.get("/orders").catch(() => undefined);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].userMessage).toBe(
      "Bạn cần đăng nhập để tiếp tục.",
    );
    expect(expired).not.toHaveBeenCalled();
  });

  it("reports a wrong password (AUTH-001) as an ordinary error", async () => {
    const session = createSession();
    session.set({ accessToken: "t", refreshToken: "R1" });
    const expired = vi.fn();
    session.onExpired(expired);
    const { api } = setup(() => failure(401, "AUTH-001"), session);
    const listener = listenTo(api);

    await api
      .post("/auth/login", { body: { email: "a@b.c", password: "wrong-pass" } })
      .catch(() => undefined);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].userMessage).toBe(
      "Email hoặc mật khẩu chưa đúng.",
    );
    expect(expired).not.toHaveBeenCalled();
    expect(session.getAccessToken()).toBe("t");
  });
});

describe("the same failure is told once (AC-22)", () => {
  it("reports five identical failures as one, and again after three seconds", async () => {
    const { api } = setup(() => new TypeError("Failed to fetch"));
    const listener = listenTo(api);

    await Promise.all(
      Array.from({ length: 5 }, () => api.get("/cart").catch(() => undefined)),
    );
    expect(listener).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(2900);
    await api.get("/cart").catch(() => undefined);
    expect(listener).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(200); // 3.1 seconds since the first report
    await api.get("/cart").catch(() => undefined);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("does not hide a different failure", async () => {
    const { api } = setup((call) =>
      call.url.endsWith("/cart")
        ? new TypeError("Failed to fetch")
        : failure(404, "ORD-002"),
    );
    const listener = listenTo(api);

    await api.get("/cart").catch(() => undefined);
    await api
      .get("/orders/{id}", { params: { id: "x" } })
      .catch(() => undefined);

    expect(listener).toHaveBeenCalledTimes(2);
  });
});

describe("listeners (AC-23)", () => {
  it("a listener that throws changes nothing: the call throws its own error and the others are told", async () => {
    const { api } = setup(() => failure(404, "ORD-002"));
    api.onError(() => {
      throw new Error("broken listener");
    });
    const healthy = listenTo(api);

    const error = await api
      .get("/orders/{id}", { params: { id: "x" } })
      .catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe("ORD-002");
    expect(healthy).toHaveBeenCalledTimes(1);
  });

  it("stops telling a listener that was removed", async () => {
    const { api } = setup(() => failure(404, "ORD-002"));
    const listener = vi.fn();
    const stop = api.onError(listener);

    stop();
    await api
      .get("/orders/{id}", { params: { id: "x" } })
      .catch(() => undefined);

    expect(listener).not.toHaveBeenCalled();
  });
});
