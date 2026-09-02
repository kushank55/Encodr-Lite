// Shared contract types — used by both the API routes (server) and the React app (client).
// One source of truth for the API shape, imported by both sides. Nothing here needs changing;
// read it once and you'll understand the whole data model.

export type JobStatus = "NEW" | "RUNNING" | "COMPLETED" | "FAILED";

export type Stage = "QUEUED" | "DOWNLOADING" | "TRANSCODING" | "COMPLETED" | "FAILED";

/** The stages a run passes through while it's still working, in order. */
export const ACTIVE_STAGES = ["QUEUED", "DOWNLOADING", "TRANSCODING"] as const;

/** Stages a run can end on. Once a run is here, it never changes again. */
export const TERMINAL_STAGES = ["COMPLETED", "FAILED"] as const;

export function isTerminalStage(stage: Stage): boolean {
  return stage === "COMPLETED" || stage === "FAILED";
}

/**
 * The run timeline, in milliseconds since the run started.
 *
 * A run is a pure function of elapsed time — there are no background timers on the server.
 * When someone asks "what's the state of run X?", we look at the clock and work it out.
 * These numbers are given to you so your maths and our tests agree.
 *
 *   0 ─────── 2s ──────────── 6s ───────────── 12s
 *   │ QUEUED  │ DOWNLOADING   │ TRANSCODING    │ COMPLETED
 *                                    ↑
 *                              8s: the "corrupt" source fails here
 */
export const TIMELINE = {
  /** QUEUED runs from 0ms until this. */
  queuedEndsMs: 2_000,
  /** DOWNLOADING runs from queuedEndsMs until this. */
  downloadingEndsMs: 6_000,
  /** TRANSCODING runs from downloadingEndsMs until this, then the run is COMPLETED. */
  transcodingEndsMs: 12_000,
  /** A run with the "corrupt" source URL fails at this point (mid-TRANSCODING). */
  failAtMs: 8_000,
} as const;

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Job {
  id: string;
  title: string;
  sourceUrl: string;
  status: JobStatus;
  createdAt: string; // ISO string
  /** Set once the job has been run at least once. */
  latestRunId?: string;
}

export interface Rendition {
  label: string; // e.g. "1080p"
  width: number;
  height: number;
  sizeMb: number;
}

export interface EncodeResult {
  durationSec: number;
  renditions: Rendition[];
}

export interface EncodeRun {
  id: string;
  jobId: string;
  stage: Stage;
  /** 0–100. Should only ever move forwards. */
  progressPct: number;
  /** A human-readable line describing what's happening right now. */
  message: string;
  /** Set only when stage === "FAILED". */
  error?: string;
  /** Set only when stage === "COMPLETED". */
  result?: EncodeResult;
}
