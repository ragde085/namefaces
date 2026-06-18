from __future__ import annotations

import random
from typing import List

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import Employee
from ..schemas import PersonOut, QuestionOut, QuizOut

QUIZ_VERSION = "mvp-1"


def _quizzable(db: Session) -> List[Employee]:
    rows = db.scalars(select(Employee).where(Employee.status == "active")).all()
    # PRD: exclude employees without a valid headshot.
    return [e for e in rows if e.photo_url]


def build_quiz(db: Session, quiz_length: int, timer_seconds: int) -> QuizOut:
    pool = _quizzable(db)
    if len(pool) < 4:
        # Not enough people with photos to form questions.
        return QuizOut(quiz_version=QUIZ_VERSION, timer_seconds=timer_seconds, questions=[])

    answers = random.sample(pool, min(quiz_length, len(pool)))
    questions: List[QuestionOut] = []
    for i, person in enumerate(answers):
        others = [e for e in pool if e.id != person.id]
        distractors = random.sample(others, 3)
        choices = [person, *distractors]
        random.shuffle(choices)
        questions.append(
            QuestionOut(
                mode="name" if i % 2 == 0 else "face",
                person=PersonOut.model_validate(person),
                choices=[PersonOut.model_validate(c) for c in choices],
            )
        )
    return QuizOut(quiz_version=QUIZ_VERSION, timer_seconds=timer_seconds, questions=questions)


def score_answer(correct: bool, time_left: int) -> int:
    # Time-weighted: faster = more. Wrong/timeout = 0.
    return 100 + time_left * 10 if correct else 0


def accuracy_pct(correct: int, total: int) -> int:
    return round(correct / total * 100) if total else 0
