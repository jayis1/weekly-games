# Last Cell — 2026-W39

Author: jayis1

Status: in development. Kickoff 2026-09-23 (2026-W39, weekday 3 — first run of this cycle; the prior current.json was stale at W38). Not released.

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
