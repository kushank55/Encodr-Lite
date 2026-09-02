import { error, json, withAuth } from "@/lib/server/http";
import { getJob } from "@/lib/server/store";

// PROVIDED as your worked example of an authenticated route handler.
// Task 2 asks you to write ../route.ts (the list + create handlers) in this same style.
//
// Note two things:
//   - the handler body is wrapped in withAuth, so unauthenticated requests get a 401 automatically;
//   - a missing job is a 404 with a useful message, not a crash.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withAuth(req, () => {
    const job = getJob(id);
    if (!job) return error(404, "Job not found");
    return json(job);
  });
}
