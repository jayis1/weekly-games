# Treaty Kitchen — 2026-W43

Author: jayis1

Status: IN DEVELOPMENT — feature freeze; core loop playable and edge-case hardened (2026-10-24, 2026-W43). Release candidate pending Saturday packaging. Not released.

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

### BUILD — 2026-10-24 07:44 UTC (Saturday, 2026-W43)

- Cycle identity: `date -u` → `2026-10-24 07:44 UTC`, ISO `2026-W43`; current.json matched (`games/2026-W43-treaty-kitchen`, in-development). Lock `/root/weekly-games/.worker-lock` acquired atomically (job build-stage-cron, session claude-code-owner-2026-10-24T0744Z) and released at the end of the run. Worktree clean before work; branch `main` equal to `origin/main` (`df18549`); no stashes, no task branches.
- Task chosen (feature freeze, per the kickoff "next bounded task"): exercise edge cases — in-flight request vs. re-apply/serve/restart, zero-hour serve, repeated serve, longest question with full memory, unusual rehearsal input — and fix what they exposed. The optional dossier panel was deliberately NOT added: the dialogue log already keeps every answer on screen, and release-day scope stays frozen.
- Bugs found and fixed (SUBSTANTIVE):
  - `app.js`: "Apply connection" during an in-flight live request re-rendered and re-enabled Ask and Serve; serving then made the arriving reply fail with "The meal is already served." Now a `busy` flag (mode of the in-flight request) keeps Ask and Serve locked until the request settles, Cancel is enabled only while a live request is in flight, and restart mid-request clears it. The captured request mode/config are unaffected by a mid-flight re-apply.
  - `app.js`: restart during an in-flight request left the Cancel button enabled with nothing to cancel; render now owns Cancel state.
  - `game.js`: the final hour now returns an explicit "The banquet bell rings — no more questions; serve the meal." message instead of "0 hours remain."; `rehearsal()` no longer prints a double period ("to it..") for ingredients without reason text.
- Verified edge cases that needed no change: serving at zero hours is allowed and ends the game once; repeated serve/ask after the ending is rejected; duplicate/short/long menus are rejected before mutation; a 400-char question plus four 240/500-char memory turns serialises to 4,526 characters (under the 6,000-character provider input budget) and 10 messages (the cap).
- GREEN: `node --test games/2026-W43-treaty-kitchen/tests/core.test.cjs`: 11/11 pass (two new edge-case tests).
- GREEN: `npm test` (all games): 39/39 pass; prior games preserved.
- GREEN: `PLAYWRIGHT_BROWSERS_PATH=/root/weekly-games/.cache/ms-playwright npm run test:treaty`: PASS — all kickoff scenarios plus in-flight lockout across re-apply, cancel restores controls with no hour spent, restart mid-request discards the reply and clears Cancel with no stray request, zero-hour bell then a successful serve with the "picks around the goat cheese" grumble, restart re-enables Ask; zero page errors. Regression check: the new browser assertions fail against the kickoff `app.js` (browser.cjs:96, Serve enabled mid-request) and pass with the fix.
- Independent review (separate reviewer agent, read-only, re-ran both suites): APPROVE, no blocking findings; three minor notes (redundant intermediate render in the synchronous rehearsal path — comment added; a one-microtask window on restart that is unreachable from UI clicks; a 100 ms timing-based negative assertion in the browser test). No secrets in the diff (key-pattern scan clean); tests use only mock fetchers and a 127.0.0.1 fixture.
- UNTESTED LIVE AI: no live model/provider request was made this run (no authorized credentials or budget). The in-flight lockout fix was exercised only against the local HTTP fixture.

## Blockers and limitations

- Live AI model/provider test NOT RUN: no authorized credentials or paid-test budget. No billable request initiated. Scripted rehearsal and local HTTP fixture are not live-model evidence.
- No human playtest, non-Chromium browser, physical touch device, audio, or save system verification. Agent inspection only, not human playtesting.
- GitHub Release upload still requires authenticated GitHub CLI/API access (not available); source pushes use SSH.

## Next bounded task

Saturday release stage: final test pass (`npm test`, `npm run test:treaty`), package `artifacts/treaty-kitchen-2026-W43-browser.zip` (index.html, style.css, game.js, provider.js, app.js, README.md, LICENSE), `unzip -t` and required-entry/credential-signature scans, record SHA-256, set README/TRACKER/current.json/catalog status to released, commit and push, verify remote SHA, deliver the archive path with launch steps. No scope additions.

## Release paths and remote status

- Launch source/build: open `games/2026-W43-treaty-kitchen/index.html`.
- Status: in development; no release/tag created (kickoff stage).
- Source destination: `git@github.com:jayis1/weekly-games.git`, branch `main`.
- Kickoff commit `cf4b39eb974af1c24675849a0068146e92ce6689` pushed; `git ls-remote origin refs/heads/main` returned the same SHA (verified 2026-10-23). No task branches exist locally or remotely.
- BUILD 2026-10-24: edge-case hardening commit `b9660fe1e2bc0efd3783c37a81324b6c989843de` pushed; `git ls-remote origin refs/heads/main` returned the same SHA (verified 2026-10-24). No task branches exist locally or remotely.
