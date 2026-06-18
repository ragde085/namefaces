from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .db import Base, SessionLocal, engine
from .routers import auth, config as config_router, employees, leaderboard, quiz
from .seed import seed_attempts, seed_employees
from .services.appconfig import get_config

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # PRODUCTION: replace create_all with Alembic migrations.
    Base.metadata.create_all(bind=engine)
    if settings.seed_on_startup:
        db = SessionLocal()
        try:
            get_config(db)  # ensure config row exists
            seed_employees(db)
            seed_attempts(db)
        finally:
            db.close()
    yield


app = FastAPI(title="NameFaces Quiz API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(quiz.router)
app.include_router(employees.router)
app.include_router(leaderboard.router)
app.include_router(config_router.router)


@app.get("/health", tags=["meta"])
def health() -> dict:
    return {"status": "ok"}
