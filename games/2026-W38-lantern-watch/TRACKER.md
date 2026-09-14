# Lantern Watch — 2026-W38

Author: jayis1

Status: in development. Monday kickoff 2026-09-14; not released.

## Core loop and scope

Decode the north-shoal and harbor-tug signals, question Captain Elian Roe and Captain Sable Venn through one player-configured AI connection, establish trust, present matching evidence to confirm both routes, then order the ferry/freighter and tug before six watches expire. The engine owns all facts, confirmations, time, and four endings. Scope is one lighthouse console, two interactive captains, two signals, one final order, and restart; no save system, extra ships, procedural events, or content expansion.

## Acceptance tests

- Self-contained browser build opens directly from disk with no runtime dependencies.
- Start, six-watch challenge, two signal inspections, two distinct captain conversations, evidence-confirmed routes, clear win/loss endings, and restart are playable.
- Every interactive NPC uses the same explicitly configured OpenAI-compatible Chat Completions connection in live mode, with distinct persona/knowledge and separate four-exchange memories.
- Session-only optional key, explicit data/cost consent, manual requests, 12-request budget, one in flight, cancel, 15-second timeout, 180 output tokens, bounded input/response, visible recoverable errors, and no tools or model-owned state.
- Scripted rehearsal is visibly labeled as offline and not live AI. Local HTTP fixture and live-model testing are reported separately.

## Completed work and exact results

- `date -u '+UTC=%Y-%m-%dT%H:%M:%SZ ISO=%G-W%V weekday=%u'`: `UTC=2026-09-14T14:42:58Z ISO=2026-W38 weekday=1`. The W37 bootstrap exception ended September 13, so this kickoff correctly created a fresh W38 concept rather than modifying The Last Inn.
- Acquired `/root/weekly-games/.worker-lock` atomically before project mutation; repository root and SSH remote `git@github.com:jayis1/weekly-games.git` verified.
- Toolchain: Node v22.22.3, npm 10.9.8, Playwright 1.63.0 with cached Chromium headless shell 1243. Self-contained HTML/CSS/JavaScript remains feasible without purchase or interactive login.
- RED: `node --test games/2026-W38-lantern-watch/tests/core.test.cjs` failed with `Cannot find module '../game.js'`; browser RED failed `ERR_FILE_NOT_FOUND` for absent `index.html`.
- GREEN: `node --test games/2026-W38-lantern-watch/tests/core.test.cjs`: 6/6 pass.
- GREEN: `PLAYWRIGHT_BROWSERS_PATH=/root/weekly-games/.cache/ms-playwright node games/2026-W38-lantern-watch/tests/browser.cjs`: PASS complete rehearsal win/restart; both captains through local fixture; key isolation; model HTML rendered as text; 429 recovery; cancellation; 390px overflow; zero page errors.
- Final `npm test`: 17/17 pass across W37 and W38 core suites. `npm run test:browser`: PASS on W38 source and again on the extracted kickoff build. W37 `npm run test:last-inn` and `npm run test:qa` also pass, preserving the prior game.
- Visual inspection at 1280px: title, connection disclosure, setup fields and game panels render without clipping; automated 390px check reports no horizontal overflow. This is agent inspection, not human playtesting.
- `npm audit --omit=optional`: 0 vulnerabilities. `git diff --check`: clean.
- Independent fail-closed review initially found three live-path issues: consent revocation did not block later calls, failed setup retained a key in the field, and mismatched evidence reached the provider before local validation. Regression tests were added first; all three issues were fixed. Second independent review passed with no security concerns, logic errors, or requirement failures.
- Packaged development preview: `/root/weekly-games/artifacts/2026-W38-lantern-watch-kickoff.zip`, 10,285 bytes, SHA-256 `e5118ae11bc7751e317e869ac25fbf632a70ac99f2887fec21190ed5a6aafd6f`. CRC and byte-for-byte equality for all six runtime/documentation files pass; full Chromium gameplay/protocol suite passes against its extracted contents.

## Blockers and limitations

- Live AI model/provider test NOT RUN: no authorized credentials or paid-test budget. No billable request initiated. Scripted rehearsal and local HTTP fixture are not live-model evidence.
- No human playtest, non-Chromium browser, physical touch device, audio, or save system verification.
- GitHub Release upload is not part of Monday kickoff; source push status is recorded below.

## Next bounded task

Exercise question clarity and route comprehension with a human tester without adding ships or systems. If authorized credentials and budget become available, run one bounded live-model compatibility/knowledge-fidelity test against the documented protocol.

## Release paths and remote status

- Launch source/build: open `games/2026-W38-lantern-watch/index.html`.
- Status: in development; no release/tag created.
- Source destination: `git@github.com:jayis1/weekly-games.git`, branch `main`.
- Commit SHA, push, and exact remote-SHA comparison are recorded by the kickoff completion report after the immutable commit exists.
