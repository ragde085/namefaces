# frontend — NameFaces Quiz

React + Vite SPA. Recreates the hifi design ([../docs/design/DESIGN_SPEC.md](../docs/design/DESIGN_SPEC.md)) — **do not port** the prototype runtime (`support.js`).

## Scope
5 screens: Login → Dashboard → Quiz → Results → Leaderboard. Three themes (`fresh`/`sunset`/`grape`), oklch tokens, Fredoka + Nunito.

## Notes
- Replace placeholder CSS avatars with real employee photos (rounded-square frame, initials fallback).
- Replace prototype demo login with Google Workspace OIDC.
- `questions`, `people`, `leaderboard`, `history` come from the backend API — no local seed data.

> Not scaffolded yet — design + reqs only.
