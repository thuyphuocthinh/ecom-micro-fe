import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getGoogleClientId,
  loadGoogleScript,
  resetGoogleScriptPromiseForTests,
} from "./google-auth.ts";

describe("google-auth utility", () => {
  beforeEach(() => {
    resetGoogleScriptPromiseForTests();
    document
      .querySelectorAll('script[src*="gsi/client"]')
      .forEach((el) => el.remove());
    delete (window as unknown as { google?: unknown }).google;
  });

  afterEach(() => {
    resetGoogleScriptPromiseForTests();
    document
      .querySelectorAll('script[src*="gsi/client"]')
      .forEach((el) => el.remove());
    delete (window as unknown as { google?: unknown }).google;
  });

  it("returns client ID from environment or empty string", () => {
    const clientId = getGoogleClientId();
    expect(typeof clientId).toBe("string");
  });

  it("resolves immediately if window.google.accounts.id is already present", async () => {
    (window as unknown as { google: unknown }).google = {
      accounts: {
        id: {
          initialize: vi.fn(),
          renderButton: vi.fn(),
        },
      },
    };

    const promise = loadGoogleScript();
    await expect(promise).resolves.toBeUndefined();
    expect(
      document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]',
      ),
    ).toBeNull();
  });

  it("appends script tag and resolves on load", async () => {
    const promise = loadGoogleScript();

    const script = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    expect(script).not.toBeNull();
    expect(script?.async).toBe(true);

    // Simulate script load event
    script?.dispatchEvent(new Event("load"));

    await expect(promise).resolves.toBeUndefined();
  });

  it("reuses existing promise when called multiple times concurrently", () => {
    const p1 = loadGoogleScript();
    const p2 = loadGoogleScript();
    expect(p1).toBe(p2);

    const scripts = document.querySelectorAll(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    expect(scripts.length).toBe(1);
  });

  it("rejects and resets cached promise when script fails to load", async () => {
    const promise = loadGoogleScript();

    const script = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    script?.dispatchEvent(new Event("error"));

    await expect(promise).rejects.toThrow("Failed to load Google script");

    // After failure, a new attempt should create a fresh promise
    const p2 = loadGoogleScript();
    expect(p2).not.toBe(promise);
  });
});
