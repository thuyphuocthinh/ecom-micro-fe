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
  it("keeps the access token in memory only and the refresh token in localStorage", () => {
    const storage = fakeStorage();
    vi.stubGlobal("localStorage", storage);
    const session = createSession();

    session.set({ accessToken: "A", refreshToken: "R" });

    expect([...storage.data.values()]).toEqual(["R"]);
    expect(session.getAccessToken()).toBe("A");
  });

  it("stays logged in after a reload: a new session finds the refresh token", () => {
    const storage = fakeStorage();
    vi.stubGlobal("localStorage", storage);
    createSession().set({ accessToken: "A", refreshToken: "R" });

    const afterReload = createSession();

    expect(afterReload.getAccessToken()).toBeNull();
    expect(afterReload.getRefreshToken()).toBe("R");
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

  it("still works when localStorage is blocked, keeping the refresh token in memory", () => {
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
    expect(session.getRefreshToken()).toBe("R");
    expect(() => session.clear()).not.toThrow();
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
