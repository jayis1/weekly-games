# Last Cell — 2026-W39 retrospective

Author: jayis1

Reviewed 2026-09-25 UTC, against source checkpoint `e3dae7a3ee499341ff03e13b41ace763ce93375b`. This is an early execution of the Sunday review stage on Friday, not evidence that the scheduled weekend has elapsed. The UTC ISO-week gate matched `current.json`; the studio lock was acquired before writing.

## Delivered vs planned

Outcome: partially shipped — a tested, self-contained browser archive exists locally and source is on public `main`, but no GitHub Release is published and live BYO-AI behavior remains unverified.

- Delivered: directly openable HTML/CSS/JavaScript build, controls/setup README and MIT license. The archive has seven entries, all byte-identical to their current source counterparts; ZIP integrity passed.
- Delivered: start, seven-cycle reserve, three readouts, specialist rapport/confirmation, engine-owned win/loss decisions and restart. `npm test` passed 28/28 across W37–W39; the W39 Chromium suite passed rehearsal win/restart and responsive 390px checks with no page errors. All three ending rules are exercised by core tests, not all by this browser suite.
- Delivered: the reserve permits only two complete confirmations. NPC calls are mechanically required to confirm survivors before winning; each specialist uses the same configured client with a distinct persona, knowledge and bounded memory.
- Partial: BYO-AI integration is implemented for OpenAI-compatible Chat Completions, with configurable endpoint/model/optional session key, explicit consent, manual bounded requests, cancellation and visible errors. Local fixture coverage is not real-provider validation; the browser suite calls two specialists, not all three live.
- Delivered in source/tested in part: header-only key handling, no browser storage writes, inert model text, mismatched-readout rejection, HTTP 429 and cancellation recovery. Timeout and response caps are present in source; this review did not independently exercise every W39 limit.
- Delivered: clearly labeled offline rehearsal. Not delivered: a public downloadable GitHub Release. The public releases API returned an empty list during this review. Archive retention does not prove Discord receipt.
- Intentionally excluded: audio, saves, extra systems and procedural content. A pause control is not included; there is no continuously running simulation.

## Proven failures and record discrepancies

- Historical gameplay defect, fixed: premature evidence presentation previously consumed reserve before checking rapport. Commit `7bcfd37` moves that gate before the decrement; the current no-charge regression test passes. This fix protects game cycles, not provider budget: `app.js:19` still calls the provider before `recordCall` rejects a premature press. Such a live no-op can consume a request and incur cost; no paid reproduction was attempted.
- Distribution remains incomplete. TRACKER's packaging entry records missing GitHub CLI authentication; today's public API check independently confirms no published release, not the current authentication state.
- Documentation mixes stages and outcomes: TRACKER retains a kickoff-era “in development” line alongside “RELEASED”; README/catalog “final playtest” wording describes automation, not human playtesting. Recorded Friday/Saturday stages occurred earlier than their weekday labels. This review preserves history and explicitly qualifies those claims rather than changing release metadata or gameplay.

## Untested assumptions and player value

No human playtest evidence was found in the reviewed records. Fun, first-minute comprehension, pacing, accessibility and difficulty are unverified; automated green tests are not proof of fun. Non-Chromium browsers and physical touch devices remain untested. No authorized live-provider credentials or test budget was supplied, and no live-model call was made. Actual provider CORS compatibility, narrative quality and obedience to character knowledge remain unknown.

The engine, not dialogue content, grants confirmation after a successful response. That prevents model-owned state but means even an irrelevant successful reply can advance rapport. Whether this feels like meaningful conversation rather than a required button sequence needs human/live-model testing. The solution is fixed and README reveals it; replay value should not be assumed.

## Scope and engine lessons

The no-build browser approach produced a locally launchable artifact without purchases or runtime dependencies. Keep deterministic state separate from asynchronous dialogue, and test budget fairness before presentation polish. Reusing the provider client saved implementation work but did not eliminate the recurring live-provider validation gap.

Originality is partial: W37 questions witnesses, W38 questions captains, and W39 questions subsystem specialists. Last Cell adds a drop-one-of-three resource decision and submarine setting, but retains the inspect/listen/present/decide structure. A future concept should change the player's central action, not only the setting. Keep status, packaging, public availability and human playtesting as separate evidence fields.

## Fresh next-week candidates — proposals only, not started

- **Lost Property Orchestra:** arrange three recovered instruments into a short concert; BYO-AI musician NPCs describe preferences and negotiate swaps, while the engine validates the arrangement. One room, three musicians, one performance: a constructive sequencing puzzle rather than another testimony mystery.
- **Tiny Treaty Kitchen:** assemble a shared meal from six ingredients for two rival BYO-AI delegates, asking about fixed dietary constraints and negotiating preferences. One menu and one scored dinner; no generated recipes or simulation beyond engine-owned compatibility.
- **Cloud Courier:** plan three deliveries on a tiny route map using a fixed fuel budget. BYO-AI customers explain bounded delivery windows and respond to proposed schedules; the engine validates travel and scores the route. One map and three customers, no open world.

No candidate was selected or scaffolded. No jobs, skills, new repositories, releases or gameplay files were changed.

## Verification and retained artifact

- `npm test`: 28 passed, 0 failed.
- `PLAYWRIGHT_BROWSERS_PATH=/root/weekly-games/.cache/ms-playwright npm run test:browser`: PASS; local fixture/rehearsal only.
- Python `zipfile.testzip()` and byte comparison against all seven source files: PASS. Runtime tests exercised the identical source payload; the ZIP was not separately extracted/launched this run.
- `https://api.github.com/repos/jayis1/weekly-games/releases`: `[]`.
- Archive: `/root/weekly-games/artifacts/last-cell-2026-W39-browser.zip`, 13,114 bytes.
- SHA-256: `76b6edd44caeddef9d9f90a42c07794603eade5e973318b8a22bfe4ba4cd721f`.

Next milestone: obtain human playtest feedback and an explicitly authorized bounded live-provider check; public release upload still needs authenticated release access. These are recommendations, not work started by this review.
