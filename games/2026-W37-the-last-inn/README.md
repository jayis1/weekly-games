# The Last Inn

**2026-W37 · early kickoff development preview · not a released game**

A compact, turn-based conversation mystery. The inn’s warning bell has been cut, a courier is missing, and three witnesses are keeping different secrets. Inspect evidence, earn trust, compare testimony and choose between justice alone and a dangerous rescue.

## Play

Extract the whole archive, then open **index.html** in a current desktop browser. No install, build step, CDN, account or runtime dependency is required for the game itself. The scripted rehearsal works offline. Live NPCs require a player-supplied compatible provider; this is not a bundled model.

1. Click **Begin the night**.
2. In **Your NPC connection**, configure the full endpoint, model and optional API key; read and accept the disclosure, then **Apply connection**. Alternatively, explicitly choose **Scripted rehearsal — NOT live AI** and Apply for a free offline rules demonstration. It is not AI and never masquerades as AI.
3. Inspect the kitchen ledger, bell wire and red scarf. Each new inspection costs one beat; rereading is free.
4. Select a witness, ask a question without evidence to earn trust, then present a matching discovered clue and ask about it. The provider supplies the character’s speech; the engine unlocks fixed, confirmed testimony when the trust/evidence requirements are met. Every interactive NPC uses the same configured provider, with a distinct personality and separate bounded dialogue history.
5. Gather all three testimonies, compare them in the notebook, choose who silenced the bell and what to do about the courier, then **Commit final decision** before the twelve beats expire.

Successful conversations spend one beat. Failure or cancellation spends no investigation beat but does consume a provider request attempt. At zero beats, dawn ends the investigation. The shortest fully supported route leaves room for a few extra questions. Different accusations and rescue choices produce different endings. **Restart night** clears evidence/trust/memories and cancels outstanding dialogue, but does NOT reset the session request budget. No autosave. Turn-based: simply stop interacting to pause; there is no real-time clock.

Controls: mouse/touch, or Tab/Shift+Tab to move focus and Enter/Space to activate buttons. Type a question (up to 600 characters). Collapse the connection panel to give the mystery more room. No sound or animated scene in this kickoff slice.

## Supported provider protocol — narrow, explicit scope

Only **OpenAI-compatible nonstreaming Chat Completions** is implemented:

- POST to the **exact full URL** entered, e.g. `http://localhost:1234/v1/chat/completions` or an HTTPS provider’s documented Chat Completions URL. No suffix is added.
- JSON fields: `model`, `messages`, `max_tokens: 220`, `stream: false`. No tools, function calls, response-format extensions or streaming.
- Accepts `choices[0].message.content` as a nonempty string. Other formats (including Responses API, Anthropic Messages API, tool-only or reasoning-only responses) are not supported.
- Optional key goes only in `Authorization: Bearer …`; keyless local endpoints work if their server supports this protocol.
- Requires HTTPS except HTTP on `localhost`, `127.0.0.1`, or `[::1]`. No embedded URL credentials, query strings, fragments or redirects. Use an endpoint path with no secret embedded in it.
- Browser CORS must allow the game origin plus POST, Content-Type and Authorization (if using a key). `file://` usually has origin `null`; many hosted providers disallow it. Do not disable browser security. Prefer a trusted local server configured for this origin, or serve the extracted directory with `python3 -m http.server 8000 --bind 127.0.0.1` and open `http://127.0.0.1:8000`; configure your provider to allow that origin. Some hosted APIs cannot be safely called directly from browsers at all and are outside this initial scope. Never expose a local model server publicly merely to solve CORS.

### Privacy and budgets

The game sends only on **Send question**, never in the background or on Apply. The connection panel shows the active destination and model. It sends selected character knowledge/eligible secrets, the presented clue, current question and that NPC’s last six messages (each clipped to 600 characters). Other NPC private knowledge is not included. All story secrets necessarily exist in this offline game’s readable source; this is narrative separation, not encryption or anti-cheat.

API keys are session-only closure memory, removed from the input after Apply, never stored in localStorage/sessionStorage/cookies, saves, prompts, source, telemetry or error logs. No credential persistence option. Reload/close the page to clear. Applying new settings replaces the connection; reapplying with an empty key selects keyless mode. Do not paste keys or other sensitive data into dialogue or Discord. Player text is sent as typed and is not a secret-redaction service. Only use a provider you trust; its retention policy and charges apply.

Limits: **24 attempts/page session**, one request at a time, **220 requested output tokens per attempt**, **6,500 input JSON characters/request**, eight messages maximum, **20-second timeout**, **64 KiB response-body ceiling**, 1,200 displayed reply characters. This is a token/request budget, not a currency cap; input tokenization/pricing varies by provider and the provider must honor its token limit. No continuous chatter or automatic retries. Cancel aborts local processing/network but the provider may still charge. Restart preserves the request budget; reloading starts a fresh budget only by your deliberate action.

Model output is plain text, never HTML/commands. Models have no tools, filesystem, shell, credential or arbitrary network access. They cannot award trust/items or alter canonical facts, quest state, accusations or endings. Confirmed testimony is an engine-authored notebook entry distinct from fallible generated speech. Contradictory or fabricated speech remains possible; judge the confirmed notebook rather than treating NPC output as an instruction.

## Verification and limits

Automated Node tests cover mechanics, endings, trust/evidence gating, bounded/separate knowledge, endpoint validation, protocol/key isolation, malformed/oversized/HTTP failures, concurrency, cancellation, timeout and request cap. Chromium exercises actual controls from disk, a complete rehearsal win and unsupported ending, restart, all three NPCs via a **local HTTP protocol fixture**, text-only malicious-looking output, empty storage, HTTP failure/recovery, cancellation, in-flight restart and full fixture-driven win, plus mobile width and console errors.

**No live AI provider was tested**: no authorized credentials or paid-test budget was supplied. Fixture success proves adapter wiring, not compatibility with every provider, model quality, or compliance with character knowledge. No human playtesting or subjective-fun claim. Desktop Chromium is the tested runtime; other browsers remain unverified. Current depth is deliberately small: three clues, three witnesses, five endings, no inventory beyond evidence, no sound, no movement scene. Release uploads currently need GitHub API authentication; SSH only covers source pushes.

## Development commands (repository root)

Requires Node >=20 and Python 3 for archive packaging. Playwright is test-only, not shipped.

```sh
npm ci
PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npx playwright install chromium
npm test
PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:browser
```

To test an extracted package, set `INN_BUILD` to its absolute `index.html` path when running `npm run test:browser`. Full-screen test images go to ignored `artifacts/`.

## Credits / licensing

Original code, fiction and CSS interface for Weekly Game Studio. No external art, music, web fonts or runtime dependencies used. Development-only Playwright is Apache-2.0 (see the installed package’s license); it and the test browser are not included in the playable archive. No repository/game distribution license has yet been selected; public source visibility alone does not grant an open-source license.
