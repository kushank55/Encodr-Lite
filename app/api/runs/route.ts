import { json, error, readJson, validationError, withAuth } from "@/lib/server/http";
import { startRunSchema } from "@/lib/schemas";
import { startRun } from "@/lib/server/store";

// PROVIDED IN FULL. Starts an encode run for a job and returns its id.
export async function POST(req: Request) {
  return withAuth(req, async () => {
    const parsed = startRunSchema.safeParse(await readJson(req));
    if (!parsed.success) return validationError(parsed.error);

    const record = startRun(parsed.data.jobId);
    if (!record) return error(404, "Job not found");

    return json({ runId: record.id }, 201);
  });
}
