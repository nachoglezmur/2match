# backend/models.py
from __future__ import annotations

import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .extensions import db  # ← CAMBIO IMPORTANTE: de .app a .extensions


def _uuid() -> str:
    return str(uuid.uuid4())


class BaseModel(db.Model):
    __abstract__ = True

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    created_at: Mapped[datetime] = mapped_column(
        db.DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )


class Event(BaseModel):
    __tablename__ = "events"

    name: Mapped[str] = mapped_column(db.String(255), nullable=False)
    description: Mapped[str | None]
    location: Mapped[str | None]
    event_date: Mapped[datetime | None]

    participants: Mapped[List["Participant"]] = relationship(
        back_populates="event",
        cascade="all, delete-orphan",
    )


class User(BaseModel):
    __tablename__ = "users"

    google_id: Mapped[str] = mapped_column(db.String(255), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(db.String(255), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(db.String(255), nullable=False)
    picture: Mapped[str | None] = mapped_column(db.String(255))

    participants: Mapped[List["Participant"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )


class Participant(BaseModel):
    __tablename__ = "participants"

    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), db.ForeignKey("users.id")
    )
    user: Mapped[Optional["User"]] = relationship(back_populates="participants")  # ← CAMBIO

    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), db.ForeignKey("events.id")
    )
    full_name: Mapped[str] = mapped_column(db.String(255), nullable=False)
    email: Mapped[str | None] = mapped_column(db.String(255))
    phone: Mapped[str | None] = mapped_column(db.String(50))
    company: Mapped[str | None] = mapped_column(db.String(255))
    role: Mapped[str | None] = mapped_column(db.String(255))
    bio: Mapped[str | None] = mapped_column(db.Text)
    goals: Mapped[str | None] = mapped_column(db.Text)
    share_phone: Mapped[bool] = mapped_column(db.Boolean, default=True)

    interests: Mapped[list] = mapped_column(db.JSON, default=list)
    offers: Mapped[list] = mapped_column(db.JSON, default=list)
    needs: Mapped[list] = mapped_column(db.JSON, default=list)

    event: Mapped["Event"] = relationship(back_populates="participants")
    initiated_actions: Mapped[List["MatchAction"]] = relationship(
        back_populates="initiator",
        foreign_keys="MatchAction.initiator_id",
        cascade="all, delete-orphan",
    )
    received_actions: Mapped[List["MatchAction"]] = relationship(
        back_populates="target",
        foreign_keys="MatchAction.target_id",
        cascade="all, delete-orphan",
    )


class MatchAction(BaseModel):
    __tablename__ = "match_actions"

    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), db.ForeignKey("events.id")
    )
    initiator_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), db.ForeignKey("participants.id")
    )
    target_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), db.ForeignKey("participants.id")
    )
    action: Mapped[str] = mapped_column(db.String(32), nullable=False)
    reason: Mapped[dict | None] = mapped_column(db.JSON, default=dict)

    initiator: Mapped["Participant"] = relationship(
        back_populates="initiated_actions",
        foreign_keys=[initiator_id],
    )
    target: Mapped["Participant"] = relationship(
        back_populates="received_actions",
        foreign_keys=[target_id],
    )

    __table_args__ = (
        db.UniqueConstraint("event_id", "initiator_id", "target_id"),
    )