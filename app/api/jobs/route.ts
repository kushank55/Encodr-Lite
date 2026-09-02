import { json, readJson, validationError, withAuth } from "@/lib/server/http";
import { createJobSchema } from "@/lib/schemas";
import { createJob, listJobs } from "@/lib/server/store";

// GET /api/jobs — signed-in list. POST /api/jobs — signed-in create, with the same
// Zod schema the browser form uses so a curl/Postman request is still validated.
//
// Check without the UI:
//   curl -i localhost:3000/api/jobs                                  # expect 401
//   TOKEN=$(curl -s localhost:3000/api/auth/login -H 'content-type: application/json' \
//     -d '{"email":"demo@encodr.dev","password":"password123"}' | sed 's/.*"token":"\([^"]*\)".*/\1/')
//   curl -i localhost:3000/api/jobs -H "authorization: Bearer $TOKEN"                 # expect 200 []
//   curl -i localhost:3000/api/jobs -H "authorization: Bearer $TOKEN" \
//     -H 'content-type: application/json' -d '{"sourceUrl":"nope"}'                   # expect 422

export async function GET(req: Request) {
  return withAuth(req, () => json(listJobs()));
}

export async function POST(req: Request) {
  return withAuth(req, async () => {
    const parsed = createJobSchema.safeParse(await readJson(req));
    if (!parsed.success) return validationError(parsed.error);

    const job = createJob({
      sourceUrl: parsed.data.sourceUrl,
      title: parsed.data.title || undefined,
    });
    return json(job, 201);
  });
}
