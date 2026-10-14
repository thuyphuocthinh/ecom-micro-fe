import { vi } from "vitest";
import { createApiClient } from "./client";
import { createSession, type Session } from "./session";

export interface RecordedCall {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
}

type Reply = Response | Error | Promise<Response>;

export function json(
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

export function success(
  data: unknown,
  meta?: unknown,
  status = 200,
  headers: Record<string, string> = {},
): Response {
  return json(
    status,
    {
      statusCode: status,
      message: "Success",
      data,
      ...(meta === undefined ? {} : { meta }),
    },
    headers,
  );
}

export function failure(
  status: number,
  code: string,
  message = "failed",
  extra: Record<string, unknown> = {},
): Response {
  return json(status, {
    statusCode: status,
    code,
    message,
    traceId: "trace-1",
    timestamp: "2026-10-13T00:00:00Z",
    ...extra,
  });
}

/** A client wired to a fake `fetch`: `reply` is asked for each call (in order) and every call is recorded. */
export function setup(
  reply: (call: RecordedCall, index: number) => Reply,
  session: Session = createSession(),
) {
  const calls: RecordedCall[] = [];
  const fakeFetch = vi.fn(
    async (url: string | URL | Request, init?: RequestInit) => {
      const call: RecordedCall = {
        url: String(url),
        method: init?.method ?? "GET",
        headers: { ...(init?.headers as Record<string, string> | undefined) },
        body:
          typeof init?.body === "string" ? JSON.parse(init.body) : init?.body,
      };
      calls.push(call);
      const result = await reply(call, calls.length - 1);
      if (result instanceof Error) throw result;
      return result;
    },
  );
  const api = createApiClient({
    baseUrl: "/api/v1",
    fetch: fakeFetch as unknown as typeof fetch,
    session,
  });
  return { api, calls, session, fakeFetch };
}
