"use client";

import { use } from "react";
import Link from "next/link";
import { useJob } from "@/lib/client/hooks";
import { StatusBadge } from "@/components/status-badge";

// The header (title, source URL, status badge, loading and not-found states) is provided.
//
// ---------------------------------------------------------------------------
// TASK 5 — TODO(candidate): build the run panel where the placeholder is.
// ---------------------------------------------------------------------------
//
// This is the most substantial screen in the exercise. Build it in this order:
//
//   1. A "Start encode" button that calls the provided useStartRun(job.id) mutation and keeps
//      the returned `runId` in state. Disable it while a run is in flight.
//
//   2. Live progress, driven by your useRunPolling(runId) hook:
//        - the current stage (<StatusBadge value={run.stage} />),
//        - a percentage bar (<ProgressBar value={run.progressPct} />),
//        - the log — the messages collected so far, newest last.
//      A run takes about 12 seconds, so you'll see the whole thing without waiting long.
//
//   3. The FAILED case. Create a job with the source URL
//        https://cdn.example.com/videos/corrupt.mp4
//      and it will fail partway. Show the error message clearly (a red panel, `failed` on the
//      progress bar) and offer a Retry that starts a fresh run.
//
//   4. The COMPLETED case. `run.result` arrives with the final poll: show the duration and a
//      small table of renditions (label / resolution / size). Plain and readable beats fancy.
//
// A note on state: at any moment this screen is in exactly one of — idle, running, failed,
// completed. Try to make that explicit in how you write it, rather than juggling several
// booleans that could contradict each other (`isRunning && isFailed` should be impossible to
// express, not merely unlikely). Say what you chose in the README.
//
// We are NOT grading visual design. Correct behaviour and readable code are what count.
export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const jobQuery = useJob(id);

  if (jobQuery.isLoading) {
    return <p className="text-sm text-neutral-500">Loading job…</p>;
  }

  if (jobQuery.isError || !jobQuery.data) {
    return (
      <div className="text-sm text-red-600">
        Job not found.{" "}
        <Link href="/jobs" className="underline">
          Back to jobs
        </Link>
      </div>
    );
  }

  const job = jobQuery.data;

  return (
    <div className="space-y-6">
      <Link href="/jobs" className="text-sm text-neutral-500 hover:underline">
        ← All jobs
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold">{job.title}</h1>
          <p className="truncate text-sm text-neutral-500">{job.sourceUrl}</p>
        </div>
        <StatusBadge value={job.status} />
      </div>

      <p className="rounded-md border border-dashed border-neutral-300 p-4 text-sm text-neutral-500">
        TODO(candidate): Start encode button, live progress, log, failure + retry, and the results
        table.
      </p>
    </div>
  );
}
