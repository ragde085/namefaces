from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Employee(Base):
    __tablename__ = "employees"

    # Stable HRIS id (import upsert key).
    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    first: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[str] = mapped_column(String, default="")
    dept: Mapped[str] = mapped_column(String, default="")
    photo_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, default="active")  # active | retired
    # Avatar fallback traits (until real photos exist).
    hue: Mapped[int] = mapped_column(Integer, default=205)
    skin: Mapped[str] = mapped_column(String, default="#e8b489")
    hair: Mapped[str] = mapped_column(String, default="short")
    hair_color: Mapped[str] = mapped_column(String, default="#2b2b2b")
    # Admin-edits-win: fields touched manually are not overwritten on re-sync.
    admin_locked: Mapped[bool] = mapped_column(Boolean, default=False)

    @property
    def quizzable(self) -> bool:
        # PRD: employees without a valid headshot are excluded from quizzes.
        return self.status == "active" and bool(self.photo_url)


class AppConfig(Base):
    __tablename__ = "app_config"

    # Single-row config (id=1). Admin-configurable quiz parameters.
    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    quiz_length: Mapped[int] = mapped_column(Integer, default=8)
    timer_seconds: Mapped[int] = mapped_column(Integer, default=15)


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    player_email: Mapped[str] = mapped_column(String, index=True, nullable=False)
    player_dept: Mapped[str] = mapped_column(String, default="")
    score: Mapped[int] = mapped_column(Integer, default=0)
    correct: Mapped[int] = mapped_column(Integer, default=0)
    total: Mapped[int] = mapped_column(Integer, default=0)
    accuracy: Mapped[int] = mapped_column(Integer, default=0)
    quiz_version: Mapped[str] = mapped_column(String, default="mvp-1")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, index=True)

    answers: Mapped[list["AttemptAnswer"]] = relationship(
        back_populates="attempt", cascade="all, delete-orphan"
    )


class AttemptAnswer(Base):
    __tablename__ = "attempt_answers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    attempt_id: Mapped[int] = mapped_column(ForeignKey("quiz_attempts.id"), index=True)
    employee_id: Mapped[str] = mapped_column(String)
    correct: Mapped[bool] = mapped_column(Boolean, default=False)

    attempt: Mapped[QuizAttempt] = relationship(back_populates="answers")
