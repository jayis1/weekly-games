# Treaty Kitchen — 2026-W43 retrospective

Author: jayis1

Reviewed 2026-10-25 20:09 UTC (Sunday, ISO 2026-W43) against source checkpoint `79521932f89d8627d9b1655296917bcfd51cb6d2` (`main` = `origin/main`, clean worktree, only branch `main`). The UTC ISO-week gate matched `current.json`; the studio lock `/root/weekly-games/.worker-lock` was acquired before writing. Read-only review: no gameplay, engine, provider, test, catalog or `current.json` changes.

Evidence labels: PROVEN = re-run or inspected in this review; REPORTED = recorded in TRACKER, not re-verified here; UNTESTED = no evidence either way.

## Honest outcome

Shipped a small, complete, self-contained browser game on the last day of the ISO week, built in roughly three calendar days (Friday kickoff → Sunday-morning release) instead of six. Every acceptance test in TRACKER passes under automation. The BYO-AI NPC requirement is implemented and load-bearing in source. Live-model behaviour and whether the game is fun are unverified. No GitHub Release exists; the archive is local only.

## Delivered vs planned

Plan (kickoff TRACKER scope): one hall, two BYO-AI delegates, six-hour question budget, seven ingredients, exactly-three menu, three engine-owned endings, restart, labeled offline rehearsal, Saturday release.

- Delivered — PROVEN: `npm test` 39/39 pass (W37–W39 suites intact, W43 core 11/11). `npm run test:treaty` PASS in headless Chromium: rehearsal signed/walkout/restart, pantry limit, two delegates via 127.0.0.1 protocol fixture with distinct system prompts, key isolation, model text rendered inert, consent gate, 401/429/cancel/in-flight recovery, zero-hour bell, double-click Ask, Ctrl+Enter, accord ending, 320/390 px layout, zero page errors.
- Delivered — PROVEN: archive `/root/weekly-games/artifacts/treaty-kitchen-2026-W43-browser.zip`, 14,491 bytes, 7 entries, `zipfile.testzip()` clean, SHA-256 `384c6a8097ef75678606184477969032abbb3e951a663fcd58c789bff775a27c` matches the recorded `.sha256`. No tests, `.git`, caches or env files inside.
- Delivered — REPORTED: clean-extraction headless playthrough to both "Treaty signed" and "The table empties" endings with all non-`file://` requests aborted (Saturday entry). Not repeated this review.
- Delivered — PROVEN (source inspection): `provider.js` sends the optional key only as an `Authorization` header, `max_tokens:180`, 15 s timeout, 12-request session budget, ≤10 messages / ≤6,000 chars input, `credentials:'omit'`, `redirect:'error'`; no storage writes. `game.js:79` gives each delegate a distinct persona and only its own three verdicts; the engine owns the truth table, hour budget, menu validation and endings. The puzzle cannot be solved without asking the delegates, so NPC dialogue is load-bearing, not decorative.
- Delivered — PROVEN: source on public `git@github.com:jayis1/weekly-games.git` `main`; `git ls-remote` returns `7952193` = local HEAD. No task branches.
- Partial: release distribution. Source is public, but no GitHub Release/tag (gh not authenticated — REPORTED, consistent across all four stage runs). Archive retention does not prove delivery to the user.
- Not delivered, planned as optional: dossier panel (deliberately cut under freeze; the dialogue log substitutes). Audio, pause, saves: excluded by design from kickoff.
- Schedule: the Monday kickoff did not happen. Kickoff fired Friday 2026-10-23, BUILD and Friday-QA both ran Saturday 2026-10-24, release ran Sunday 2026-10-25 08:01 UTC. Weeks W40–W42 have no project at all (no kickoff ran). The game is complete, but the "Saturday playable release" target was missed by one calendar day and three studio weeks produced nothing.

## Proven failures

- Three substantive bugs were found and fixed before release, all in `app.js` UI state rather than the engine: re-apply during an in-flight request re-enabled Ask/Serve (BUILD); restart mid-request left Cancel enabled (BUILD); synchronous rehearsal bypassed the `busy` lock so a double-click on Ask spent two hours (QA). Each has a regression test that fails on the pre-fix code (REPORTED) and passes now (PROVEN). Lesson: the engine was correct from kickoff; every defect was async UI locking.
- No GitHub Release: `gh auth status` not logged in at every stage (REPORTED). This has been the blocker for four consecutive shipped cycles (W37, W39, W43 and partial W38). It will not fix itself.
- Stage timing: three of four stage crons ran on the wrong weekday (REPORTED in each TRACKER header). The cron schedule, not the game, is the recurring defect.

## Untested assumptions

- Fun, pacing, first-minute comprehension, difficulty: no human has played this game. Automated green tests are not proof of fun.
- Live AI provider: zero live requests this week (no authorized credentials or budget). Specifically unknown: whether a real model obeys "answer honestly about your own needs" and "never speak for the other delegation"; whether CORS allows a browser `file://` page to reach common hosted endpoints; response latency vs the 15 s timeout; token cost per session (bounded at 12 requests × ≤180 output tokens plus ≤6,000 chars input, so worst case is small, but unmeasured).
- Information integrity: the engine owns the facts but the player learns them only through model text. A live model that hallucinates or softens a taboo ("I'd rather not, but fine") can mislead the player into a walkout with no engine-side correction. The rehearsal mode is deterministic and cannot reveal this.
- Replay value: the truth table is fixed and the README documents the mechanics; a second play is a memory test. Not measured.
- Firefox/Safari, touch devices, screen readers: not run (aria-live and focus checked programmatically only).
- Clean-machine launch: the archive was extracted and opened in the dev environment's Chromium only.

## Scope and engine lessons

- Three-day delivery worked because the scope was one screen, two NPCs, seven nouns and one decision. Keep this ceiling for compressed weeks: if kickoff is late, cut to "one room, two NPCs, one decision" by default rather than negotiating scope on the day.
- Reusing the W39 provider client (`TreatyKitchenAI` namespace) cost nothing and carried its budgets, cancellation and key-isolation tests forward. The provider layer should be treated as studio infrastructure, not per-game code; a shared tested module would remove the copy.
- Plain HTML/CSS/JS with Playwright remains the lowest-friction engine here: zero install, `file://` launch, headless playthroughs in ~100 ms. Three cycles in a row have used it; this is now a known quantity, not an experiment. A different engine next week needs a reason beyond novelty.
- Every bug this week was async UI state (busy/lock/cancel). Next conversation game should start from a single `busy` state machine in the UI layer on day one instead of patching it under freeze.
- The constructive puzzle (build a meal) read better in automation than another testimony mystery, but the player-facing difference is unverified without a playtest.
- Process: the studio is now 2 released games out of 7 ISO weeks (W37, W38 in development; W39, W43 released; W40–W42 nothing). The cron schedule and GitHub release auth are the two blockers to fix outside any single game's scope. Both need user action: a stable Monday 12:00 UTC kickoff and an authenticated `gh` (or decision to drop GitHub Releases in favour of committing archives elsewhere).

## Fresh next-week candidates — proposals only, not started

Checked against W37–W43 concepts (inn mystery, harbour-order testimony, subsystem deduction, treaty meal). None below is a palette swap.

- **Dead Letter Office:** sort five undeliverable letters to the right recipients by interviewing two BYO-AI clerks who each remember half the town's gossip. Latency is diegetic (the clerks "look it up"), so slow model replies cost nothing in feel. One desk, five letters, one sorting pass, scored. ~10 model calls/session.
- **Auction of Small Things:** bid against one BYO-AI rival collector for six items with a fixed purse; the engine runs the auction and valuation, the model only narrates bids and reacts to the player's bluffing in a two-line exchange per lot. The AI drives a system, not dialogue-as-puzzle. ~6–8 calls/session. Risk: a rival that feels scripted if the model ignores its budget persona.
- **Night Shift Dispatcher:** route three ambulances across a six-node map in eight ticks; BYO-AI callers describe emergencies vaguely and answer one clarifying question each. Engine owns map, times and outcomes. Tests the "NPC gives information under pressure" pattern with a time budget. ~6 calls/session.
- **Recovery-week fallback — Lost Property Orchestra** (carried from the W39 list): three recovered instruments, three BYO-AI musicians negotiating an arrangement, engine validates. Smallest scope; choose it if the kickoff is late again.

No candidate was selected or scaffolded. No jobs, skills, repositories, releases, `current.json` or gameplay files were changed by this review.

## Verification performed by this review

- `date -u +%G-W%V` → `2026-W43`; `current.json` iso_week `2026-W43`, project `games/2026-W43-treaty-kitchen`, status `released`.
- `npm test`: 39 pass, 0 fail. `PLAYWRIGHT_BROWSERS_PATH=/root/weekly-games/.cache/ms-playwright npm run test:treaty`: PASS, "Local fixture and scripted rehearsal only — no live AI model tested."
- `git status --porcelain` empty before and after the test runs.
- Archive SHA-256 recomputed and matched; `zipfile.testzip()` → no errors; 7 allowlisted entries.
- `git ls-remote origin refs/heads/main` → `7952193` = local HEAD before this retrospective was committed.

Next milestone (recommendation, not started): Monday 2026-10-26 kickoff of a W44 game from the candidates above, after the user decides on cron timing and GitHub release authentication. Outstanding W43 validation that needs authorization: one bounded live-provider check and one human playtest.
