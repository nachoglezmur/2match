from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field, validator


class ParticipantBase(BaseModel):
    event_id: str
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None
    bio: Optional[str] = None
    goals: Optional[str] = None
    share_phone: bool = True
    interests: List[str] = Field(default_factory=list)
    offers: List[str] = Field(default_factory=list)
    needs: List[str] = Field(default_factory=list)


class ParticipantCreate(ParticipantBase):
    pass


class ParticipantResponse(ParticipantBase):
    id: str

    class Config:
        orm_mode = True
        from_attributes = True


class MatchDecisionPayload(BaseModel):
    event_id: str
    initiator_id: str
    target_id: str
    action: str

    @validator('action')
    def action_must_be_match_or_skip(cls, v):
        if v not in ['match', 'skip']:
            raise ValueError('action must be either "match" or "skip"')
        return v


class MatchCandidateResponse(BaseModel):
    participant: ParticipantResponse
    score: float
    reason: dict


class ConfirmedMatchResponse(BaseModel):
    other_participant: str
    other_name: str
    other_company: Optional[str]
    other_phone: Optional[str]
    other_email: Optional[str]
    reason: Optional[dict]
