# PRD ↔ Design Reconciliation

Deltas between [PRD.md](../PRD.md) and the Claude Design handoff ([DESIGN_SPEC.md](DESIGN_SPEC.md)). Design is hifi and more concrete on gameplay — adopt design where it adds detail; keep PRD where it defines production concerns (SSO, data, leaderboard window) the prototype stubbed.

| Topic | PRD | Design handoff | Resolution |
|---|---|---|---|
| Org | generic "company / region" | **Grid Dynamics México** | Adopt GD MX. |
| Scoring | +10 correct / 0 | **`100 + timeLeft*10`** (time-weighted) | **Adopt design** — faster = more points. |
| Timer default | 20s | **15s** (range 5–30) | **Adopt design** (15s). |
| Quiz length | admin-config | **8** (range 4–12) | Adopt 8 default, keep configurable. |
| Quiz formats | photo→name only | **name-round + face-round** (bidirectional, alternate by index) | **Adopt both** — new vs PRD. |
| Themes | — | **fresh / sunset / grape** (oklch) | New feature; add to PRD. |
| Auth | Google Workspace SSO | demo login, admin-created accounts | SSO is the production target. Prototype login = placeholder; replace with Google Workspace OIDC. |
| Leaderboard window | weekly + all-time | all-time sum only (prototype) | Keep PRD: weekly + all-time. Design covers all-time view only. |
| Distractors | same-pool random | 3 random distractors | ✅ match. |
| Missing photo | exclude from quizzes | initials/illustration fallback | Reconcile: **exclude** photoless employees from quizzes; keep initials fallback only for leaderboard/chips safety. |
| History persistence | Postgres (backend) | localStorage `nf_history` | Prototype-only stub → back with API/DB in production. |

## Action items
- [ ] PRD updated for scoring, timer default, quiz formats, org, themes (done in this pass).
- [ ] Replace prototype demo login with Google Workspace OIDC during FE build.
- [ ] Backend serves `questions`, `people`, `leaderboard`, `history` (no local seed data).
- [ ] Production leaderboard adds weekly window (design shows all-time only).
