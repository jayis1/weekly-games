# Lantern Watch

Author: jayis1

A storm-radio dispatch puzzle for 2026-W38. Decode two harbor signals, question two captains through the player’s own AI provider, verify each route, and commit a docking/tug order before six watches expire.

Run

Open `index.html` directly in a modern browser. No server, build step, account, or network connection is required for the clearly labeled scripted rehearsal.

Controls

1. Select “Scripted rehearsal” and apply the connection, or configure live mode.
2. Decode each signal.
3. Call each captain once to establish trust, then call again while presenting that captain’s matching signal.
4. Set the first vessel and tug order, then commit.
5. Use “Restart watch” for a clean game-state reset. Provider settings remain only in page memory.

BYO-AI protocol and privacy

Live mode supports a player-supplied OpenAI-compatible, non-streaming Chat Completions endpoint. HTTPS is required except for HTTP loopback endpoints. The player supplies an endpoint, model, and optional API key. Browser providers must permit CORS.

Each manual transmission sends:

- the selected captain’s distinct bounded persona and authored knowledge;
- the player’s current question;
- at most four earlier question/answer exchanges with that captain, preserving both sides in order;
- the configured model name.

The optional API key is held in JavaScript memory for the page session, removed from the visible field, sent only in the HTTP Authorization request header, and never stored in web storage, game state, prompts, logs, or files. The configured provider may retain conversation data and may charge for requests. Check its terms before authorizing live mode.

Limits: one request at a time, 12 attempts per page session, 15-second timeout, 180 output-token request cap, 6,000-character serialized context cap, 48 KiB response cap, explicit cancellation, no redirects, no automatic retry, no tools, and no automatic paid chatter. Provider failures spend no game watch and remain retryable. Scripted rehearsal is explicitly labeled offline demonstration and is not live AI.

Security model

The engine owns signals, trust, route confirmations, the deadline, and endings. Model text is rendered as text only and cannot invent evidence, execute actions, choose URLs, access credentials, or alter game state. Captain memories and knowledge are separate and bounded.

Tests

From the monorepo root:

- `npm test` — mechanics, endings, memory/knowledge boundaries, endpoint policy, request shape, failures, cancellation, concurrency, and budgets for all games.
- `PLAYWRIGHT_BROWSERS_PATH=/root/weekly-games/.cache/ms-playwright npm run test:browser` — actual Chromium gameplay and protocol flows for the current game.

Known limitations

- No live model/provider has been tested because no credentials or paid-test budget were authorized. The local HTTP fixture proves protocol and browser behavior only.
- No human playtest, non-Chromium browser, physical touch-device, audio, or persistent save verification yet.
- Rehearsal dialogue is deterministic and is not evidence of live model quality.

Assets and license

All visuals and text are original CSS/HTML authored for this project by jayis1. No third-party runtime assets or libraries are included. No license has been granted yet.
