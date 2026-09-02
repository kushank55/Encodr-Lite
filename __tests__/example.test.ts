import { describe, expect, it } from "vitest";
import { isTerminalStage, TIMELINE } from "@/lib/types";

// This file exists so you can confirm the test setup works: `npm run test:run`.
//
// It's also the pattern to copy. A test is three lines of thinking:
//   1. arrange — set up the inputs,
//   2. act — call the thing,
//   3. assert — say what you expected.
//
// Task 6 asks for a handful of your own. Delete this file once you have real ones.

describe("test harness", () => {
  it("runs", () => {
    expect(isTerminalStage("COMPLETED")).toBe(true);
    expect(isTerminalStage("QUEUED")).toBe(false);
    expect(TIMELINE.transcodingEndsMs).toBe(12_000);
  });
});
