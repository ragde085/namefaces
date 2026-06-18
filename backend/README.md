# backend — NameFaces Quiz

Python FastAPI. Serves auth, quiz generation, scoring, leaderboard, and HR roster import.

## Run (dev)

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # dev defaults to SQLite, seeds demo employees
uvicorn app.main:app --reload --port 8000
```

- API docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

## Layout

```
app/
├── main.py          # app, CORS, router wiring, startup (create_all + seed)
├── config.py        # settings (.env)
├── db.py            # engine/session/Base (SQLite dev, Postgres prod)
├── models.py        # Employee, QuizAttempt, AttemptAnswer
├── schemas.py       # Pydantic I/O
├── auth.py          # DEV header stub → TODO Google OIDC + group roles
├── seed.py          # demo employees (dev)
├── services/        # quiz (gen + scoring), leaderboard (weekly/all-time)
└── routers/         # auth, quiz, employees (admin), leaderboard
```

## Endpoints

| Method | Path | Notes |
|---|---|---|
| GET | `/auth/me` | current user (Player/Admin) |
| GET | `/quiz?length=` | generate quiz (name/face rounds) |
| POST | `/attempts` | submit a finished quiz |
| GET | `/history` | player's past attempts |
| GET | `/leaderboard?window=&dept=` | weekly / all_time, dept filter |
| GET | `/employees` | admin: roster (dept/status filters) |
| POST | `/employees` | admin: create (sets admin_locked) |
| PATCH | `/employees/{id}` | admin: edit / retire (sets admin_locked) |
| POST | `/employees/import` | admin: HRIS upsert (admin-edits-win) |
| GET | `/config` | quiz params (length, timer) |
| PATCH | `/config` | admin: update quiz params (persisted) |

## Production TODO
- Replace dev auth stub with Google Workspace OIDC verification + group-based roles.
- Alembic migrations instead of `create_all`.
- Postgres (Cloud SQL) + GCS for headshots; `photo_url` = GCS object URL.
- Scoring (`100 + timeLeft*10`) computed/validated server-side, not trusted from client.

See [../docs/PRD.md](../docs/PRD.md) for full requirements.
