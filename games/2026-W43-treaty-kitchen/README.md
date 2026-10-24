# Treaty Kitchen — 2026-W43

Author: jayis1

A compact negotiation puzzle. Two rival delegations sit down to one shared meal in the Neutral Hall tonight, and you are the cook. Question each delegate through your own AI provider about what they can never eat, what would honour their people, and what they would rather not — then compose a three-ingredient menu that keeps both at the table. Serve a taboo and the treaty collapses; put both feast dishes on the table and it is signed.

Status: IN DEVELOPMENT (2026-W43, feature freeze; Friday QA pass complete). Core loop playable, edge-case hardened and QA-exercised in headless Chromium; not released.

## How to play

Open `index.html` directly in a modern browser (Chromium/Chrome verified). No server, build step, or runtime dependency.

1. Light the stove and apply a connection (scripted rehearsal, or live BYO-AI with your own endpoint/model/key).
2. You have six hours. Every answered question costs one hour (Ctrl+Enter in the question box also asks; the game is fully keyboard-playable). Ask Envoy Maret Ilsk (Highland Clans) and Chancellor Oru Venn (Delta Assembly) what they can never eat, what would honour them, or how they feel about a named ingredient.
3. Pick exactly three of seven pantry ingredients and serve. Endings: **The table empties** (a taboo was served), **A grudging accord** (no taboo, but a delegation's feast dish was missing), **Treaty signed** (both feast dishes, no taboo).
4. Start a new banquet to play again.

## BYO-AI NPCs

Both delegates are powered by *your own* AI model/provider (bring-your-own-provider), per the studio's mandatory requirement. Configure an OpenAI-compatible Chat Completions endpoint, model, and optional session-only API key.

- **Envoy Maret Ilsk** (Highland Clans) — proud, dry-humoured; one sacred taboo, one feast dish, one thing she would rather not.
- **Chancellor Oru Venn** (Delta Assembly) — warm, ceremonial; one true allergy, one treaty dish, one thing he would rather not.

Each delegate has a distinct persona and bounded, character-specific knowledge (their own seven verdicts only — never the other delegation's) and memory (last four exchanges). The engine owns the truth table, the hour budget, menu validation and all three endings; the player learns the facts solely through dialogue. Model replies are treated as untrusted content and rendered as inert text.

### Safety and cost controls

- API key stays in memory for the page session only; sent only in the `Authorization` header, never in the request body, logs, saves, or source. No `localStorage`/`sessionStorage` writes.
- Explicit per-request consent; manual requests only; 12-request session budget; one request in flight; cancel button; 15-second timeout; 180 output tokens; bounded input and 48 KiB response cap.
- HTTPS required (HTTP allowed only on localhost). Connection failures are visible and recoverable without spending an hour.
- **Scripted rehearsal** is a clearly labeled offline demonstration driven by keyword matching — it is *not* live AI. Provider-protocol tests (local HTTP fixture) and any live-model tests are reported separately.

## Tests

- `npm test` — core logic and provider unit suite (all games).
- `npm run test:treaty` — headless Chromium gameplay + local protocol-fixture run for Treaty Kitchen.

## Known limitations

- No live AI model/provider test has been run: no authorized credentials or paid-test budget. Scripted rehearsal and the local HTTP fixture are not live-model evidence.
- No human playtest, non-Chromium browser, or touch-device verification. There is no audio, pause or save system by design (turn-based, nothing runs between inputs; a page reload starts a fresh banquet and forgets the connection).
- Frozen scope: no dossier/notes panel (the dialogue log keeps every answer on screen), no audio, no save system.

## License and assets

Treaty Kitchen's original code and presentation are licensed under the [MIT License](LICENSE), copyright 2026 jayis1. The release bundles no third-party assets or runtime dependencies.
