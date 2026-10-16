import { describe, expect, it } from "vitest";
import { readEventStream, type ServerSentEvent } from "./event-stream";
import { bodyOf } from "./test-helpers";

const encoder = new TextEncoder();

async function read(
  chunks: (string | Uint8Array)[],
): Promise<ServerSentEvent[]> {
  const events: ServerSentEvent[] = [];
  for await (const event of readEventStream(bodyOf(chunks))) events.push(event);
  return events;
}

/** The same bytes cut into pieces of `size` bytes: a chunk can end anywhere, even inside a character. */
function inPieces(text: string, size: number): Uint8Array[] {
  const bytes = encoder.encode(text);
  const pieces: Uint8Array[] = [];
  for (let at = 0; at < bytes.length; at += size)
    pieces.push(bytes.slice(at, at + size));
  return pieces;
}

describe("readEventStream (AC-1)", () => {
  it("reads messages with their name and data", async () => {
    const events = await read([
      'event: status\ndata: {"status":"PENDING"}\n\nevent: ping\ndata: {}\n\n',
    ]);

    expect(events).toEqual([
      { event: "status", data: '{"status":"PENDING"}' },
      { event: "ping", data: "{}" },
    ]);
  });

  it("gives the same messages however the bytes are cut, down to one byte at a time", async () => {
    const text =
      ': hello\r\nevent: status\r\ndata: {"tên":"Đơn hàng ✓"}\r\n\r\n' +
      "data: một\ndata: hai\n\n" +
      "event: ping\rdata: {}\r\r";
    const expected = await read([text]);
    expect(expected).toHaveLength(3);

    for (let size = 1; size <= text.length; size += 1) {
      expect(await read(inPieces(text, size))).toEqual(expected);
    }
  });

  it("does not split a message when a \\r\\n is cut between the \\r and the \\n", async () => {
    const events = await read(["data: a\r", "\ndata: b\r\n\r", "\n"]);

    expect(events).toEqual([{ event: "message", data: "a\nb" }]);
  });

  it("ignores comment lines, which are how a server keeps the connection alive", async () => {
    expect(await read([": ping\n\n: again\ndata: x\n\n"])).toEqual([
      { event: "message", data: "x" },
    ]);
  });

  it("joins several data lines with a line break", async () => {
    expect(await read(["data: one\ndata: two\ndata:\ndata: four\n\n"])).toEqual(
      [{ event: "message", data: "one\ntwo\n\nfour" }],
    );
  });

  it("names a message without an event line `message`", async () => {
    expect(await read(["data: x\n\n"])).toEqual([
      { event: "message", data: "x" },
    ]);
  });

  it("does not carry the event name over to the next message", async () => {
    expect(await read(["event: a\ndata: 1\n\ndata: 2\n\n"])).toEqual([
      { event: "a", data: "1" },
      { event: "message", data: "2" },
    ]);
  });

  it("ignores fields it does not use, and does not give a message that has no data", async () => {
    expect(
      await read([
        "id: 7\nretry: 1000\nevent: lonely\n\nfoo: bar\ndata: kept\n\n",
      ]),
    ).toEqual([{ event: "message", data: "kept" }]);
  });

  it("takes only the first space after the colon away, and keeps colons in the value", async () => {
    expect(
      await read(["data:  two spaces: and a colon\n\n", "data:none\n\n"]),
    ).toEqual([
      { event: "message", data: " two spaces: and a colon" },
      { event: "message", data: "none" },
    ]);
  });

  it("treats a line with no colon as a field with an empty value", async () => {
    expect(await read(["data\n\n"])).toEqual([{ event: "message", data: "" }]);
  });

  it("drops a message that is still unfinished when the stream closes", async () => {
    expect(await read(["data: whole\n\ndata: half"])).toEqual([
      { event: "message", data: "whole" },
    ]);
    expect(await read(["data: no blank line yet\n"])).toEqual([]);
  });

  it("gives nothing for an empty stream", async () => {
    expect(await read([])).toEqual([]);
  });

  it("lets go of the connection when the caller stops early", async () => {
    let cancelled = false;
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        controller.enqueue(encoder.encode("data: x\n\n"));
      },
      cancel() {
        cancelled = true;
      },
    });

    for await (const event of readEventStream(body)) {
      expect(event.data).toBe("x");
      break;
    }

    expect(cancelled).toBe(true);
  });
});
