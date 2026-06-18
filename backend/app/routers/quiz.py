from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..config import Settings, get_settings
from ..db import get_db
from ..models import AttemptAnswer, QuizAttempt
from ..schemas import AttemptIn, AttemptOut, QuizOut, UserOut
from ..services.quiz import accuracy_pct, build_quiz

router = APIRouter(tags=["quiz"])


@router.get("/quiz", response_model=QuizOut)
def generate_quiz(
    length: Optional[int] = None,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
    _user: UserOut = Depends(get_current_user),
) -> QuizOut:
    return build_quiz(db, length or settings.quiz_length, settings.timer_seconds)


@router.post("/attempts", response_model=AttemptOut, status_code=201)
def submit_attempt(
    payload: AttemptIn,
    db: Session = Depends(get_db),
    user: UserOut = Depends(get_current_user),
) -> QuizAttempt:
    attempt = QuizAttempt(
        player_email=user.email,
        player_dept=user.dept,
        score=payload.score,
        correct=payload.correct,
        total=payload.total,
        accuracy=accuracy_pct(payload.correct, payload.total),
        quiz_version=payload.quiz_version,
        answers=[
            AttemptAnswer(employee_id=a.employee_id, correct=a.correct) for a in payload.answers
        ],
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt


@router.get("/history", response_model=List[AttemptOut])
def my_history(
    db: Session = Depends(get_db),
    user: UserOut = Depends(get_current_user),
) -> list[QuizAttempt]:
    return (
        db.query(QuizAttempt)
        .filter(QuizAttempt.player_email == user.email)
        .order_by(QuizAttempt.created_at.desc())
        .all()
    )
