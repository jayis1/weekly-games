# Treaty Kitchen — 2026-W43

Author: jayis1

Status: RELEASED v0.1.0 — 2026-10-25 (Sunday UTC, still ISO 2026-W43; the Saturday-stage cron ran late). Self-contained browser archive `artifacts/treaty-kitchen-2026-W43-browser.zip` verified by integrity test and a clean-extraction headless-Chromium playthrough. Live-model behaviour and human playtest remain unverified; no GitHub Release asset published (no authenticated gh/API access).

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

### FRIDAY QA AND POLISH — 2026-10-24 19:53 UTC (Saturday calendar day, 2026-W43; the Friday-stage cron ran late)

- Gate: `date -u +%G-W%V` → `2026-W43`; current.json matched (`games/2026-W43-treaty-kitchen`, in-development). Lock `/root/weekly-games/.worker-lock` created atomically (job friday-qa, session cli-collective-owner, pid 72767) and released at the end. Branch `main`, clean worktree, HEAD `83bc063` = `origin/main`; no stashes or task branches. Feature freeze held: no new mechanics, delegates, ingredients, panels, audio or save system.
- Baseline before any edit: `npm test` 39/39 GREEN; `npm run test:treaty` PASS.
- QA harness: headless Chromium (Playwright 1.63.0, chromium-1243) driving the shipped `index.html` from `file://` with real clicks/keys plus a 127.0.0.1 HTTP protocol fixture. Scratch probe `/root/.hermes/cache/scratch/friday-qa-probe.cjs` (not shipped); durable regressions folded into `tests/browser.cjs`.

| Check | Result | Evidence |
|---|---|---|
| Cold start → interactive title | PASS | 78–91 ms, 0 console errors |
| Keyboard-only start / apply / ask / pantry (Tab, Enter, Space) | PASS | probe |
| Start → signed ending → restart | PASS | browser.cjs |
| Walkout ending (taboo served) | PASS | browser.cjs |
| Accord ending names the slighted delegate + grumble; focus moves to ending | PASS | browser.cjs (new) |
| Post-ending lockout (Ask, Serve, pantry disabled) | PASS | probe |
| 5× restart cycle: hours 6, dialogue empty, pantry cleared, roster reset, no duplicated pantry nodes | PASS | probe; `performance.memory` heap 10.0 MB → 10.0 MB (Chromium reports this coarsely) |
| Rapid double-click Ask (rehearsal) spends one hour | FAIL → FIXED | before fix: 4 hours remain (two hours spent); after: 5 hours |
| Ctrl+Enter in question box asks | PASS (new control) | browser.cjs |
| Invalid key → `Provider HTTP 401`, no hour spent | PASS | browser.cjs (new) |
| HTTP 429 → visible error, no hour spent | PASS | browser.cjs |
| Invalid JSON reply → visible error, no hour spent | PASS | probe |
| Model "SYSTEM OVERRIDE … 99 hours" text cannot change engine state | PASS | probe; hours 6→5, no ending |
| Timeout (15 s hang) → `Request timed out after 15 seconds.`, recoverable, no hour spent | PASS | probe, 15,052 ms |
| 12-request session budget → `Session request budget exhausted (12).`; rehearsal still playable after | PASS | probe |
| Cancel, in-flight lockout across re-apply, restart mid-request | PASS | browser.cjs |
| 320 px / 390 px: no horizontal overflow | PASS | probe + browser.cjs |
| Page errors | PASS | 0 (the only console line is Chromium's own network log for the deliberate 401) |
| Pause | N/A by design | turn-based; nothing advances between inputs |
| Saving | N/A by design | no save system; reload = fresh banquet, connection forgotten |
| Audio | N/A | none exists; not added under freeze |

- Readability measurements (computed styles): body 16 px; status lines 13.6 px; disclosure 14.4 px; roster badge was 10.9 px and eyebrow 11.5 px → raised to 12.2 px / 12.5 px. Contrast (WCAG ratio on panel #1d130b): ink 15.4:1, label 11.5:1, glow 8.9:1, muted 6.75:1 — all above AA.
- Bugs fixed (SUBSTANTIVE): `app.js` rehearsal answered synchronously, so the `busy` lockout never engaged and an accidental double-click on Ask spent two hours. Rehearsal now answers after a 320 ms beat under the same `busy` lock as live mode (also shows the "Running labeled scripted rehearsal…" notice briefly). Regression check: the new double-click assertion fails against the kickoff/build `app.js` (4 hours remain) and passes with the fix.
- Polish: Ctrl/Cmd+Enter in the question textarea triggers Ask (label says so); badge/eyebrow font sizes raised; README status, controls and limitations updated. No balance or content changes.
- GREEN after changes: `npm test` 39/39; `PLAYWRIGHT_BROWSERS_PATH=/root/weekly-games/.cache/ms-playwright npm run test:treaty` PASS (now also: double-click Ask, Ctrl+Enter, accord ending, HTTP 401); probe 15/15 gameplay checks PASS.
- UNTESTED / limitations: no live AI model/provider request (no authorized credentials or budget — fixture only); no human playtest; no Firefox/Safari; no touch device; no screen-reader run (aria-live/focus checked programmatically only); heap measurement coarse.
- Release blockers for Saturday: none found in the core loop. Known non-blockers: live-provider behaviour unverified; GitHub Release upload needs authenticated gh/API access (not available) — Saturday falls back to the archive path + source push.

## Blockers and limitations

- Live AI model/provider test NOT RUN: no authorized credentials or paid-test budget. No billable request initiated. Scripted rehearsal and local HTTP fixture are not live-model evidence.
- No human playtest, non-Chromium browser or physical touch device verification. Agent-driven headless Chromium only, not human playtesting. No audio, pause or save system exists (by design, frozen).
- GitHub Release upload blocked: `gh auth status` → "You are not logged into any GitHub hosts"; no tag/asset published. Source is on the approved SSH remote; the archive is retained locally under `artifacts/` (gitignored) for direct delivery.

### SATURDAY RELEASE — 2026-10-25 08:01 UTC (Sunday calendar day, ISO 2026-W43; the Saturday-stage cron ran late)

- Gate: `date -u +%G-W%V` → `2026-W43` (weekday 7); current.json matched (`games/2026-W43-treaty-kitchen`, in-development). Lock `/root/weekly-games/.worker-lock` created atomically (job saturday-release, session cli-collective-owner, pid 15435) and released at the end. Branch `main`, clean worktree, HEAD `31463db` = `origin/main` (`git ls-remote`); no stashes or task branches. Feature freeze held: zero gameplay/engine/provider code changes this run; only README/TRACKER/current.json/catalog status text plus launch/controls sections.
- Baseline (unchanged code): `npm test` 39/39 GREEN; `PLAYWRIGHT_BROWSERS_PATH=/root/weekly-games/.cache/ms-playwright npm run test:treaty` PASS (rehearsal signed/walkout/restart, pantry limit, two delegates via 127.0.0.1 protocol fixture with distinct system prompts, key isolation, XSS-as-text, consent gate, 401/429 recovery, cancel, in-flight lockout, restart mid-request, zero-hour bell, double-click Ask, Ctrl+Enter, accord ending, 320/390 px layout, zero page errors).
- Packaging: allowlisted seven files (`index.html`, `style.css`, `game.js`, `provider.js`, `app.js`, `README.md`, `LICENSE`) staged into a scratch dir and zipped with Python `zipfile` (the `zip` binary is not installed) under the top-level folder `treaty-kitchen-2026-W43/`. Artifact `/root/weekly-games/artifacts/treaty-kitchen-2026-W43-browser.zip`, 14,491 bytes, 7 entries, 33,292 bytes uncompressed. `unzip -t`: "No errors detected". SHA-256 `384c6a8097ef75678606184477969032abbb3e951a663fcd58c789bff775a27c` (also written to `artifacts/treaty-kitchen-2026-W43-browser.zip.sha256`). Credential-signature scan of the staged tree (sk-/ghp_/github_pat_/PRIVATE KEY/AKIA patterns): no matches. No `.git`, tests, caches or env files in the archive.
- Clean-extraction runtime smoke (scratch probe `tk-release-smoke.cjs`, not shipped): archive unzipped to a fresh temp dir; headless Chromium (Playwright 1.63.0, chromium-1243) opened `index.html` over `file://` with every non-`file://` request aborted. Cold start → title → "Light the stove" in 141 ms; rehearsal applied ("offline demonstration, not live AI" label shown); four questions revealed trout/lentils/figs/rice and left 2 hours; menu lentils+rice+cheese → **Treaty signed** with the "picks around the goat cheese" grumble; Ask/Serve locked after the ending; restart → 6 hours, empty dialogue, pantry cleared; trout menu → **The table empties**. 0 page/console errors, 0 blocked network requests. PASS. (A first probe run produced the walkout ending because the probe itself picked trout as the third ingredient — engine behaved correctly; probe fixed, not the game.)
- Release upload: `gh auth status` → not logged in; no GitHub Release/tag created. Archive delivered as the absolute path above.
- UNTESTED: live AI provider (no credentials/budget); human playtest; Firefox/Safari/touch; audio/pause/save do not exist by design.

## Next bounded task

Sunday read-only retrospective of the released W43 scope (RETROSPECTIVE.md; lessons and next-week candidates). Do not expand W43 scope. Outstanding validation that requires authorization: a bounded live-provider check and a human playtest; GitHub Release publication requires authenticated gh/API access.

## Release paths and remote status

- Launch release: unzip `/root/weekly-games/artifacts/treaty-kitchen-2026-W43-browser.zip` (SHA-256 `384c6a80…a27c`) and open `treaty-kitchen-2026-W43/index.html`; or open `games/2026-W43-treaty-kitchen/index.html` from source.
- Status: released v0.1.0 (2026-10-25); archive local only — no GitHub Release/tag (auth unavailable).
- Source destination: `git@github.com:jayis1/weekly-games.git`, branch `main`.
- Kickoff commit `cf4b39eb974af1c24675849a0068146e92ce6689` pushed; `git ls-remote origin refs/heads/main` returned the same SHA (verified 2026-10-23). No task branches exist locally or remotely.
- BUILD 2026-10-24: edge-case hardening commit `b9660fe1e2bc0efd3783c37a81324b6c989843de` pushed; `git ls-remote origin refs/heads/main` returned the same SHA (verified 2026-10-24). No task branches exist locally or remotely.
- FRIDAY QA 2026-10-24: commit `059023078fdb7c7352e9de45c6a8d39521c7c0a8` pushed; `git ls-remote origin refs/heads/main` returned the same SHA (verified 2026-10-24). Only branch local/remote: `main`.
- SATURDAY RELEASE 2026-10-25: release commit `d67591bb152eed4cf6185fad7487bfdf936f0dee` pushed; `git ls-remote origin refs/heads/main` returned the same SHA (verified 2026-10-25). Only branch local/remote: `main`.
