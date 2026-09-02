# Encodr Lite — Full Stack Engineer Intern Take-Home

**Level:** Internship / early career · **Time budget:** ~4–6 focused hours (you have **3 calendar days**)
**Stack:** Next.js (App Router) + React + TypeScript, with the API implemented in Next.js Route Handlers.

A **starter scaffold** is provided. It already installs, runs, type-checks and passes its one test —
you're not going to spend your evening fighting configuration. The parts you build are marked
`TODO(candidate)`, and each one has a worked example of the same pattern somewhere nearby. See
`README.md` for how to run it.

If you finish in three hours, that's fine. If you run out of time, that's also fine — submit what
works and tell us in the README what you'd have done next. **We would much rather see three tasks
done carefully than six done in a panic.**

---

## 1. What you're building

**Encodr Lite** is a small media-transcoding dashboard. A signed-in user:

1. creates an encode **job** from a media source URL,
2. presses **Start encode**,
3. watches the run's **progress update live**, and
4. sees the **output files** when it finishes — or a clear error, and a retry, when it fails.

Nothing is really transcoded. The server fakes a run over about 12 seconds so there's something to
watch. It's a deliberately small slice of a real product, picked so you can show us how you handle a
form, an API boundary, some asynchronous state, and a couple of tests — without a mountain of
surface area.

Sign-in already works. So does the job list, once your API route returns data.

---

## 2. What's provided vs. what you build

Every file says at the top which it is.

**Provided — read it, use it, don't rebuild it:**

- Next.js + TypeScript + Tailwind, configured and running.
- The whole auth flow: sign-in page, login route, token signing, and the route guard.
- The shared types (`lib/types.ts`) — your data model, already written.
- The in-memory store (`lib/server/store.ts`) — everything except one function.
- The `GET /api/jobs/:id`, `POST /api/runs` and `GET /api/runs/:id` routes.
- HTTP helpers (`lib/server/http.ts`) and the fetch wrapper (`lib/client/api.ts`).
- Worked examples of every pattern you need: two React Query queries, one mutation, one
  React-Hook-Form-plus-Zod form, one authenticated route handler.
- `StatusBadge` and `ProgressBar` components.

**You build — six tasks, in this order:**

| # | Task | Where | Rough time |
|---|---|---|---|
| 1 | Source-URL validation | `lib/schemas.ts` | 30 min |
| 2 | The jobs API routes | `app/api/jobs/route.ts` | 45 min |
| 3 | The run state machine | `lib/server/store.ts` → `computeRun()` | 1 hr |
| 4 | The create-job form | `app/(app)/jobs/page.tsx`, `lib/client/hooks.ts` | 1 hr |
| 5 | Live progress + results | `lib/client/use-run-polling.ts`, `app/(app)/jobs/[id]/page.tsx` | 1.5 hr |
| 6 | Tests | `__tests__/` | 45 min |

The order matters — each task makes the next one visible in the browser. Task 3 is the one we'd
most like you to get right.

---

## 3. The tasks

The full detail lives in the `TODO(candidate)` comment in each file — including the hints. This is
the summary.

### Task 1 — Source-URL validation (`lib/schemas.ts`)

`sourceUrlSchema` currently accepts any non-empty string. Make it accept only an `http(s)` URL that
has a path, with a useful message for each way it can be wrong. The same schema runs in the browser
and on the server, so you write the rule once.

### Task 2 — The jobs API routes (`app/api/jobs/route.ts`)

`GET /api/jobs` returns the list. `POST /api/jobs` validates the body with `createJobSchema` and
creates a job, or returns a 422 carrying per-field messages. Both require a signed-in request.
`app/api/jobs/[id]/route.ts` is a complete working example of the pattern; there are curl commands
in the file so you can test it before any UI exists.

### Task 3 — The run state machine (`lib/server/store.ts` → `computeRun()`)

Given a run and the current time, work out its stage, its percentage, and — when it's finished —
its result or its error. There are no timers on the server: a run's state is a **pure function of
elapsed time**, which is what makes it straightforward to test.

```
0 ─────── 2s ──────────── 6s ───────────── 12s
│ QUEUED  │ DOWNLOADING   │ TRANSCODING    │ COMPLETED
                                ↑
                          8s: the "corrupt" source fails here
```

The exact boundaries are in `TIMELINE` in `lib/types.ts`. **Write the tests for this one before you
write the function** — Task 6 asks for them anyway, and you'll finish faster with them than without.

### Task 4 — The create-job form (`app/(app)/jobs/page.tsx`)

A source URL field and an optional title, validated with React Hook Form + your Zod schema, showing
messages under the right field. Submitting adds the job to the list below without a page reload. If
the server returns a 422, put its messages on the matching fields. The sign-in page is the same
pattern, already working — read it first.

### Task 5 — Live progress and results (`lib/client/use-run-polling.ts` + the detail page)

Start a run, then ask the server for its state about once a second until it's finished, showing the
stage, the percentage and the log as they change. Handle the failure case with a clear message and a
retry, and show the renditions table when it completes.

The part we care most about: **stop polling when you should.** Stop when the run reaches a terminal
stage, and clean up when the component unmounts or the run changes. The `TODO` comment in
`use-run-polling.ts` walks through the two separate problems involved and shows you the shape of the
answer.

### Task 6 — Tests (`__tests__/`)

Four or five tests that would actually catch a bug. Ours would be:

- `computeRun` at each stage boundary — including exactly on a boundary;
- `computeRun` with the corrupt URL, ending FAILED;
- `sourceUrlSchema` accepting a good URL and rejecting a bad one;
- one component test: submitting the form with an invalid URL shows an error and doesn't call the API.

**Please write at least the `computeRun` tests before the implementation.** Run them, watch them
fail, then make them pass. Say in your README that you did — this is how the team works day to day,
and it's a habit we'd rather see you starting than perfecting.

---

## 4. Out of scope — please don't spend time here

Real databases, real auth providers, Docker, deployment. Pixel-perfect design, dark mode,
animations. Sign-up, password reset, user roles. WebSockets. Multiple users. Pagination.

**Visual polish will not earn you points.** A plain screen that behaves correctly beats a beautiful
one that leaves a timer running. Put the time into the logic and the tests instead.

---

## 5. What we're looking for

In rough order of weight:

- **Does it work?** Can we create a job, run it, watch the progress, see the result, and see the
  failure path on the corrupt URL.
- **Asynchronous care.** The polling stops when it should. No timer left running after you navigate
  away, no state written to an unmounted component.
- **Correct logic.** `computeRun` gets the stage boundaries right, including the edges.
- **Readable code.** Sensible names, small functions, no dead code or leftover `console.log`s.
  Would the next person understand this?
- **Types used honestly.** The types you need are already written — import them. No `any` to make an
  error go away, no `as` to force something through.
- **Client and server both validating.** The server doesn't trust the browser.
- **Tests that mean something.** Four tests that could fail are worth more than twenty that can't.
- **Your README.** Tell us what you did, what you found hard, and what you'd do next.

We are **not** looking for: every edge case covered, exhaustive tests, clever abstractions, or a
design system. Clean and working beats broad and half-finished.

### If you have time left over

Optional, and only once the six tasks are solid. Note anything you attempt in the README.

- Pause polling when the browser tab is hidden (`document.visibilityState`).
- Keep the progress bar smooth between polls.
- Show a relative "created 2 minutes ago" timestamp on each job.
- A keyboard-accessible pass over your form (labels tied to inputs, focus visible, errors announced).

---

## 6. Submitting

Send us a **git repository** — a link, or a zip that includes the `.git` folder. We read the commit
history, so please commit as you go rather than in one giant "final" commit. A handful of small
commits with honest messages tells us more about you than a perfect diff does.

It must run with `npm install && npm run dev` on **Node 20+** with no extra setup.

Update `README.md` with:

1. **What's working** — which of the six tasks you finished, and anything half-done.
2. **How to see the failure path** — the corrupt URL, and where it shows up.
3. **Decisions you made** — how you modelled the detail page's state, how you handled polling
   cleanup, anything the brief left ambiguous and what you assumed.
4. **What was hardest**, and how you worked it out. We read this closely. "I hadn't used
   `useEffect` cleanup before, so I read the React docs on it and tested by navigating away
   mid-run" is a genuinely good answer.
5. **What you'd do next** with another day.

### Ground rules — please read this bit

**AI tools are allowed.** Claude, Copilot, ChatGPT — we use them daily and we're not going to
pretend otherwise. But there's a condition, and we mean it:

> **You own every line you submit.** In the follow-up interview we'll open your code, ask why a
> particular piece works the way it does, and ask you to change something live.

Code you can't explain is worse than code you didn't write, because it wastes both our time. If you
use AI to learn something, make sure you actually learned it. If you use it to generate something,
read it until you'd be comfortable defending it. Pasting in something you don't understand is the
one thing that will definitely end the process here.

Other rules:

- Don't add dependencies that do a task for you. Everything you need is already installed.
- If a requirement is ambiguous, make a reasonable call, **write it in the README**, and move on.
  Don't get stuck. Deciding under uncertainty and documenting it is the job.
- Stuck on setup rather than on the actual work? Email us. Being blocked for two hours on something
  we could have unblocked in two minutes is not a test of anything.

---

*Questions about the brief? Email [HIRING CONTACT].*

Good luck — we're looking forward to reading it.
