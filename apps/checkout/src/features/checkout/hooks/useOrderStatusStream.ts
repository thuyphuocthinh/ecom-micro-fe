import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@ecom/api";
import { queryKeys } from "@/constants/queryKeys.ts";
import {
  FALLBACK_POLL_MS,
  abortableDelay,
  isRetryable,
  nextRetryDelay,
} from "../utils/stream-retry.ts";

/** A message of the stream that says an order is in a status (the stream also sends `ping`s). */
function isStatusMessage(event: string, data: unknown, orderId: string) {
  if (event !== "status" || !data || typeof data !== "object") return false;
  const message = data as Record<string, unknown>;
  return message.orderId === orderId && typeof message.status === "string";
}

/**
 * Listens to the status of an order, so the page does not have to ask for it again and again.
 *
 * It keeps the stream `GET /orders/:id/events` open while `enabled`. Every status message (the first
 * one is the status at the moment of opening, which also covers a change between the page's own first
 * read and the opening of the stream) makes the order and its payments be read again, once. The
 * message is only a hint to read again: the data stays where it always was.
 *
 * If the stream drops it is opened again after 1, 2, 4, 8, then 15 seconds. While it is not working
 * (dropped, or refused for good) the order is read every 30 seconds instead, and that stops as soon as
 * a message arrives. It closes when `enabled` turns false or the page goes away.
 *
 * Returns whether messages are arriving now.
 */
export function useOrderStatusStream(
  orderId: string | undefined,
  enabled: boolean,
): { live: boolean } {
  const queryClient = useQueryClient();
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!orderId || !enabled) return;

    const controller = new AbortController();
    const { signal } = controller;
    let fallback: ReturnType<typeof setInterval> | undefined;

    const readAgain = (keys: "both" | "order") => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.checkout.order(orderId),
      });
      if (keys === "both") {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.checkout.payments(orderId),
        });
      }
    };
    const startFallback = () => {
      if (!fallback) {
        fallback = setInterval(() => readAgain("order"), FALLBACK_POLL_MS);
      }
    };
    const stopFallback = () => {
      clearInterval(fallback);
      fallback = undefined;
    };

    void (async () => {
      let failures = 0;
      while (!signal.aborted) {
        try {
          await api.stream("/orders/{id}/events", {
            params: { id: orderId },
            signal,
            onMessage: (event, data) => {
              if (!isStatusMessage(event, data, orderId)) return;
              failures = 0;
              stopFallback();
              setLive(true);
              readAgain("both");
            },
          });
        } catch (error) {
          if (!isRetryable(error)) {
            // The server will not change its answer: ask now and then, and stop trying
            if (!signal.aborted) {
              setLive(false);
              startFallback();
            }
            return;
          }
        }
        if (signal.aborted) return;

        // The stream ended or broke: ask now and then until it is back
        setLive(false);
        startFallback();
        await abortableDelay(nextRetryDelay(failures), signal);
        failures += 1;
      }
    })();

    return () => {
      controller.abort();
      stopFallback();
      setLive(false);
    };
  }, [orderId, enabled, queryClient]);

  return { live };
}
