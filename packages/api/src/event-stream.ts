/** One message of a server-sent-events stream: the name after `event:` (or "message") and the text after `data:`. */
export interface ServerSentEvent {
  event: string;
  data: string;
}

/**
 * Reads a server-sent-events body and gives its messages one by one, as they arrive.
 *
 * The format (https://html.spec.whatwg.org/multipage/server-sent-events.html): lines of `field: value`,
 * a blank line ends a message; a line starting with `:` is a comment (a keep-alive); `data:` lines of one
 * message are joined with a line break; a message without `data:` is not given; fields other than
 * `event` and `data` (`id`, `retry`) are ignored.
 *
 * The chunks can end anywhere: in the middle of a line, between the `\r` and the `\n` of a line end, or
 * in the middle of a character of UTF-8. A message that is still unfinished when the stream closes is
 * dropped, as the format says.
 */
export async function* readEventStream(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<ServerSentEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let pending = ""; // the start of a line that has not ended yet
  let carriedReturn: boolean = false; // a `\r` that may be the first half of `\r\n`
  let eventName = "";
  let dataLines: string[] = [];

  function* handle(line: string): Generator<ServerSentEvent> {
    if (line === "") {
      if (dataLines.length > 0) {
        yield { event: eventName || "message", data: dataLines.join("\n") };
      }
      eventName = "";
      dataLines = [];
      return;
    }
    if (line.startsWith(":")) return;
    const colon = line.indexOf(":");
    const field = colon === -1 ? line : line.slice(0, colon);
    let value = colon === -1 ? "" : line.slice(colon + 1);
    if (value.startsWith(" ")) value = value.slice(1);
    if (field === "event") eventName = value;
    else if (field === "data") dataLines.push(value);
  }

  try {
    for (;;) {
      const chunk: ReadableStreamReadResult<Uint8Array> = await reader.read();
      if (chunk.done) {
        // A carriage return held back at the very end was a line end after all
        if (carriedReturn) yield* handle(pending);
        return;
      }

      let text: string =
        (carriedReturn ? "\r" : "") +
        decoder.decode(chunk.value, { stream: true });
      carriedReturn = text.endsWith("\r");
      if (carriedReturn) text = text.slice(0, -1);

      const lines = (pending + text).split(/\r\n|\n|\r/);
      pending = lines.pop() ?? "";
      for (const line of lines) yield* handle(line);
    }
  } finally {
    // The reader stops early when the caller stops asking (or the stream failed): let the connection go
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}
