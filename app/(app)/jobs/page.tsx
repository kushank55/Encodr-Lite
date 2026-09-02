"use client";

import Link from "next/link";
import { useJobs } from "@/lib/client/hooks";
import { StatusBadge } from "@/components/status-badge";

// The list half of this page is provided and will light up as soon as GET /api/jobs works
// (Task 2). Note how it handles loading, error and empty separately — we'd like the same care
// in the parts you write.
//
// ---------------------------------------------------------------------------
// TASK 4 — TODO(candidate): build the "New encode job" form where the placeholder is.
// ---------------------------------------------------------------------------
//
// Requirements:
//   - Two fields: source URL (required) and title (optional).
//   - React Hook Form with `zodResolver(createJobSchema)`. app/signin/page.tsx is a complete
//     working example of this setup — the pattern is the same.
//   - Show validation messages under the field they belong to, before anything is sent.
//   - Submit via your useCreateJob mutation from lib/client/hooks.ts.
//   - Disable the submit button while the request is in flight, and reset the form on success.
//   - The new job must appear in the list below without a page reload (that's what
//     invalidateQueries in the mutation is for).
//   - If the server replies 422, map its `fieldErrors` back onto the form. The thrown error is an
//     `ApiError` with a `fieldErrors` object keyed by field name, and React Hook Form's
//     `setError("sourceUrl", { message })` puts a message on a specific field. Test this by
//     temporarily making your client and server rules disagree, or with the curl command in
//     app/api/jobs/route.ts.
//
// Try `https://cdn.example.com/videos/corrupt.mp4` as a source URL — that one is rigged to fail
// partway through its run, so you can build the error path on the detail page.
export default function JobsPage() {
  const jobs = useJobs();

  return (
    <div className="space-y-8">
      <section>
        <h1 className="mb-4 text-xl font-semibold">New encode job</h1>
        <p className="rounded-md border border-dashed border-neutral-300 p-4 text-sm text-neutral-500">
          TODO(candidate): the create-job form goes here.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Jobs</h2>

        {jobs.isLoading && <p className="text-sm text-neutral-500">Loading jobs…</p>}

        {jobs.isError && (
          <div className="text-sm text-red-600">
            Couldn’t load jobs — is GET /api/jobs implemented?{" "}
            <button onClick={() => jobs.refetch()} className="underline">
              Retry
            </button>
          </div>
        )}

        {jobs.data?.length === 0 && (
          <p className="rounded-md border border-neutral-200 p-4 text-sm text-neutral-500">
            No jobs yet. Create one above to get started.
          </p>
        )}

        {jobs.data && jobs.data.length > 0 && (
          <ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200">
            {jobs.data.map((job) => (
              <li key={job.id}>
                <Link
                  href={`/jobs/${job.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-neutral-50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{job.title}</p>
                    <p className="truncate text-xs text-neutral-500">{job.sourceUrl}</p>
                  </div>
                  <StatusBadge value={job.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
