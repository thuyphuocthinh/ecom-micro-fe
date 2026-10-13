import { afterEach, describe, expect, it, vi } from "vitest";
import { createSession } from "./session";

function fakeStorage() {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  };
}

afterEach(() => vi.unstubAllGlobals());

describe("session", () => {
  it("keeps both tokens in localStorage", () => {
    const storage = fakeStorage();
    vi.stubGlobal("localStorage", storage);
    const session = createSession();

    session.set({ accessToken: "A", refreshToken: "R" });

    expect([...storage.data.values()].sort()).toEqual(["A", "R"]);
    expect(session.getAccessToken()).toBe("A");
    expect(session.getRefreshToken()).toBe("R");
  });

  it("stays logged in after a reload: a new session finds both tokens", () => {
    const storage = fakeStorage();
    vi.stubGlobal("localStorage", storage);
    createSession().set({ accessToken: "A", refreshToken: "R" });

    const afterReload = createSession();

    expect(afterReload.getAccessToken()).toBe("A");
    expect(afterReload.getRefreshToken()).toBe("R");
  });

  it("sees the tokens another tab renewed or cleared", () => {
    const storage = fakeStorage();
    vi.stubGlobal("localStorage", storage);
    const tabA = createSession();
    const tabB = createSession();
    tabA.set({ accessToken: "A1", refreshToken: "R1" });

    tabB.set({ accessToken: "A2", refreshToken: "R2" }); // tab B renewed the login
    expect(tabA.getAccessToken()).toBe("A2");
    expect(tabA.getRefreshToken()).toBe("R2");

    tabB.clear(); // tab B logged out
    expect(tabA.getAccessToken()).toBeNull();
    expect(tabA.getRefreshToken()).toBeNull();
  });

  it("clear removes both tokens, in memory and in localStorage", () => {
    const storage = fakeStorage();
    vi.stubGlobal("localStorage", storage);
    const session = createSession();
    session.set({ accessToken: "A", refreshToken: "R" });

    session.clear();

    expect(session.getAccessToken()).toBeNull();
    expect(session.getRefreshToken()).toBeNull();
    expect(storage.data.size).toBe(0);
  });

  it("still works when localStorage is blocked, keeping both tokens in memory", () => {
    const blocked = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };
    vi.stubGlobal("localStorage", blocked);
    const session = createSession();

    expect(() =>
      session.set({ accessToken: "A", refreshToken: "R" }),
    ).not.toThrow();
    expect(session.getAccessToken()).toBe("A");
    expect(session.getRefreshToken()).toBe("R");
    expect(() => session.clear()).not.toThrow();
    expect(session.getAccessToken()).toBeNull();
    expect(session.getRefreshToken()).toBeNull();
  });

  it("calls every listener when the login expires, and stops after unsubscribing", () => {
    const session = createSession();
    const first = vi.fn();
    const second = vi.fn();
    session.onExpired(first);
    const stop = session.onExpired(second);

    session.notifyExpired();
    stop();
    session.notifyExpired();

    expect(first).toHaveBeenCalledTimes(2);
    expect(second).toHaveBeenCalledTimes(1);
  });
});
