from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class PersonOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    first: str
    role: str
    dept: str
    photo_url: Optional[str] = None
    hue: int
    skin: str
    hair: str
    hair_color: str


class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    dept: Optional[str] = None
    photo_url: Optional[str] = None
    status: Optional[str] = None


class EmployeeImportRow(BaseModel):
    id: str
    name: str
    role: str = ""
    dept: str = ""
    photo_url: Optional[str] = None


class QuestionOut(BaseModel):
    mode: str  # name | face
    person: PersonOut
    choices: List[PersonOut]


class QuizOut(BaseModel):
    quiz_version: str
    timer_seconds: int
    questions: List[QuestionOut]


class AttemptAnswerIn(BaseModel):
    employee_id: str
    correct: bool


class AttemptIn(BaseModel):
    score: int
    correct: int
    total: int
    quiz_version: str = "mvp-1"
    answers: List[AttemptAnswerIn] = []


class AttemptOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    score: int
    correct: int
    total: int
    accuracy: int
    quiz_version: str
    created_at: datetime


class LeaderboardRow(BaseModel):
    rank: int
    player: str  # email
    name: str
    first: str
    hue: int
    dept: str
    points: int
    is_you: bool = False


class LeaderboardOut(BaseModel):
    window: str  # weekly | all_time
    dept_filter: str
    rows: List[LeaderboardRow]


class UserOut(BaseModel):
    email: str
    name: str
    first: str
    dept: str
    is_admin: bool
