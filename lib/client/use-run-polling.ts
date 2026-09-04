"use client";

import { useEffect, useRef, useState } from "react";
import { fetchRun } from "@/lib/client/hooks";
import { isTerminalStage, type EncodeRun } from "@/lib/types";

export interface RunPollingState {
  /** The latest run state we've received, or null before the first response. */
  run: EncodeRun | null;
  /** True while we're still asking the server for updates. */
  polling: boolean;
  /** A request failed (network, 404, …). Not the same thing as the RUN failing. */
  fetchError: string | null;
  /** Every message we've seen, oldest first — the log the UI renders. */
  log: string[];
}

const initialState: RunPollingState = {
  run: null,
  polling: false,
  fetchError: null,
  log: [],
};

const POLL_MS = 1_000;

/**
 * Poll GET /api/runs/:id about once a second until the run is COMPLETED or FAILED.
 *
 * Two cleanup problems, both handled:
 *   1. clearInterval / abort — stop future ticks and the in-flight fetch.
 *   2. `cancelled` — a fetch that already left the browser must not call setState
 *      after unmount (or after runId has changed).
 */
export function useRunPolling(runId: string | null, onFinished?: () => void): RunPollingState {
  const [state, setState] = useState<RunPollingState>(initialState);
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  useEffect(() => {
    if (!runId) {
      setState(initialState);
      return;
    }

    let cancelled = false;
    let reachedTerminal = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const abort = new AbortController();
    setState({ ...initialState, polling: true });

    function stop() {
      reachedTerminal = true;
      if (intervalId !== undefined) clearInterval(intervalId);
    }

    async function poll() {
      if (cancelled || reachedTerminal) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

      try {
        const run = await fetchRun(runId!, abort.signal);
        if (cancelled || reachedTerminal) return;

        setState((prev) => {
          const last = prev.log[prev.log.length - 1];
          const nextLog =
            run.message && run.message !== last ? [...prev.log, run.message] : prev.log;
          return {
            run,
            polling: !isTerminalStage(run.stage),
            fetchError: null,
            log: nextLog,
          };
        });

        if (isTerminalStage(run.stage)) {
          stop();
          onFinishedRef.current?.();
        }
      } catch (e) {
        if (cancelled || reachedTerminal) return;
        if (e instanceof DOMException && e.name === "AbortError") return;
        stop();
        setState((prev) => ({
          ...prev,
          polling: false,
          fetchError: e instanceof Error ? e.message : "Couldn’t fetch run status",
        }));
      }
    }

    void poll();
    intervalId = setInterval(() => void poll(), POLL_MS);

    function onVisibility() {
      if (document.visibilityState === "visible") void poll();
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      abort.abort();
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [runId]);

  return state;
}
