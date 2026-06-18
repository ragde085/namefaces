from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Employee

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
