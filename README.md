# Weekly Games

A collection of small, self-contained games: a fresh concept each week, using the engine that best fits the idea.

## Game catalog

| Cycle | Game | Engine | Status |
| --- | --- | --- | --- |
| 2026-W37 | [The Last Inn](games/2026-W37-the-last-inn/) | Self-contained HTML/CSS/JavaScript | Early preview; all five endings and feature-freeze Chromium QA pass — not released |

Every weekly game includes meaningful NPC conversations through the player’s own AI provider. The Last Inn begins with three witnesses, evidence and trust, and a consequential final decision. Offline scripted rehearsal is explicitly labeled and is not live AI. Provider-protocol tests and live-model tests are reported separately.

No weekly games released yet. The first cycle starts early September 5 and resumes September 7; it targets the September 12 playable release, not an early release claim.

## Layout

- `games/YYYY-Www-slug/` — independent game projects, all tracked in this one repository
- `shared/` — reusable tools where useful

Local automation instructions and machine-specific state are excluded from this public repository.

## Weekly cycle

All scheduled stages start at 12:00 UTC:

| Day | Stage |
| --- | --- |
| Monday | Concept, toolchain checks, and core loop |
| Tuesday–Thursday | Development and testing |
| Friday | QA, bug fixes, and polish |
| Saturday | Playable release target |
| Sunday | Retrospective |

The goal is a small complete game, not an unfinished collection of features. Test evidence and limitations accompany each release.

## Downloads

Packaged builds are intended for [GitHub Releases](https://github.com/jayis1/weekly-games/releases), not source history. No builds are available yet. Release uploads require authenticated GitHub API access in the development environment; SSH source pushes alone do not provide that access.

## Licensing

No repository-wide license has been selected. Each game must document the licenses of any third-party assets or dependencies; public visibility alone is not an open-source license.
