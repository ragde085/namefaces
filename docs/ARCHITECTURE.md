# Architecture — NameFaces Quiz

How the app is built. Reflects the current implementation in `frontend/` and `backend/`.

| Field | Value |
|---|---|
| Doc version | 1.0 |
| Status | As-built (MVP) |
| Related | [PRD.md](PRD.md) · [DESIGN_SPEC.md](design/DESIGN_SPEC.md) · [DEPLOYMENT.md](DEPLOYMENT.md) |

---

## 1. Stack (as implemented)

| Layer | Tech | Notes |
|---|---|---|
| Frontend | React 18 + Vite 5 (JavaScript) | SPA, screen-state navigation (no router lib) |
| Styling | Plain CSS + oklch design tokens | 3 themes; Fredoka + Nunito fonts |
| Backend | Python 3.9+ · FastAPI | Pydantic v2 I/O, SQLAlchemy 2.0 ORM |
| Database | SQLite (dev) / PostgreSQL (prod) | Same ORM; driver swap via `DATABASE_URL` |
| Photo storage | Local placeholder (dev) / GCS (prod) | `photo_url` on Employee |
| Auth | Dev header stub → Google Workspace OIDC (prod) | role from `ADMIN_EMAILS` → Workspace groups |
| Hosting | GCP (target) | Cloud Run + Cloud SQL + GCS |

## 2. Repo layout

```
namefaces/
├── docs/                 # PRD, design spec, architecture, deployment
│   └── design/           # hifi handoff + extracted spec
├── frontend/             # React + Vite SPA
│   └── src/
│       ├── App.jsx           # screen-state shell + session orchestration
│       ├── lib/              # api client, scoring/stats helpers
│       ├── components/       # Avatar, TopBar
│       └── screens/          # Login, Dashboard, Quiz, Results, Leaderboard, Admin
└── backend/              # FastAPI
    └── app/
        ├── main.py          # app, CORS, router wiring, startup seed
        ├── config.py        # env settings
        ├── db.py            # engine/session/Base
        ├── models.py        # Employee, AppConfig, QuizAttempt, AttemptAnswer
        ├── schemas.py       # Pydantic models
        ├── auth.py          # dev auth stub + admin gate
        ├── seed.py          # demo employees + attempts
        ├── services/        # quiz, leaderboard, appconfig
        └── routers/         # auth, quiz, employees, leaderboard, config
```

## 3. System architecture

```mermaid
graph TD
    subgraph Browser["Browser — React SPA"]
      UI[Screens: Login/Dashboard/Quiz/Results/Leaderboard/Admin]
      APIC[lib/api.js client]
      UI --> APIC
    end

    subgraph Server["FastAPI"]
      RT[Routers: auth, quiz, employees, leaderboard, config]
      SVC[Services: quiz gen + scoring, leaderboard agg, appconfig]
      AUTH[auth: identity + admin gate]
      ORM[SQLAlchemy models]
      RT --> SVC --> ORM
      RT --> AUTH
    end

    DB[(PostgreSQL / SQLite)]
    GCS[(Photo store — GCS)]
    IDP[Google Workspace OIDC]
    HRIS[HR System]

    APIC -->|HTTPS JSON + auth header/token| RT
    ORM --> DB
    RT -.photo_url.-> GCS
    AUTH -.verify token prod.-> IDP
    HRIS -->|import upsert| RT
```

## 4. Data model

```mermaid
erDiagram
    EMPLOYEE ||--o{ ATTEMPT_ANSWER : "referenced by"
    QUIZ_ATTEMPT ||--|{ ATTEMPT_ANSWER : contains

    EMPLOYEE {
      string id PK "HRIS stable id"
      string name
      string first
      string role
      string dept
      string photo_url "null => excluded from quizzes"
      string status "active | retired"
      int hue
      string skin
      string hair
      string hair_color
      bool admin_locked "admin-edits-win flag"
    }
    APP_CONFIG {
      int id PK "single row =1"
      int quiz_length "4-12"
      int timer_seconds "5-30"
    }
    QUIZ_ATTEMPT {
      int id PK
      string player_email
      string player_dept
      int score
      int correct
      int total
      int accuracy
      string quiz_version
      datetime created_at
    }
    ATTEMPT_ANSWER {
      int id PK
      int attempt_id FK
      string employee_id
      bool correct
    }
```

- **Leaderboard** is not a table — it is aggregated on demand from `QUIZ_ATTEMPT` (sum score per `player_email`, tie-break earliest `created_at`).
- **Quizzable rule:** an employee appears in quizzes only when `status == active` AND `photo_url` is set.

## 5. API surface

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | — | liveness |
| GET | `/auth/me` | user | current identity + `is_admin` |
| GET | `/quiz?length=` | user | generate quiz (name/face rounds) |
| POST | `/attempts` | user | submit finished quiz |
| GET | `/history` | user | player's attempts |
| GET | `/leaderboard?window=&dept=` | user | weekly / all-time, dept filter |
| GET | `/employees?dept=&status=` | admin | roster |
| POST | `/employees` | admin | create (admin-locked) |
| PATCH | `/employees/{id}` | admin | edit / retire |
| POST | `/employees/import` | admin | HRIS upsert (admin-edits-win) |
| GET | `/config` | user | quiz params |
| PATCH | `/config` | admin | update quiz params |

## 6. Flows

### 6.1 Login → session

```mermaid
sequenceDiagram
    actor U as User
    participant FE as React SPA
    participant API as FastAPI
    participant DB as DB
    U->>FE: enter email, "Sign in & play"
    FE->>FE: api.setUserEmail(email)
    FE->>API: GET /auth/me  (X-User-Email)
    API-->>FE: {email, name, is_admin}
    par load session
      FE->>API: GET /history
      API->>DB: select attempts by email
      DB-->>API: rows
      API-->>FE: history
    and
      FE->>API: GET /config
      API-->>FE: {quiz_length, timer_seconds}
    end
    FE->>U: Dashboard (stats, leaderboard peek)
```

### 6.2 Play quiz → submit

```mermaid
sequenceDiagram
    actor U as Player
    participant FE as React SPA
    participant API as FastAPI
    participant DB as DB
    FE->>API: GET /quiz?length=N
    API->>DB: select active employees with photo
    API->>API: sample answers, add 3 distractors, alternate name/face
    API-->>FE: {questions[], timer_seconds, quiz_version}
    loop each question
      U->>FE: pick option (or timeout)
      FE->>FE: scoreAnswer = correct ? 100 + timeLeft*10 : 0
    end
    FE->>API: POST /attempts {score, correct, total, answers[]}
    API->>DB: insert QuizAttempt + AttemptAnswers
    API-->>FE: AttemptOut
    FE->>API: GET /history (refresh)
    FE->>U: Results (accuracy ring, review, new-best?)
```

### 6.3 Leaderboard

```mermaid
sequenceDiagram
    actor U as User
    participant FE as React SPA
    participant API as FastAPI
    participant DB as DB
    U->>FE: open Leaderboard / change window or dept
    FE->>API: GET /leaderboard?window=weekly&dept=Data
    API->>DB: sum(score) group by player_email (filtered)
    DB-->>API: aggregates
    API->>API: sort desc, tie-break earliest, rank, mark is_you
    API-->>FE: rows[]
    FE->>U: podium + ranked list (You highlighted)
```

### 6.4 Admin — HR import & config

```mermaid
sequenceDiagram
    actor A as Admin
    participant FE as Admin screen
    participant API as FastAPI
    participant DB as DB
    A->>FE: paste HRIS rows, "Run import"
    FE->>API: POST /employees/import (admin)
    API->>DB: upsert by id; skip admin_locked rows
    API-->>FE: {created, updated, skipped_admin_locked}
    A->>FE: set quiz length/timer, "Save config"
    FE->>API: PATCH /config (admin, validated ranges)
    API->>DB: update single config row
    API-->>FE: {quiz_length, timer_seconds}
    note over FE: next GET /quiz uses new config
```

## 7. Screen navigation

```mermaid
stateDiagram-v2
    [*] --> login
    login --> dashboard: sign in
    dashboard --> quiz: start
    quiz --> results: finish (submit attempt)
    results --> quiz: play again
    results --> leaderboard
    results --> dashboard
    dashboard --> leaderboard
    dashboard --> admin: if is_admin
    leaderboard --> dashboard
    admin --> dashboard
    dashboard --> login: logout
    leaderboard --> login: logout
    admin --> login: logout
```

## 8. Auth model

- **Dev (now):** `lib/api.js` sends `X-User-Email`; backend `auth.get_current_user` trusts it and derives identity. `is_admin` = email in `ADMIN_EMAILS`. No password check.
- **Production (target):** SPA obtains a Google Workspace OIDC ID token; backend verifies signature, `aud == GOOGLE_CLIENT_ID`, `hd == GOOGLE_HOSTED_DOMAIN`; Admin/Player from Workspace group membership. The `X-User-Email` shortcut is removed.

## 9. Known gaps (tracked for hardening)

- Replace dev auth stub with real OIDC verification.
- Score is currently client-computed and trusted; validate server-side.
- `Base.metadata.create_all` on startup → replace with Alembic migrations.
- Real employee photos in GCS; favicon; richer error/loading states.
