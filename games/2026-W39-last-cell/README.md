# Last Cell — 2026-W39

Author: jayis1

A compact deduction game aboard the flooding deep-sea station Thalassa. One power cell survives — enough to keep two of three failing subsystems alive. Read the station telemetry, question each subsystem's specialist through your own AI provider, and cut power to the one system that can actually hold on its own reserve. Cut wrong and the crew is lost.

Status: RELEASED 2026-09-23 (2026-W39). Final playtest pass complete; shipped on `main`.

## How to play

Open `index.html` directly in a modern browser (Chromium/Chrome verified). No server, build step, or runtime dependency.

1. Decode station readouts (reactor coolant, CO₂ scrubbers, comms array draw). Each decode spends one of seven power cycles.
2. Hail a specialist on the comm channel. Listen once to build rapport, then present the matching readout to confirm that subsystem's true status. Each successful call also spends a cycle.
3. You have enough reserve to confirm two subsystems, not all three — so deduce which one is secretly stable.
4. Commit the reroute: cut power to one subsystem. The last cell keeps the other two alive. Save the crew only if you cut the genuinely stable system and confirmed both survivors first.

## BYO-AI NPCs

Every interactive specialist is powered by *your own* AI model/provider (bring-your-own-provider), per the studio's mandatory requirement. Configure an OpenAI-compatible Chat Completions endpoint, model, and optional session-only API key.

- **Chief Doss Mara** (reactor) — blunt, numbers over nerves; genuinely failing.
- **Medic Wren Ka** (oxygen) — quiet, holding panic at bay; genuinely failing.
- **Signalman Ivo Pell** (comms) — anxious about the beacon, but his array is on its own charged battery bank and is the one you can safely cut.

Each specialist has a distinct persona and bounded, character-specific knowledge and memory (last four exchanges). The engine owns all canonical facts, status confirmations, cycle budget, and the win/loss rule; model replies are treated as untrusted content and rendered as inert text.

### Safety and cost controls

- API key stays in memory for the page session only; sent only in the `Authorization` header, never in the request body, logs, saves, or source. No `localStorage`/`sessionStorage` writes.
- Explicit per-request consent; manual requests only; 12-request session budget; one request in flight; cancel button; 15-second timeout; 180 output tokens; bounded input and 48 KiB response cap.
- HTTPS required (HTTP allowed only on localhost). Connection failures are visible and recoverable without spending a cycle.
- **Scripted rehearsal** is a clearly labeled offline demonstration — it is *not* live AI. Provider-protocol tests (local HTTP fixture) and any live-model tests are reported separately.

## Tests

- `npm test` — core logic and provider unit suite (all games).
- `npm run test:browser` — headless Chromium gameplay + local protocol-fixture run for Last Cell.

## Known limitations

- No live AI model/provider test has been run: no authorized credentials or paid-test budget. Scripted rehearsal and the local HTTP fixture are not live-model evidence.
- No human playtest, non-Chromium browser, touch device, audio, or save-system verification.
- No audio or save system is included by design.

## License and assets

Last Cell's original code and presentation are licensed under the [MIT License](LICENSE), copyright 2026 jayis1. The release bundles no third-party assets or runtime dependencies.
