from __future__ import annotations

from fastapi import APIRouter, Depends

from ..auth import get_current_user
from ..schemas import UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me", response_model=UserOut)
def me(user: UserOut = Depends(get_current_user)) -> UserOut:
    # PRODUCTION: this endpoint reflects the verified Google OIDC identity.
    return user
