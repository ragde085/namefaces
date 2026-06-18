# frontend — NameFaces Quiz

React + Vite SPA. Recreates the hifi design ([../docs/design/DESIGN_SPEC.md](../docs/design/DESIGN_SPEC.md)) — **do not port** the prototype runtime (`support.js`).

## Scope
6 screens: Login → Dashboard → Quiz → Results → Leaderboard, plus an **Admin** panel (admin-only: quiz config, HR import, add/edit/retire roster). Three themes (`fresh`/`sunset`/`grape`), oklch tokens, Fredoka + Nunito.

Backend base URL via `VITE_API_URL` (see `.env.example`). To exercise the admin panel, log in as an email listed in the backend `ADMIN_EMAILS`.

## Notes
- Replace placeholder CSS avatars with real employee photos (rounded-square frame, initials fallback).
- Replace prototype demo login with Google Workspace OIDC.
- `questions`, `people`, `leaderboard`, `history` come from the backend API — no local seed data.

> Not scaffolded yet — design + reqs only.
