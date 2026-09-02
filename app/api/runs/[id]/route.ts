import { error, json, withAuth } from "@/lib/server/http";
import { getRun } from "@/lib/server/store";

// PROVIDED IN FULL. Returns a run's state AT THE MOMENT OF THE REQUEST.
//
// This is the endpoint Task 5 polls: ask it again a second later and you get fresh numbers,
// because computeRun() derives everything from the clock. Nothing is pushed to the browser —
// the browser keeps asking. That's what makes the cleanup in your polling hook important:
// if you never stop asking, the requests keep going after the user has navigated away.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withAuth(req, () => {
    const run = getRun(id);
    if (!run) return error(404, "Run not found");
    return json(run);
  });
}
