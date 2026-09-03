import { describe, expect, it } from "vitest";
import { computeRun, FAIL_URL, type RunRecord } from "@/lib/server/store";
import { TIMELINE } from "@/lib/types";

// Written before computeRun() itself — these are the stage boundaries from BRIEF.md / TIMELINE.
// If someone later shifts a constant or an inequality, one of these should fail.

const STARTED_AT = 1_000_000;

function record(sourceUrl = "https://cdn.example.com/videos/clip.mp4"): RunRecord {
  return { id: "r_test", jobId: "j_test", sourceUrl, startedAt: STARTED_AT };
}

function at(elapsedMs: number, sourceUrl?: string) {
  return computeRun(record(sourceUrl), STARTED_AT + elapsedMs);
}

describe("computeRun", () => {
  it("is QUEUED from 0ms up to (but not including) queuedEndsMs", () => {
    expect(at(0).stage).toBe("QUEUED");
    expect(at(TIMELINE.queuedEndsMs - 1).stage).toBe("QUEUED");
    expect(at(0).progressPct).toBe(0);
    expect(at(0).result).toBeUndefined();
    expect(at(0).error).toBeUndefined();
  });

  it("becomes DOWNLOADING exactly at queuedEndsMs", () => {
    expect(at(TIMELINE.queuedEndsMs).stage).toBe("DOWNLOADING");
    expect(at(TIMELINE.downloadingEndsMs - 1).stage).toBe("DOWNLOADING");
  });

  it("becomes TRANSCODING exactly at downloadingEndsMs", () => {
    expect(at(TIMELINE.downloadingEndsMs).stage).toBe("TRANSCODING");
    expect(at(TIMELINE.transcodingEndsMs - 1).stage).toBe("TRANSCODING");
  });

  it("is COMPLETED at transcodingEndsMs with a result and 100% progress", () => {
    const run = at(TIMELINE.transcodingEndsMs);
    expect(run.stage).toBe("COMPLETED");
    expect(run.progressPct).toBe(100);
    expect(run.error).toBeUndefined();
    expect(run.result).toEqual({
      durationSec: 184,
      renditions: [
        { label: "1080p", width: 1920, height: 1080, sizeMb: 142.6 },
        { label: "720p", width: 1280, height: 720, sizeMb: 68.3 },
        { label: "480p", width: 854, height: 480, sizeMb: 24.1 },
      ],
    });
  });

  it("fails at failAtMs when the source is the corrupt URL, and stays failed", () => {
    expect(at(TIMELINE.failAtMs - 1, FAIL_URL).stage).toBe("TRANSCODING");

    const failed = at(TIMELINE.failAtMs, FAIL_URL);
    expect(failed.stage).toBe("FAILED");
    expect(failed.error).toBeTruthy();
    expect(failed.result).toBeUndefined();

    const later = at(TIMELINE.transcodingEndsMs, FAIL_URL);
    expect(later.stage).toBe("FAILED");
    expect(later.progressPct).toBe(failed.progressPct);
  });

  it("does not fail a healthy URL at failAtMs", () => {
    expect(at(TIMELINE.failAtMs).stage).toBe("TRANSCODING");
  });
});
