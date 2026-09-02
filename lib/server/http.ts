import type { z } from "zod";
import { getUserIdFromRequest } from "@/lib/server/auth";

// PROVIDED IN FULL — small helpers so your route handlers stay short. Use them.

/** Build a JSON response. `json({ ok: true }, 201)` or `json(data)` for a 200. */
export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/** Build a JSON error response: `error(404, "Job not found")`. */
export function error(status: number, detail: string): Response {
  return json({ detail }, status);
}

/**
 * Field-level validation errors, in the shape the client form expects:
 * `{ fieldErrors: { sourceUrl: ["Only http(s) URLs are supported"] } }` with status 422.
 *
 * Pass it the `.error` from a failed `schema.safeParse()`:
 *   const parsed = createJobSchema.safeParse(body);
 *   if (!parsed.success) return validationError(parsed.error);
 */
export function validationError(zodError: z.ZodError): Response {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of zodError.issues) {
    const field = String(issue.path[0] ?? "_");
    (fieldErrors[field] ??= []).push(issue.message);
  }
  return json({ detail: "Validation failed", fieldErrors }, 422);
}

/**
 * Wrap a handler so it only runs for signed-in requests; otherwise it returns 401.
 *
 *   export async function GET(req: Request) {
 *     return withAuth(req, async (userId) => json(listJobs()));
 *   }
 */
export async function withAuth(
  req: Request,
  handler: (userId: string) => Promise<Response> | Response,
): Promise<Response> {
  const userId = getUserIdFromRequest(req);
  if (!userId) return error(401, "Not authenticated");
  return handler(userId);
}

/** Safely read a JSON body. Returns null if the body is missing or not valid JSON. */
export async function readJson(req: Request): Promise<unknown | null> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
