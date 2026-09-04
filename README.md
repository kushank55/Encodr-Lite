# Encodr Lite

Small dashboard for fake video encodes. You paste a media URL, start a job, watch progress for about 12 seconds, and then either get output files or a clear error.

The original brief is in `BRIEF.md`.

## How to run

Needs **Node 20+**.

```bash
npm install
npm run dev          # http://localhost:3000
npm run test:run
npm run typecheck
```

Demo login: `demo@encodr.dev` / `password123`

State is in memory, so restarting the server clears jobs. That's expected.

---

## What I completed

All six tasks from the brief. Nothing is half-done.

1. **Source URL validation** — `lib/schemas.ts`. Only `http`/`https` URLs with an actual path. Empty string, `ftp://`, and a host with no file (like `https://cdn.example.com`) all get a specific error.
2. **Jobs API** — `GET` and `POST /api/jobs` in `app/api/jobs/route.ts`. Signed-in only. Bad input is a 422 with per-field messages. Same Zod schema as the form, so the server doesn't trust the browser.
3. **`computeRun`** — `lib/server/store.ts`. Stage / percent / result / error come from elapsed time. No timers on the server.
4. **Create-job form** — source URL + optional title, React Hook Form + that schema. New jobs show up in the list without a reload. If the server sends a 422, those messages land on the matching fields.
5. **Live progress** — start encode, poll about once a second, show stage + bar + log. Completed runs get a renditions table. Failed runs get an error panel and Retry. Polling stops when the run is done, and also if you leave the page.
6. **Tests** — stage boundaries for `computeRun` (including exact edges and the corrupt URL), the URL schema, and a form test that an invalid URL never hits the API.

I wrote the `computeRun` tests before the function and used them as the spec.

## How to test the failure path

The corrupt URL is `https://cdn.example.com/videos/corrupt.mp4`.

1. Sign in with the demo account above.
2. Create a job with that URL.
3. Open it and press **Start encode**.
4. Around 8 seconds in (still in TRANSCODING) it should fail. You'll get a red error and a **Retry** button, which starts a new run.

For the happy path, use something like `https://cdn.example.com/videos/clip.mp4`. That one completes at 12 seconds and shows the output table.

## Decisions and assumptions

**Detail page.** At any moment the run panel is one of: idle, running, failed, completed. I derived that from the current run's stage instead of juggling booleans, so you can't end up in a weird `isRunning && isFailed` state. If the job already has a `latestRunId` (you refreshed, or came back from the list), I reuse that instead of forcing you to start again.

**Polling.** I didn't use React Query's `refetchInterval`. The thing they care about is *stopping*, so I kept it as `fetchRun` + `useEffect` with an interval. Two separate cleanup problems: `clearInterval` / abort so nothing new fires, and a `cancelled` flag so a request that already left the browser doesn't call `setState` after unmount. `onFinished` is stored in a ref so a new function identity doesn't restart the timer.

I also skip polls while the tab is hidden and fetch once when you come back. That wasn't required, but it felt like the same "don't keep asking when you shouldn't" idea.

**Progress.** One percentage across the whole 12 seconds, not per stage. The brief said the simple version was fine. A failed run freezes at the 8 second mark (~67%) so the bar doesn't keep moving after the error.

**URLs.** I used `superRefine` instead of a chain of `.refine()` so you get one useful message, not three at once. `https://cdn.example.com/` (trailing slash, no file) counts as no path.

## What was challenging

The polling cleanup took longer than the timeline math. Stopping the interval is obvious. The part I had to think through is a fetch that's already in flight when you hit "back". If you don't guard that, you write to a page that isn't there, and if you forget `clearInterval` the requests keep going in the background. I ended up checking `cancelled` after every `await`, aborting the request, and testing it by starting a run and navigating away before it finished.

The other fiddly bit was the exact boundaries in `computeRun` — `2000ms` is already DOWNLOADING, `8000ms` on the corrupt URL is already FAILED. Easy to get a `<=` vs `<` wrong, which is why the tests hit those timestamps directly.

## What I'd do next

- Save jobs somewhere so a refresh doesn't wipe them.
- Smooth the progress bar between polls instead of jumping once a second.
- Show "created 2 minutes ago" on the list.
- If this were real, `computeRun` would be events from a worker, not a function of the clock. The UI states could stay the same.

## Time spent

Roughly 4–5 hours. Most of that was getting polling cleanup right and writing the `computeRun` tests first.
