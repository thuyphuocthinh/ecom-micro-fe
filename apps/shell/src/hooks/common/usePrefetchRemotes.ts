import { useEffect } from "react";
import { remotePrefetcher } from "@/libs/remote-loaders.ts";
import { whenIdle } from "@/utils/idle.ts";

/** Once the page is drawn and the browser is idle, loads the code of the other apps' pages ahead of time. */
export function usePrefetchRemotes(): void {
  useEffect(
    () =>
      whenIdle(() => {
        void remotePrefetcher.prefetchAll();
      }),
    [],
  );
}
