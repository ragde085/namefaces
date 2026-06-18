from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import List, Optional

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..models import QuizAttempt
from ..schemas import LeaderboardOut, LeaderboardRow


def _week_start() -> datetime:
    now = datetime.now(timezone.utc)
    monday = now - timedelta(days=now.weekday())
    return monday.replace(hour=0, minute=0, second=0, microsecond=0)


def build_leaderboard(
    db: Session,
    window: str = "all_time",
    dept: str = "All",
    me: Optional[str] = None,
) -> LeaderboardOut:
    # Sum points per player; tie-break earliest achieved (min created_at).
    q = select(
        QuizAttempt.player_email,
        func.max(QuizAttempt.player_dept).label("dept"),
        func.sum(QuizAttempt.score).label("points"),
        func.min(QuizAttempt.created_at).label("first_at"),
    )
    if window == "weekly":
        q = q.where(QuizAttempt.created_at >= _week_start())
    if dept != "All":
        q = q.where(QuizAttempt.player_dept == dept)
    q = q.group_by(QuizAttempt.player_email)

    records = db.execute(q).all()
    records.sort(key=lambda r: (-(r.points or 0), r.first_at))

    rows: List[LeaderboardRow] = []
    for i, r in enumerate(records):
        name, first = _display_name(r.player_email)
        rows.append(
            LeaderboardRow(
                rank=i + 1,
                player=r.player_email,
                name=name,
                first=first,
                hue=_hue(r.player_email),
                dept=r.dept or "",
                points=int(r.points or 0),
                is_you=(me is not None and r.player_email == me),
            )
        )
    return LeaderboardOut(window=window, dept_filter=dept, rows=rows)


def _display_name(email: str) -> tuple[str, str]:
    local = email.split("@")[0]
    tokens = [t for t in local.replace(".", " ").replace("_", " ").replace("-", " ").split() if t]
    name = " ".join(t.capitalize() for t in tokens) or "Player"
    return name, name.split(" ")[0]


def _hue(email: str) -> int:
    return sum(ord(c) for c in email) % 360
