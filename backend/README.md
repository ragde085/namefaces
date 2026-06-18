# backend — NameFaces Quiz

Python FastAPI. Serves auth, quiz generation, scoring, leaderboard, and HR roster import.

## Scope
- **Auth:** Google Workspace OIDC; Admin/Player roles from Workspace groups.
- **Quiz:** generate questions (same-pool random distractors, name/face rounds); time-weighted scoring (`100 + timeLeft*10`).
- **Data:** PostgreSQL (employees, attempts, history, leaderboard) + GCS for headshots.
- **Leaderboard:** weekly + all-time, tie-break earliest achieved, dept filter.
- **HR import:** HRIS sync (CSV/API), idempotent upsert, admin-edits-win merge.

See [../docs/PRD.md](../docs/PRD.md) for full requirements.

> Not scaffolded yet — design + reqs only.
