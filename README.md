# Encodr Lite — Intern Take-Home

Thanks for taking the time on this. **Encodr Lite** is a small media-transcoding dashboard: a
signed-in user creates an encode **job** from a media URL, presses **Start encode**, watches the
progress update live, and sees the output files when it finishes.

The full brief — the six tasks, what we look for, and the ground rules — is in **`BRIEF.md`**.
**Read that first.** This file is just how to run things, and it's where you write up your work when
you're done.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm run test:run     # tests (one example test is included and passes)
npm run typecheck    # tsc --noEmit
npm run build        # production build
```

Requires **Node 20+** (`.nvmrc` says 20).

**Demo login:** `demo@encodr.dev` / `password123`

On a fresh checkout, sign-in works and the app loads, but the jobs list shows an error and the two
main screens are placeholders. That's expected — `GET /api/jobs` returns a 501 until you write it.
Search the project for `TODO(candidate)` to find everything that's yours; there are six.

Nothing here needs a database. State lives in memory, so restarting the dev server wipes your jobs.
That's fine — don't work around it.

## Where things are

```
app/
  signin/page.tsx              working sign-in — your example of RHF + Zod
  (app)/layout.tsx             route guard for everything signed-in
  (app)/jobs/page.tsx          TASK 4 — the create-job form
  (app)/jobs/[id]/page.tsx     TASK 5 — run controls, progress, results
  api/auth/login/route.ts      provided
  api/jobs/route.ts            TASK 2 — list + create
  api/jobs/[id]/route.ts       provided — your example route handler
  api/runs/route.ts            provided — starts a run
  api/runs/[id]/route.ts       provided — the endpoint you'll poll
lib/
  types.ts                     the data model + the run TIMELINE. Read this first.
  schemas.ts                   TASK 1 — source-URL validation
  server/auth.ts               provided — token signing
  server/http.ts               provided — json / error / withAuth / validationError
  server/store.ts              TASK 3 — computeRun()
  client/api.ts                provided — the fetch wrapper
  client/auth-context.tsx      provided
  client/hooks.ts              worked React Query examples + two TODOs
  client/use-run-polling.ts    TASK 5 — the polling hook
components/                    provided — StatusBadge, ProgressBar
__tests__/                     TASK 6 — your tests go here
```

## A suggested first hour

If you're not sure where to start:

1. `npm install && npm run dev`, sign in, look around. The jobs list will show an error — good, that's
   your first task.
2. Read `lib/types.ts` top to bottom. It's short and it's the whole data model.
3. Read `app/api/jobs/[id]/route.ts` — a complete route handler — then write Task 2 in the same style
   and check it with the curl commands in the file.
4. The list page lights up. Now do Task 1, then Task 3 (tests first).

## Useful to know

- `https://cdn.example.com/videos/corrupt.mp4` is rigged to **fail** partway through its run. Use it
  to build the error path.
- A run takes about **12 seconds** from start to finish, so you won't be waiting around.
- Run timings are constants in `TIMELINE` (`lib/types.ts`). Use them instead of typing numbers, so
  your tests and ours agree.
- `computeRun` takes `now` as an argument on purpose — you can test the 8-second mark without
  waiting eight seconds.

---

# Your write-up

Please replace this section before submitting. See `BRIEF.md` §6 for what we're after.

### What's working

<!-- Which of the six tasks are done? Anything half-finished or knowingly broken? -->

### How to see the failure path

<!-- Which URL, which screen. -->

### Decisions and assumptions

<!-- How did you model the detail page's state? How does your polling clean up? Anything the brief
     left ambiguous, and what you assumed. -->

### What was hardest

<!-- Be honest here — we read this part closely. What confused you, and how did you work it out? -->

### What I'd do next

<!-- With another day. -->

### Time spent

<!-- Roughly. There's no wrong answer; it helps us calibrate the exercise. -->
