"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useJob, useStartRun } from "@/lib/client/hooks";
import { useRunPolling } from "@/lib/client/use-run-polling";
import { StatusBadge } from "@/components/status-badge";
import { ProgressBar } from "@/components/progress-bar";
import type { EncodeRun, Job } from "@/lib/types";

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

  return (
    <JobDetail
      job={jobQuery.data}
      onRunFinished={() => {
        void jobQuery.refetch();
      }}
    />
  );
}

/**
 * The detail screen is in exactly one of these views, derived from the latest run:
 * idle (never started) | running | failed | completed.
 */
type RunView = "idle" | "running" | "failed" | "completed";

function viewFor(run: EncodeRun | null, runId: string | null): RunView {
  if (!runId) return "idle";
  if (run?.stage === "COMPLETED") return "completed";
  if (run?.stage === "FAILED") return "failed";
  return "running";
}

function JobDetail({ job, onRunFinished }: { job: Job; onRunFinished: () => void }) {
  const start = useStartRun(job.id);
  const [startedRunId, setStartedRunId] = useState<string | null>(null);
  const runId = startedRunId ?? job.latestRunId ?? null;
  const polling = useRunPolling(runId, onRunFinished);
  const view = viewFor(polling.run, runId);

  async function beginRun() {
    const { runId: nextId } = await start.mutateAsync();
    setStartedRunId(nextId);
  }

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

      {view === "idle" && (
        <StartButton
          busy={start.isPending}
          onClick={beginRun}
          error={start.error instanceof Error ? start.error.message : null}
        />
      )}

      {view === "running" && (
        <RunProgress run={polling.run} log={polling.log} fetchError={polling.fetchError} />
      )}

      {view === "failed" && polling.run && (
        <div className="space-y-4">
          <RunProgress run={polling.run} log={polling.log} fetchError={polling.fetchError} failed />
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <p className="font-medium">Encode failed</p>
            <p className="mt-1">{polling.run.error ?? "The run stopped before it finished."}</p>
          </div>
          <StartButton
            busy={start.isPending}
            onClick={beginRun}
            label="Retry"
            error={start.error instanceof Error ? start.error.message : null}
          />
        </div>
      )}

      {view === "completed" && polling.run?.result && (
        <div className="space-y-4">
          <RunProgress run={polling.run} log={polling.log} fetchError={polling.fetchError} />
          <RenditionsTable
            durationSec={polling.run.result.durationSec}
            renditions={polling.run.result.renditions}
          />
        </div>
      )}
    </div>
  );
}

function StartButton({
  busy,
  onClick,
  label = "Start encode",
  error,
}: {
  busy: boolean;
  onClick: () => Promise<void>;
  label?: string;
  error: string | null;
}) {
  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => void onClick()}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {busy ? "Starting…" : label}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function RunProgress({
  run,
  log,
  fetchError,
  failed,
}: {
  run: EncodeRun | null;
  log: string[];
  fetchError: string | null;
  failed?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        {run ? <StatusBadge value={run.stage} /> : <span className="text-sm text-neutral-500">Starting…</span>}
        <span className="text-sm tabular-nums text-neutral-500">{run ? `${run.progressPct}%` : "—"}</span>
      </div>
      <ProgressBar value={run?.progressPct ?? 0} failed={failed || run?.stage === "FAILED"} />
      {log.length > 0 && (
        <ol className="space-y-1 rounded-md border border-neutral-200 bg-white p-3 font-mono text-xs text-neutral-700">
          {log.map((line, i) => (
            <li key={`${i}-${line}`}>{line}</li>
          ))}
        </ol>
      )}
      {fetchError && (
        <p role="alert" className="text-sm text-red-600">
          {fetchError}
        </p>
      )}
    </div>
  );
}

function RenditionsTable({
  durationSec,
  renditions,
}: {
  durationSec: number;
  renditions: NonNullable<EncodeRun["result"]>["renditions"];
}) {
  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium">Output</h2>
      <p className="text-sm text-neutral-500">
        Duration {minutes}:{String(seconds).padStart(2, "0")}
      </p>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-neutral-500">
            <th className="py-2 pr-3 font-medium">Rendition</th>
            <th className="py-2 pr-3 font-medium">Resolution</th>
            <th className="py-2 font-medium">Size</th>
          </tr>
        </thead>
        <tbody>
          {renditions.map((r) => (
            <tr key={r.label} className="border-b border-neutral-100">
              <td className="py-2 pr-3">{r.label}</td>
              <td className="py-2 pr-3">
                {r.width}×{r.height}
              </td>
              <td className="py-2">{r.sizeMb} MB</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
