from __future__ import annotations

import unicodedata
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import AttemptAnswer, Employee, QuizAttempt

FIRST = [
    "Sofía", "Mateo", "Valentina", "Diego", "Camila", "Santiago", "Regina", "Emiliano",
    "Ximena", "Sebastián", "Renata", "Leonardo", "Daniela", "Ángel", "Fernanda", "Iker",
    "Andrea", "Maximiliano", "Paula", "Adrián", "Lucía", "Bruno", "Mariana", "Carlos",
]
LAST = [
    "García", "Hernández", "Martínez", "López", "González", "Pérez", "Sánchez", "Ramírez",
    "Torres", "Flores", "Rivera", "Gómez", "Díaz", "Cruz", "Morales", "Ortiz",
    "Gutiérrez", "Chávez", "Ramos", "Ruiz", "Vargas", "Castillo", "Jiménez", "Mendoza",
]
ROLES = [
    "Software Engineer", "Senior Engineer", "QA Engineer", "Data Scientist", "DevOps Engineer",
    "Product Manager", "UX Designer", "Engineering Manager", "Scrum Master", "Solutions Architect",
]
DEPTS = ["Engineering", "Data", "Design", "Product", "QA", "DevOps"]
SKINS = ["#f0c9a6", "#e8b489", "#d49a6a", "#a56c43", "#8d5524", "#fcd9b8"]
HAIRS = ["short", "long", "bun", "bald"]
HAIR_COLORS = ["#2b2b2b", "#4a3320", "#6b4f2a", "#1a1a1a", "#7a5c3e"]


def seed_employees(db: Session) -> int:
    if db.scalar(select(Employee).limit(1)):
        return 0  # already seeded
    for i, first in enumerate(FIRST):
        db.add(
            Employee(
                id=f"emp_{i + 1}",
                first=first,
                name=f"{first} {LAST[i]}",
                role=ROLES[i % len(ROLES)],
                dept=DEPTS[i % len(DEPTS)],
                # DEV: placeholder photo so employees are quizzable.
                # PRODUCTION: real GCS object URL; None => excluded from quizzes.
                photo_url=f"/photos/emp_{i + 1}.png",
                hue=(i * 37) % 360,
                skin=SKINS[i % len(SKINS)],
                hair=HAIRS[i % len(HAIRS)],
                hair_color=HAIR_COLORS[i % len(HAIR_COLORS)],
            )
        )
    db.commit()
    return len(FIRST)


def _ascii(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFKD", s) if not unicodedata.combining(c))


def email_for(name: str) -> str:
    return _ascii(name).lower().replace(" ", ".") + "@griddynamics.com"


def seed_attempts(db: Session) -> int:
    # DEV: synthesize leaderboard history for ~12 colleagues so the board/podium
    # has content. PRODUCTION: leaderboard is built only from real player attempts.
    if db.scalar(select(QuizAttempt).limit(1)):
        return 0
    emps = db.scalars(select(Employee).limit(12)).all()
    now = datetime.now(timezone.utc)
    count = 0
    for i, e in enumerate(emps):
        score = 900 - i * 28 + (i % 5) * 13
        total, correct = 8, max(3, 8 - (i % 4))
        # Stagger dates: first half within this week, rest older.
        created = now - timedelta(days=(i % 3) if i < 6 else 9 + i)
        db.add(
            QuizAttempt(
                player_email=email_for(e.name),
                player_dept=e.dept,
                score=score,
                correct=correct,
                total=total,
                accuracy=round(correct / total * 100),
                quiz_version="seed",
                created_at=created,
                answers=[AttemptAnswer(employee_id=e.id, correct=True)],
            )
        )
        count += 1
    db.commit()
    return count
