from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_user, require_admin
from ..db import get_db
from ..models import AppConfig
from ..schemas import ConfigOut, ConfigUpdate, UserOut
from ..services.appconfig import get_config

router = APIRouter(prefix="/config", tags=["config"])

QUIZ_LENGTH_RANGE = (4, 12)
TIMER_RANGE = (5, 30)


@router.get("", response_model=ConfigOut)
def read_config(
    db: Session = Depends(get_db),
    _user: UserOut = Depends(get_current_user),
) -> AppConfig:
    return get_config(db)


@router.patch("", response_model=ConfigOut)
def update_config(
    payload: ConfigUpdate,
    db: Session = Depends(get_db),
    _admin: UserOut = Depends(require_admin),
) -> AppConfig:
    cfg = get_config(db)
    if payload.quiz_length is not None:
        lo, hi = QUIZ_LENGTH_RANGE
        if not lo <= payload.quiz_length <= hi:
            raise HTTPException(status_code=422, detail=f"quiz_length must be {lo}-{hi}")
        cfg.quiz_length = payload.quiz_length
    if payload.timer_seconds is not None:
        lo, hi = TIMER_RANGE
        if not lo <= payload.timer_seconds <= hi:
            raise HTTPException(status_code=422, detail=f"timer_seconds must be {lo}-{hi}")
        cfg.timer_seconds = payload.timer_seconds
    db.commit()
    db.refresh(cfg)
    return cfg
