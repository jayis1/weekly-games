# Treaty Kitchen — 2026-W43

Author: jayis1

Status: IN DEVELOPMENT — kickoff core loop playable (2026-10-23, 2026-W43). Not released.

## Core loop and scope

Two rival delegations share one meal; the player is the cook with six hours before the banquet. Question Envoy Maret Ilsk (Highland Clans) and Chancellor Oru Venn (Delta Assembly) through a single player-configured BYO-AI connection to learn each delegate's one taboo, one feast dish and one dislike, then serve exactly three of seven pantry ingredients. The engine owns the truth table (highland: trout taboo / lentils delight / cheese dislike; delta: figs taboo / rice delight / peppers dislike), the hour budget, menu validation and three endings (walkout / accord / signed). The player learns facts only through dialogue, so the NPC conversation carries the puzzle. Scope: one hall, two delegates, seven ingredients, one served meal, restart. No dossier panel, save system, extra delegates, procedural menus or content expansion.

## Acceptance tests

- Self-contained browser build opens directly from disk with no runtime dependencies.
- Start, six-hour budget, two distinct delegate conversations, exactly-three menu, three engine-owned endings and restart are playable.
- Both interactive NPCs use the same explicitly configured OpenAI-compatible Chat Completions connection in live mode, with distinct persona/knowledge (own verdicts only) and separate four-exchange memories.
- Session-only optional key, explicit data/cost consent, manual requests, 12-request budget, one in flight, cancel, 15-second timeout, 180 output tokens, bounded input/response, visible recoverable errors, and no tools or model-owned state.
- Scripted rehearsal is visibly labeled as offline and not live AI. Local HTTP fixture and live-model testing are reported separately.

## Completed work and exact results

### KICKOFF — 2026-10-23 (Friday, 2026-W43)

- `date -u`: `Fri Oct 23 19:35:46 UTC 2026`, ISO `2026-W43`. current.json was stale (2026-W39, released) and no W43 project existed, so this kickoff created a fresh W43 concept (same handling as the mid-week W39 kickoff). Note: the kickoff cron fired on a Friday rather than Monday; scope was kept to the smallest complete loop so a Saturday release candidate is still possible.
- Concept chosen from the W39 retrospective candidates ("Tiny Treaty Kitchen"): a constructive negotiation puzzle rather than a fourth testimony mystery.
- Acquired `/root/weekly-games/.worker-lock` atomically before project mutation (job cron-kickoff-collective, session hermes-default-cli). Repository root, branch `main`, clean worktree and SSH remote `git@github.com:jayis1/weekly-games.git` verified; local HEAD equalled `origin/main` (`7826695`) before work.
- Toolchain: Node v22.22.3, npm 10.9.8, Playwright 1.63.0 with cached Chromium (chromium-1243) headless. Self-contained HTML/CSS/JavaScript feasible without purchase or interactive login; the deliverable is the source directory opened from disk (same as prior cycles).
- Reused the hardened W39 BYO-AI provider client under the `TreatyKitchenAI` namespace (endpoint validation, header-only key, budgets, timeout, cancellation, response caps); fresh engine (`game.js`), UI, theme and the keyword-driven labeled rehearsal.
- GREEN: `node --test games/2026-W43-treaty-kitchen/tests/core.test.cjs`: 9/9 pass (bounded hour loop, engine-owned truth table with exactly three "signed" menus, menu validation before mutation, walkout/accord/signed endings, deterministic rehearsal revealing only the asked fact, distinct bounded prompts/memories, endpoint validation, bounded request without key in body, failure/cancel/timeout/size/budget recovery).
- GREEN: `npm test` (all games): 37/37 pass — W37, W38, W39 and W43 suites; prior games preserved.
- GREEN: `PLAYWRIGHT_BROWSERS_PATH=/root/weekly-games/.cache/ms-playwright npm run test:treaty`: PASS — rehearsal treaty-signed/walkout/restart; pantry limit of three; two delegates through local HTTP protocol fixture with distinct system prompts; consent-revocation block; key isolation (Authorization header only, never in body, no storage writes); model HTML rendered as inert text; HTTP 429 recovery with no hour spent; cancellation recovery; 390px no horizontal overflow; zero page errors. One test-only fix during the run: roster badge assertion made case-insensitive (CSS uppercases it).

## Blockers and limitations

- Live AI model/provider test NOT RUN: no authorized credentials or paid-test budget. No billable request initiated. Scripted rehearsal and local HTTP fixture are not live-model evidence.
- No human playtest, non-Chromium browser, physical touch device, audio, or save system verification. Agent inspection only, not human playtesting.
- GitHub Release upload still requires authenticated GitHub CLI/API access (not available); source pushes use SSH.

## Next bounded task

Friday/Saturday: feature freeze on this loop; add a small player dossier (per-delegate per-ingredient notes, player-owned, engine does not validate) only if it fits; exercise edge cases (zero-hour serve, repeated apply, long questions); package `artifacts/treaty-kitchen-2026-W43-browser.zip`, verify archive, update catalog and release status. Do not expand scope beyond one hall, two delegates, seven ingredients.

## Release paths and remote status

- Launch source/build: open `games/2026-W43-treaty-kitchen/index.html`.
- Status: in development; no release/tag created (kickoff stage).
- Source destination: `git@github.com:jayis1/weekly-games.git`, branch `main`.
- Kickoff commit `cf4b39eb974af1c24675849a0068146e92ce6689` pushed; `git ls-remote origin refs/heads/main` returned the same SHA (verified 2026-10-23). No task branches exist locally or remotely.
