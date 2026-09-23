# Last Cell — 2026-W39

Author: jayis1

Status: RELEASED 2026-09-23 (2026-W39). Final playtest pass complete, all suites green, shipped on `main`.

## Core loop and scope

One power cell can sustain exactly two of three failing subsystems aboard the deep-sea station Thalassa. Exactly one subsystem is secretly stable (running on its own reserve battery bank) and is the correct one to cut. Decode station readouts, question each subsystem's specialist through a single player-configured BYO-AI connection, build rapport, present the matching readout to confirm each system's true status, deduce the stable one, then commit the reroute (cut power to one system) before the seven-cycle reserve runs out. The engine owns all facts, status confirmations, cycle budget, and the three endings. Scope is one power console, three interactive specialists, three readouts, one final cut, and restart; no save system, extra systems, procedural events, or content expansion.

## Acceptance tests

- Self-contained browser build opens directly from disk with no runtime dependencies.
- Start, seven-cycle reserve, three readout decodes, three distinct specialist conversations, evidence-confirmed statuses, a drop-one-of-three decision with clear win/loss endings, and restart are playable.
- Only two subsystems can be fully confirmed within the reserve budget, forcing genuine deduction of the third.
- Every interactive NPC uses the same explicitly configured OpenAI-compatible Chat Completions connection in live mode, with distinct persona/knowledge and separate four-exchange memories.
- Session-only optional key, explicit data/cost consent, manual requests, 12-request budget, one in flight, cancel, 15-second timeout, 180 output tokens, bounded input/response, visible recoverable errors, and no tools or model-owned state.
- Scripted rehearsal is visibly labeled as offline and not live AI. Local HTTP fixture and live-model testing are reported separately.

## Completed work and exact results

- `date -u '+UTC=%Y-%m-%dT%H:%M:%SZ ISO=%G-W%V weekday=%u'`: `UTC=2026-09-23T15:11:12Z ISO=2026-W39 weekday=3`. current.json was stale (W38), so this kickoff correctly created a fresh W39 concept rather than modifying an older game.
- Acquired `/root/weekly-games/.worker-lock` atomically before project mutation (job kanban:t_3cb9ca28, profile gamehermes). Repository root and SSH remote `git@github.com:jayis1/weekly-games.git` verified.
- Toolchain: Node v22.22.3, npm 10.9.8, Playwright 1.63.0 with cached Chromium (chromium-1243) headless. Self-contained HTML/CSS/JavaScript feasible without purchase or interactive login.
- Reused the hardened W38 BYO-AI provider client (endpoint validation, header-only key, budgets, timeout, cancellation, response caps) under the LastCellAI namespace; fresh engine, UI, theme, and a new drop-one-of-three deduction mechanic.
- GREEN: `node --test games/2026-W39-last-cell/tests/core.test.cjs`: 10/10 pass (bounded loop, stable/critical confirmation, mismatch rejection before state mutation, trust gate, engine-owned outcomes, survivor-only unverified check, distinct bounded prompts/memories, provider protocol/security/budget).
- GREEN: `npm test` (all games): 27/27 pass — W37, W38, and W39 core suites; prior games preserved.
- GREEN: `PLAYWRIGHT_BROWSERS_PATH=/root/weekly-games/.cache/ms-playwright npm run test:browser`: PASS — rehearsal crew-saved/restart; two specialists through local HTTP protocol fixture with distinct system prompts; consent-revocation block; key isolation (Authorization header only, never in body, no storage writes); model HTML rendered as inert text; mismatched-evidence rejected before any provider call; HTTP 429 recovery with no cycle spent; cancellation recovery; 390px no horizontal overflow; zero page errors.
- Regression: `npm run test:lantern` (W38) and `npm run test:last-inn` (W37) both PASS after adding W39.

## Blockers and limitations

- Live AI model/provider test NOT RUN: no authorized credentials or paid-test budget. No billable request initiated. Scripted rehearsal and local HTTP fixture are not live-model evidence.
- No human playtest, non-Chromium browser, physical touch device, audio, or save system verification. Agent visual inspection only, not human playtesting.

## Art & UI polish log

- 2026-09-23 (job kanban:t_a55045cc, gamehermes): art/polish pass on the W39 build. Added (1) a seven-dot power-cycle pip meter beside the reserve readout — filled dots for remaining cycles, hollow outlines for spent, so the tightening budget is legible at a glance; (2) a persistent three-subsystem status roster with per-specialist confirmation badges (Unqueried → Rapport open → Confirmed STABLE/CRITICAL) colored by outcome, making the deduction state visible instead of buried in the reserve string; (3) a low-reserve warning state (≤2 cycles) that reddens the readout and pulses the remaining pips; (4) decoded-readout glow accent, and an animated rise/glow on the win/loss ending card. All motion gated behind `prefers-reduced-motion: reduce`. No engine, mechanic, budget, or BYO-AI security surface changed — pure presentation. `#reserve-status` text contract ("N cycles remain", "X/3 systems confirmed") preserved so existing browser assertions hold.
- GREEN after the pass: `npm test` (all games) 28/28; `npm run test:browser` (Chromium, local protocol fixture) PASS with zero page errors; responsive 390px check still no horizontal overflow.

## Next bounded task

Thursday: continue clarity/comprehension iteration and begin art/UI polish handoff (child t_a55045cc). If authorized credentials and budget become available, run one bounded live-model compatibility/knowledge-fidelity test against the documented protocol.

## Core-mechanics iteration log

- 2026-09-23T15:15Z (job kanban:t_d786db41, gamehermes): fairness fix in the deduction loop. `recordCall` previously spent a reserve cycle *before* the trust gate, so pressing a readout on a specialist you had not yet listened to burned a cycle for a zero-progress `needs_trust` no-op. In a 7-cycle reserve deliberately tight enough to confirm only two of three systems, charging for a non-action is a trap that can silently cost the player the game. The gate now runs before any decrement: a premature press mutates nothing and costs nothing. Verified/heard paths unchanged.
- Locked with two new engine tests: (1) failed press costs no reserve and the subsequent listen+press succeeds spending exactly one cycle each; (2) explicit budget proof that seven cycles confirm at most two of three systems (3 cycles each: inspect+listen+press), forcing genuine deduction of the third.
- GREEN: `node --test games/2026-W39-last-cell/tests/core.test.cjs` 11/11. `npm test` (all games) 28/28. `test:browser` PASS. Regressions `test:lantern` (W38) and `test:last-inn` (W37) both PASS.

## Release paths and remote status

- Launch source/build: open `games/2026-W39-last-cell/index.html`.
- Status: in development; no release/tag created (kickoff stage).
- Source destination: `git@github.com:jayis1/weekly-games.git`, branch `main`. Remote SHA to be verified after push.

## Ship log — final playtest and release (2026-09-23, job kanban:t_67d7ee6e, gamehermes)

Final playtest pass and release of Last Cell (W39).

Playtest evidence (this pass, re-run against shipped tree):
- `npm test` (core, all games): 28/28 pass.
- `npm run test:browser` (W39, Chromium via cached chromium-1243, local HTTP protocol fixture): PASS — rehearsal crew-saved/restart, two specialists through the local fixture with distinct prompts/memories, key isolation (Authorization header only, never in body/storage), model output rendered as inert text (XSS-as-text), mismatched-evidence rejected before any provider call, HTTP 429 recovery with no cycle spent, cancellation recovery, 390px no horizontal overflow, zero page errors.
- Regressions `npm run test:lantern` (W38) and `npm run test:last-inn` (W37): both PASS.
- Engine review of `game.js`: budget math confirmed — inspect+listen+press = 3 cycles/system, 7-cycle reserve confirms at most two of three, so the third is always a genuine deduction; premature-press gate spends no reserve; endings engine-owned (crew_saved / cascade / unverified). No bugs found.
- Browser MCP could not load localhost (private-address block); the Playwright browser suite is the end-to-end playtest of record.

Bug fixes this pass: none required — the build was already green and correct after the W39 core-mechanics fairness fix (t_d786db41) and art/polish pass (t_a55045cc).

### What worked (carry into next week)
- Reusing the hardened W38 BYO-AI provider client (endpoint validation, header-only key, request budget, timeout, cancellation, response caps) gave W39 a secure networking layer for free — the biggest time saver. Keep this client as the studio's shared NPC-provider foundation.
- Tight, engine-owned scope (one console, three specialists, three readouts, one cut) kept the whole game testable with a small deterministic core suite plus one browser suite. Deduction budget baked into tests (7 cycles ⇒ max 2 confirmations) caught the fairness trap early.
- Fixing the premature-press cycle charge before polish meant the art pass never had to touch engine logic — clean separation of concerns held.

### What didn't (fix next week)
- Live-AI model test still NOT RUN across three straight weeks: no authorized credentials or paid-test budget. All NPC evidence remains scripted-rehearsal + local HTTP fixture, never a real provider. Next week: either secure a small bounded test budget or add a documented one-shot manual live-check checklist a human can run, so "BYO-AI works live" stops being unverified.
- No human playtest, no non-Chromium browser, no touch-device or audio verification — agent visual/automated inspection only. Consider a lightweight human-playtest handoff step in the weekly cycle.
- localhost is blocked for the browser MCP tool, so interactive agent playtesting relies entirely on the Playwright harness. Fine for regression, but not a substitute for a human clicking through.

## Release paths and remote status (updated)

- Launch/build: open `games/2026-W39-last-cell/index.html` directly (no server/build/runtime dependency).
- Status: RELEASED on `main`. Remote SHA verified after push (see commit below).
