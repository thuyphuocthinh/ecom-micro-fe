import { describe, expect, it, vi } from "vitest";
import { ApiError } from "./errors";
import { createSession } from "./session";
import {
  bodyOf,
  failure,
  setup,
  success,
  type RecordedCall,
} from "./test-helpers";

const PATH = "/orders/{id}/events";
const isRefresh = (call: RecordedCall) => call.url.endsWith("/auth/refresh");

/** A stream answer: the chunks of the body, sent as text/event-stream. */
function streamOf(...chunks: string[]): Response {
  return new Response(bodyOf(chunks), {
    status: 200,
    headers: { "Content-Type": "text/event-stream" },
  });
}

/** A stream that breaks after its first chunk, like a connection that drops. */
function brokenStream(first: string): Response {
  const encoder = new TextEncoder();
  let sent = false;
  return new Response(
    new ReadableStream({
      pull(controller) {
        if (sent) {
          controller.error(new TypeError("network error"));
          return;
        }
        sent = true;
        controller.enqueue(encoder.encode(first));
      },
    }),
    { status: 200, headers: { "Content-Type": "text/event-stream" } },
  );
}

function collect() {
  const messages: [string, unknown][] = [];
  return {
    messages,
    onMessage: (event: string, data: unknown) => messages.push([event, data]),
  };
}

describe("api.stream sends the request (AC-2)", () => {
  it("asks for a stream with the token, on the path with its parameters filled", async () => {
    const session = createSession();
    session.set({ accessToken: "tok", refreshToken: "R" });
    const { api, calls } = setup(() => streamOf(""), session);

    await api.stream(PATH, {
      params: { id: "o 1" },
      onMessage: () => undefined,
    });

    expect(calls).toHaveLength(1);
    expect(calls[0].method).toBe("GET");
    expect(calls[0].url).toBe("/api/v1/orders/o%201/events");
    expect(calls[0].headers.Authorization).toBe("Bearer tok");
    expect(calls[0].headers.Accept).toBe("text/event-stream");
  });
});

describe("api.stream gives the messages (AC-2)", () => {
  it("gives each message with its name and its data read as JSON, then resolves when the server closes", async () => {
    const { api } = setup(() =>
      streamOf(
        'event: status\ndata: {"orderId":"o1","status":"PENDING"}\n\n',
        "event: ping\ndata: {}\n\n",
        'event: status\ndata: {"orderId":"o1","status":"CONFIRMED"}\n\n',
      ),
    );
    const { messages, onMessage } = collect();

    await expect(
      api.stream(PATH, { params: { id: "o1" }, onMessage }),
    ).resolves.toBeUndefined();

    expect(messages).toEqual([
      ["status", { orderId: "o1", status: "PENDING" }],
      ["ping", {}],
      ["status", { orderId: "o1", status: "CONFIRMED" }],
    ]);
  });

  it("gives messages as they arrive, before the stream is over", async () => {
    let finish: () => void = () => undefined;
    const encoder = new TextEncoder();
    const response = new Response(
      new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode('data: {"n":1}\n\n'));
          finish = () => controller.close();
        },
      }),
      { status: 200 },
    );
    const { api } = setup(() => response);
    const { messages, onMessage } = collect();

    const done = api.stream(PATH, { params: { id: "o1" }, onMessage });
    await vi.waitFor(() => expect(messages).toHaveLength(1));

    finish();
    await done;
    expect(messages).toEqual([["message", { n: 1 }]]);
  });

  it("skips a message whose data is not JSON and goes on", async () => {
    const { api } = setup(() =>
      streamOf("data: not json\n\n", 'data: {"ok":true}\n\n'),
    );
    const { messages, onMessage } = collect();

    await api.stream(PATH, { params: { id: "o1" }, onMessage });

    expect(messages).toEqual([["message", { ok: true }]]);
  });

  it("goes on when the listener throws", async () => {
    const { api } = setup(() => streamOf("data: 1\n\n", "data: 2\n\n"));
    const seen: unknown[] = [];

    await api.stream(PATH, {
      params: { id: "o1" },
      onMessage: (_event, data) => {
        seen.push(data);
        throw new Error("broken listener");
      },
    });

    expect(seen).toEqual([1, 2]);
  });
});

describe("api.stream failures (AC-3)", () => {
  it("throws the ApiError of an answer that is not a stream, and does not report it", async () => {
    const { api } = setup(() => failure(404, "ORD-002", "Order not found"));
    const reported = vi.fn();
    api.onError(reported);

    const error = await api
      .stream(PATH, { params: { id: "o1" }, onMessage: () => undefined })
      .catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(404);
    expect(error.code).toBe("ORD-002");
    expect(error.userMessage).toEqual(expect.any(String));
    expect(reported).not.toHaveBeenCalled();
  });

  it("throws a network error when the server cannot be reached, and does not report it", async () => {
    const { api } = setup(() => new TypeError("failed to fetch"));
    const reported = vi.fn();
    api.onError(reported);

    const error = await api
      .stream(PATH, { params: { id: "o1" }, onMessage: () => undefined })
      .catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(0);
    expect(reported).not.toHaveBeenCalled();
  });

  it("throws a network error when the connection breaks in the middle, after giving what came before", async () => {
    const { api } = setup(() => brokenStream('data: {"n":1}\n\n'));
    const { messages, onMessage } = collect();

    const error = await api
      .stream(PATH, { params: { id: "o1" }, onMessage })
      .catch((e) => e);

    expect(messages).toEqual([["message", { n: 1 }]]);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(0);
  });

  it("throws when the answer has no body", async () => {
    const { api } = setup(() => new Response(null, { status: 204 }));

    const error = await api
      .stream(PATH, { params: { id: "o1" }, onMessage: () => undefined })
      .catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
  });

  it("returns quietly when it is cancelled, before it starts or in the middle", async () => {
    const before = new AbortController();
    before.abort();
    const { api: first } = setup(() => {
      throw new DOMException("aborted", "AbortError");
    });
    await expect(
      first.stream(PATH, {
        params: { id: "o1" },
        signal: before.signal,
        onMessage: () => undefined,
      }),
    ).resolves.toBeUndefined();

    const during = new AbortController();
    const { api: second } = setup(() => brokenStream('data: {"n":1}\n\n'));
    await expect(
      second.stream(PATH, {
        params: { id: "o1" },
        signal: during.signal,
        onMessage: () => during.abort(),
      }),
    ).resolves.toBeUndefined();
  });
});

describe("api.stream and an expired token (AC-4)", () => {
  it("renews the tokens once and opens the stream again with the new one", async () => {
    const session = createSession();
    session.set({ accessToken: "old", refreshToken: "R1" });
    const { api, calls } = setup((call) => {
      if (isRefresh(call))
        return success({ accessToken: "new", refreshToken: "R2" });
      return call.headers.Authorization === "Bearer new"
        ? streamOf('data: {"ok":true}\n\n')
        : failure(401, "AUTH-002", "Token has expired");
    }, session);
    const { messages, onMessage } = collect();

    await api.stream(PATH, { params: { id: "o1" }, onMessage });

    expect(calls.map((call) => `${call.method} ${call.url}`)).toEqual([
      "GET /api/v1/orders/o1/events",
      "POST /api/v1/auth/refresh",
      "GET /api/v1/orders/o1/events",
    ]);
    expect(messages).toEqual([["message", { ok: true }]]);
    expect(session.getAccessToken()).toBe("new");
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

    const error = await api
      .stream(PATH, { params: { id: "o1" }, onMessage: () => undefined })
      .catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(calls.filter(isRefresh)).toHaveLength(1);
  });

  it("throws the first error and ends the login when the tokens cannot be renewed", async () => {
    const session = createSession();
    session.set({ accessToken: "old", refreshToken: "R1" });
    const expired = vi.fn();
    session.onExpired(expired);
    const { api } = setup(
      (call) =>
        isRefresh(call) ? failure(401, "AUTH-003") : failure(401, "AUTH-002"),
      session,
    );

    const error = await api
      .stream(PATH, { params: { id: "o1" }, onMessage: () => undefined })
      .catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe("AUTH-002");
    expect(session.getAccessToken()).toBeNull();
    expect(expired).toHaveBeenCalled();
  });
});
