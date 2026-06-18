from __future__ import annotations

from typing import Optional

from fastapi import Depends, Header, HTTPException, status

from .config import Settings, get_settings
from .schemas import UserOut


def _name_from_email(email: str) -> tuple[str, str]:
    local = email.split("@")[0]
    tokens = [t for t in local.replace(".", " ").replace("_", " ").replace("-", " ").split() if t]
    name = " ".join(t.capitalize() for t in tokens) or "Player"
    return name, name.split(" ")[0]


def _is_admin(email: str, settings: Settings) -> bool:
    return email.lower() in settings.admin_emails_list


# DEV AUTH STUB.
# PRODUCTION: verify a Google Workspace OIDC ID token (Authorization: Bearer),
# check `hd == google_hosted_domain` and `aud == google_client_id`, and derive
# Admin/Player from Workspace group membership. Replace the header shortcut below.
def get_current_user(
    x_user_email: Optional[str] = Header(default=None),
    settings: Settings = Depends(get_settings),
) -> UserOut:
    email = x_user_email or "sofia.garcia@griddynamics.com"  # demo fallback
    if "@" not in email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user")
    name, first = _name_from_email(email)
    return UserOut(
        email=email.lower(),
        name=name,
        first=first,
        dept="Engineering",
        is_admin=_is_admin(email, settings),
    )


def require_admin(user: UserOut = Depends(get_current_user)) -> UserOut:
    if not user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    return user
