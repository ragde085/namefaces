from __future__ import annotations

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./namefaces.db"
    cors_origins: str = "http://localhost:5173"

    quiz_length: int = 8
    timer_seconds: int = 15

    google_client_id: str = ""
    google_hosted_domain: str = "griddynamics.com"
    admin_emails: str = ""

    seed_on_startup: bool = True

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def admin_emails_list(self) -> List[str]:
        return [e.strip().lower() for e in self.admin_emails.split(",") if e.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
