from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..db import get_db
from ..schemas import LeaderboardOut, UserOut
from ..services.leaderboard import build_leaderboard

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("", response_model=LeaderboardOut)
def leaderboard(
    window: str = "all_time",  # all_time | weekly
    dept: str = "All",
    db: Session = Depends(get_db),
    user: UserOut = Depends(get_current_user),
) -> LeaderboardOut:
    return build_leaderboard(db, window=window, dept=dept, me=user.email)
