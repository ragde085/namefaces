from __future__ import annotations

from sqlalchemy.orm import Session

from ..config import get_settings
from ..models import AppConfig


def get_config(db: Session) -> AppConfig:
    """Get-or-create the single config row (seeded from env defaults)."""
    cfg = db.get(AppConfig, 1)
    if cfg is None:
        s = get_settings()
        cfg = AppConfig(id=1, quiz_length=s.quiz_length, timer_seconds=s.timer_seconds)
        db.add(cfg)
        db.commit()
        db.refresh(cfg)
    return cfg
