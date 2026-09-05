# The Last Inn — 2026-W37

Status: in development. Early bootstrap kickoff 2026-09-05; NOT a release.
Monday September 7 must resume this project.

## Core loop and scope
Investigate three fixed clues at a stormbound inn; converse with three distinct BYO-AI NPCs, earn trust by listening and present evidence to obtain corroborated testimony. Before twelve investigation beats expire, decide whom to hold responsible and whether to rescue the stranded courier. Engine owns facts, trust, evidence and endings. Start/restart; turn-based, no real-time pause needed.

## Acceptance tests
- Browser opens directly from disk with no runtime dependencies.
- Three clues, three NPCs, trust/evidence-gated testimony, consequential correct/incorrect final choices, deadline and restart.
- Every NPC uses the same explicitly configured OpenAI-compatible nonstreaming Chat Completions endpoint/model and optional session-only key. Explicit labeled rehearsal for offline testing, never automatic fallback.
- Consent/disclosure, fixed request/context/token budgets, timeout/cancel, visible recoverable failure, no credentials in prompts/storage/logs, no model execution/actions.
- Unit mechanics/security tests plus Chromium complete-loop tests; live-provider evidence reported separately.

## Completed and commands/results
- Read studio brief; acquired exclusive `.worker-lock` as kickoff-20260905-2100.
- `date -u`: 2026-09-05, actual ISO W36; approved bootstrap selects W37.
- Node v22.22.3, npm 10.9.8, Python 3.13.5.
- Playwright Chromium launched and clicked a real DOM control; result 123. Self-contained HTML export feasible without login/purchases.
- Initial Playwright 1.55.0 audit exposed GHSA-7mvr-c777-76hp; upgraded to 1.63.0, reinstalled Chromium, `npm audit`: 0 vulnerabilities.
- Root monorepo exists; `git fetch origin` succeeded, approved SSH remote verified.

## Blockers and limitations
- No authorized live provider credentials/budget: live-model behavior untested. Only local protocol fixture/rehearsal testing authorized.
- `gh auth status`: not logged into any GitHub hosts. Release upload blocked; SSH source push is separate.
- No human playtest yet.

## Next bounded task
Monday September 7: RESUME this exact project. Exercise an authorized keyless local model if one is made available (otherwise retain explicit live-test blocker), then improve witness-specific conversational feedback and clarity without expanding the three-clue scope. Human playtest remains necessary before release.

## Kickoff completion evidence — 2026-09-05
- Implemented start, 12-beat investigation deadline, three unique inspectable clues, three distinct NPCs, listening/trust then matching-evidence testimony, five engine-owned endings, final accusation/rescue choice and clean restart. No real-time timer; pausing requires no action.
- Implemented session-only BYO endpoint/model/optional key, consent and data/cost disclosure, narrow nonstreaming Chat Completions adapter, separate bounded NPC histories and known facts. No model tools/actions or state mutation from output; textContent rendering only.
- Provider limits: 24 attempts per page session (restart preserves), one in flight, 220 output tokens/request, <=6,500 JSON input characters, 20-second timeout/cancel, <=64 KiB response body; no retry/fallback. Failures do not spend game beats. Explicit scripted rehearsal is NOT live AI.
- Test-first evidence: core test initially failed `Cannot find module '../game.js'`; browser test initially failed `ERR_FILE_NOT_FOUND` for the absent HTML. Implemented missing behavior, then reran green.
- `npm test`: **9/9 pass**. Covers clue uniqueness, engine validation/trust/testimony, all five endings/deadline/restart, separate bounded NPC knowledge/memory, endpoint validation, protocol/key isolation, malformed/oversized/HTTP failures, cancellation/timeout/concurrency and attempt cap.
- `PLAYWRIGHT_BROWSERS_PATH=/root/weekly-games/.cache/ms-playwright npm run test:browser`: **PASS** actual Chromium UI flows: complete rehearsal win, unsupported loss, restart, all three NPCs through local HTTP fixture, no HTML execution, empty local/session storage, 429 recovery, cancellation, retry, in-flight restart, and complete fixture-driven win. No page JavaScript errors; no horizontal overflow at 390px.
- Independent read-only reviewer: **passed=true**, no security concerns or logic errors. Suggestions addressed: persisted in-flight restart and full HTTP-fixture win tests; named npm scripts and Node >=20 declared. No production source changes after approval.
- Desktop 1280px and mobile 390px full-page screenshots visually inspected: readable, no overlapping/clipped game controls; connection panel is long but collapsible. This is automated/agent verification, NOT human playtesting.
- `npm audit`: **0 vulnerabilities**. `git diff --check`: clean.
- Packaged only six runtime/docs files with Python `zipfile` into development archive; CRC test passed; extracted files byte-for-byte match tested source.
- `INN_BUILD=/root/weekly-games/artifacts/package-check/the-last-inn/index.html PLAYWRIGHT_BROWSERS_PATH=/root/weekly-games/.cache/ms-playwright npm run test:browser`: **PASS** same complete gameplay/protocol/security/recovery suite on extracted archive, not just source or title smoke test.
- Live-provider testing: **NOT RUN**. The local HTTP fixture is synthetic protocol evidence, not a real AI model. No billable API request initiated.

## Release paths and remote status
- **Not released**: this is the early kickoff preview, not Saturday's eventual release candidate. Current status remains `in_development`; W37 project identity is recorded atomically in local `current.json`.
- Tested playable preview: `/root/weekly-games/artifacts/2026-W37-the-last-inn-kickoff.zip` (14,326 bytes).
- SHA-256: `5a945ea708c9539e7fa8cd0ea3f1f1b7a3674ac4256e8ebfdca49de0b50d1e9f`.
- Launch: extract all files, open `the-last-inn/index.html`; choose explicit rehearsal or configure a compatible CORS-enabled provider. README includes launch, controls, protocol, data disclosure, licenses/asset provenance and known limitations.
- QA images: ignored `artifacts/last-inn-desktop.png` and `artifacts/last-inn-mobile.png`. Build archives/caches/test browser excluded from Git.
- Source destination: `git@github.com:jayis1/weekly-games.git`, branch `main`. Tested source checkpoint and live remote SHA verification pending below.
- GitHub Release upload blocked: `gh auth status` reports not logged into any hosts. SSH source access does not supply API authentication. No Release/tag created during early kickoff.
