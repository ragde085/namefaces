# NameFaces Quiz

Light-hearted internal web app helping **Grid Dynamics México** employees learn colleagues' names, roles, and departments. Pairs a headshot with four name options (one correct, three distractors); players earn time-weighted points and climb a company leaderboard.

Single monorepo: docs + frontend + backend.

```
docs/      # PRD, design spec, hifi handoff reference
frontend/  # React + Vite SPA
backend/   # Python FastAPI
```

## Docs
- [PRD](docs/PRD.md) — product requirements
- [Architecture](docs/ARCHITECTURE.md) — as-built design, data model, flow diagrams
- [Deployment](docs/DEPLOYMENT.md) — local run + GCP topology
- [Design Spec](docs/design/DESIGN_SPEC.md) — extracted from hifi handoff
- [PRD ↔ Design Reconciliation](docs/design/PRD_RECONCILIATION.md)
- [Handoff prototype](docs/design/handoff/) — reference HTML (not production code)

## Stack
React + Vite · Python FastAPI · PostgreSQL + GCS · Google Workspace SSO · GCP

> Status: design + requirements ready. App not scaffolded yet.

## License
Apache-2.0.
