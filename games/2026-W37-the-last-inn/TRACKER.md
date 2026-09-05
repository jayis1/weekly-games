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
Monday September 7: RESUME this exact project. Exercise an authorized keyless local model if one is made available (otherwise retain explicit live-test blocker), then exercise provider knowledge fidelity and player comprehension of the clue-to-witness puzzle without expanding the three-clue scope. Witness-specific conversational feedback is implemented in the kickoff-resume increment below. Human playtest remains necessary before release.

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
- Source destination: `git@github.com:jayis1/weekly-games.git`, branch `main`. Tested source checkpoint `191c7b91ded836c30399db5ddc0aa72bf238675e` committed and pushed successfully. `git ls-remote origin refs/heads/main` returned that exact SHA, matching local HEAD. This documentation-only follow-up records the verified source checkpoint; its own push is verified in the final cron report.
- GitHub Release upload blocked: `gh auth status` reports not logged into any hosts. SSH source access does not supply API authentication. No Release/tag created during early kickoff.

## Repeated kickoff resumed — 2026-09-05 21:18 UTC
- Acquired exclusive studio lock with owner `kickoff-2026-09-05`; read existing tracker and current.json. Actual UTC ISO week W36, bootstrap cycle W37. Resumed existing project; current.json already has correct identity/status and was preserved. No duplicate project or release created.
- Reverified Node v22.22.3/npm 10.9.8 and actual Chromium complete gameplay from disk before changes: baseline 9/9 core tests and browser suite passed. Engine/export remains self-contained HTML/CSS/JavaScript, no purchase or login.
- Bounded improvement: canonical witness-specific feedback now distinguishes first trust, listening without evidence, mismatched evidence, newly confirmed testimony and already-recorded testimony. Dawn ending takes precedence over routine feedback. No additional API calls or model-controlled state; all three NPCs retain the existing BYO-AI connection.
- RED: `npm test` failed exactly on missing `G.feedback` (9 pass, 1 fail). GREEN: `npm test` now **10/10 pass** including feedback branches; all earlier mechanics/provider tests retained.
- `PLAYWRIGHT_BROWSERS_PATH=/root/weekly-games/.cache/ms-playwright npm run test:browser`: **PASS**, including new actual-control trust/mismatch feedback checks, unchanged notebook after wrong evidence, deadline feedback/disabled send, restart and full winning flows. Existing all-three-NPC local HTTP fixture, key isolation, XSS, failure/cancel/recovery and mobile checks pass; no JS page errors.
- Independent read-only review **passed=true**, no security concerns or logic errors. Added reviewer-suggested trusted/no-evidence and final-beat regression coverage; no production code changed after approval. `git diff --check`: clean.
- `python3 artifacts/package-resume.py`: archive CRC and all six extracted runtime/docs files byte-for-byte comparison **PASS**. New preview: `/root/weekly-games/artifacts/2026-W37-the-last-inn-kickoff-feedback.zip`, **14,505 bytes**; SHA-256 `613743646086ee2115fbd7e13150fb0a94ca0d17f828b3c894a7b9f64ad9f8f3`.
- `INN_BUILD=/root/weekly-games/artifacts/feedback-check/the-last-inn/index.html PLAYWRIGHT_BROWSERS_PATH=/root/weekly-games/.cache/ms-playwright npm run test:browser`: **PASS** full gameplay suite on extracted preview.
- Live AI testing **NOT RUN**, no authorized provider/budget supplied; local HTTP fixture is synthetic, not live-model evidence. No human playtest. `gh auth status` reconfirmed no logged-in hosts; Release upload remains blocked.
- `git fetch origin` succeeded via approved SSH remote. This increment is to be committed/pushed to `main`; exact live remote SHA verification is reported in the cron final response. Root catalog updated; old preview preserved. Monday resumes W37 for authorized live-model validation and bounded puzzle clarity work.

## BUILD recovery completion — 2026-09-05
- UTC clock: `2026-09-05T21:28:54Z`, actual ISO W36; approved bootstrap selects W37. Acquired exclusive studio lock as `build-recovery`; current.json matches bootstrap project and remains in_development.
- FIRST inspected existing uncommitted work: only tests/browser.cjs changed. Preserved and completed those tests rather than replacing them; prior recovery evidence remains under `artifacts/recovery-20260905T212832Z`.
- RED reproduced with `PLAYWRIGHT_BROWSERS_PATH=/root/weekly-games/.cache/ms-playwright npm run test:browser`: assertion at browser.cjs:31, ending visible (`true !== false`) immediately after Decide. Baseline `npm test`: 10/10 pass. Root cause: Decide directly invoked engine ending without a review step.
- Added smallest matching native modal confirmation: selected suspect/rescue summary, canonical testimony count and unsupported warning, safe initial focus on Keep investigating, Escape/back cancellation with focus return, explicit confirmation and ending focus. Snapshot choices are submitted only through engine validation. No changes to BYO NPC connection, knowledge, budgets, secrets or canonical rules; review/cancel/confirm make no provider calls.
- GREEN `npm test`: **10/10 pass**; full `PLAYWRIGHT_BROWSERS_PATH=/root/weekly-games/.cache/ms-playwright npm run test:browser`: **PASS**. Includes recovered reversible-review tests, changed choice summary, no beat cost, keyboard cancellation/focus, no local-provider requests during review/cancel/confirm, complete rehearsal and HTTP-fixture wins, unsupported ending, all three NPCs, restart/deadline, failure/cancel/recovery, key isolation, XSS rendering, empty storage, no JS errors and 390px open-modal overflow check.
- Independent read-only reviewer returned **passed=true**, no security concerns or logic errors; independently ran 10/10 unit tests and syntax/diff checks. Reviewer could not launch its browser without the explicit browser-cache path; parent ran full Chromium suites successfully. Added reviewer-suggested focus, keyboard, configured-provider no-request and open-mobile-modal regression assertions; no production code changed after review.
- Desktop 1280px and mobile 390px modal screenshots visually inspected: readable summary and both actions visible, no clipping/overlap. Images: ignored `artifacts/last-inn-confirm-desktop.png` and `artifacts/last-inn-confirm-mobile.png`. Agent/automated verification, not human playtesting.
- Updated game controls README and root catalog. `git diff --check`: clean. `npm audit`: **0 vulnerabilities**. Static review: no added credentials, unsafe execution or network calls.
- `python3 artifacts/package-confirmation.py`: **PASS** CRC and byte-for-byte comparison of all six runtime/docs files. New development preview `/root/weekly-games/artifacts/2026-W37-the-last-inn-preview-confirmation.zip`, **15,127 bytes**, SHA-256 `0538420248f77d8cd04d4e02fb73863aefad19bc7b5e60691909b08cad088275`. Prior previews preserved; no release/tag created.
- `INN_BUILD=/root/weekly-games/artifacts/confirmation-check/the-last-inn/index.html PLAYWRIGHT_BROWSERS_PATH=/root/weekly-games/.cache/ms-playwright npm run test:browser`: **PASS** full gameplay/protocol/confirmation suite on extracted archive.
- Live AI provider testing **NOT RUN**; no authorized credentials/budget supplied and no billable request initiated. Local fixture is synthetic protocol evidence only. No human playtest yet. `gh auth status` reconfirmed no logged-in hosts; GitHub Release upload remains blocked.
- `git fetch origin` succeeded via approved SSH remote `git@github.com:jayis1/weekly-games.git`. This recovered increment is ready for source commit/push to main; exact live SHA comparison is reported in the final cron response.
- Next bounded task remains authorized live-model knowledge-fidelity testing if available, otherwise player comprehension/puzzle clarity verification within the existing three-clue scope. Monday September 7 RESUMES this project; this early bootstrap preview is not a release.
