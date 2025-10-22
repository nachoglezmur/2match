from __future__ import annotations

from http import HTTPStatus
from typing import Any, Dict, List
from uuid import UUID

from flask import Blueprint, jsonify, request, g
from sqlalchemy.exc import IntegrityError

from .app import db
from .models import Event, Participant, MatchAction
from .schemas import (
    ConfirmedMatchResponse,
    MatchCandidateResponse,
    MatchDecisionPayload,
    ParticipantCreate,
    ParticipantResponse,
)
from .services.matching import find_best_matches
from .utils.text import fuzzy_match, generate_tag_variants
from .auth import login_required

api_bp = Blueprint("api", __name__)


def parse_uuid(value: str | UUID | None) -> UUID | None:
    if not value:
        return None
    if isinstance(value, UUID):
        return value
    try:
        return UUID(str(value))
    except (ValueError, TypeError):
        return None


def ensure_event(event_id: str) -> Event:
    event_uuid = parse_uuid(event_id)
    event = Event.query.filter_by(id=event_uuid).first()
    if event is None:
        event = Event(id=event_uuid, name="Networking Event")
        db.session.add(event)
        db.session.commit()
    return event


def participant_to_response(participant: Participant) -> Dict[str, Any]:
    display_interests = [tag for tag in participant.interests if isinstance(tag, str) and not tag.startswith("__auto:")]
    display_offers = [tag for tag in participant.offers if isinstance(tag, str) and not tag.startswith("__auto:")]
    display_needs = [tag for tag in participant.needs if isinstance(tag, str) and not tag.startswith("__auto:")]

    return ParticipantResponse(
        id=str(participant.id),
        event_id=str(participant.event_id),
        full_name=participant.full_name,
        email=participant.email,
        phone=participant.phone,
        company=participant.company,
        role=participant.role,
        bio=participant.bio,
        goals=participant.goals,
        share_phone=participant.share_phone,
        interests=display_interests,
        offers=display_offers,
        needs=display_needs,
    ).dict()


def match_candidate_to_response(candidate) -> Dict[str, Any]:
    participant = candidate.participant
    base = participant_to_response(participant)
    base.update(
        {
            "peer_id": str(participant.id),
            "peer_name": participant.full_name,
            "peer_company": participant.company,
            "peer_role": participant.role,
            "peer_bio": participant.bio,
            "peer_goals": participant.goals,
            "peer_interests": base["interests"],
            "peer_offers": base["offers"],
            "peer_needs": base["needs"],
            "match_score": candidate.score,
            "match_reason": candidate.reason,
        }
    )
    return MatchCandidateResponse(
        participant=ParticipantResponse(**base),
        score=candidate.score,
        reason=candidate.reason,
    ).dict() | {
        "peer_id": str(participant.id),
        "peer_name": participant.full_name,
        "peer_company": participant.company,
        "peer_role": participant.role,
        "peer_bio": participant.bio,
        "peer_goals": participant.goals,
        "peer_interests": base["interests"],
        "peer_offers": base["offers"],
        "peer_needs": base["needs"],
        "match_score": candidate.score,
        "match_reason": candidate.reason,
    }


@api_bp.route("/participants", methods=["POST"])
@login_required
def upsert_participant() -> Any:
    payload = ParticipantCreate(**request.get_json(force=True))
    ensure_event(payload.event_id)
    event_uuid = parse_uuid(payload.event_id)

    participant = Participant.query.filter_by(user_id=g.user.id, event_id=event_uuid).first()

    if participant is None:
        participant = Participant(event_id=event_uuid, user_id=g.user.id)
        db.session.add(participant)

    participant.full_name = payload.full_name
    participant.email = payload.email
    participant.phone = payload.phone
    participant.company = payload.company
    participant.role = payload.role
    participant.bio = payload.bio
    participant.goals = payload.goals
    participant.share_phone = payload.share_phone
    participant.interests = generate_tag_variants(payload.interests)
    participant.offers = generate_tag_variants(payload.offers)
    participant.needs = generate_tag_variants(payload.needs)

    db.session.commit()

    return jsonify(participant_to_response(participant)), HTTPStatus.CREATED


@api_bp.route("/me/matches", methods=["GET"])
@login_required
def get_matches() -> Any:
    event_uuid = parse_uuid('00000000-0000-0000-0000-000000000001') # Assuming a single event for now
    participant = Participant.query.filter_by(user_id=g.user.id, event_id=event_uuid).first_or_404()
    candidates = find_best_matches(db.session, participant)
    response = [match_candidate_to_response(candidate) for candidate in candidates]
    return jsonify(response)


@api_bp.route("/matches/decision", methods=["POST"])
@login_required
def record_match_decision() -> Any:
    payload = MatchDecisionPayload(**request.get_json(force=True))
    event_uuid = parse_uuid(payload.event_id)
    target_id = parse_uuid(payload.target_id)

    initiator = Participant.query.filter_by(user_id=g.user.id, event_id=event_uuid).first_or_404()
    target = Participant.query.filter_by(id=target_id, event_id=event_uuid).first()

    if initiator is None or target is None:
        return jsonify({"error": "Participante no encontrado"}), HTTPStatus.NOT_FOUND

    action = MatchAction.query.filter_by(
        event_id=event_uuid,
        initiator_id=initiator.id,
        target_id=target_id,
    ).first()

    if action is None:
        action = MatchAction(
            event_id=event_uuid,
            initiator_id=initiator.id,
            target_id=target_id,
        )
        db.session.add(action)

    action.action = payload.action
    db.session.commit()

    response_data: Dict[str, Any] = {"is_mutual": False}

    if payload.action == "match":
        contact = {
            "name": target.full_name,
            "email": target.email,
            "phone": target.phone if target.share_phone else None,
            "company": target.company,
            "role": target.role,
        }

        response_data["contact"] = contact

        reverse = MatchAction.query.filter_by(
            event_id=event_uuid,
            initiator_id=target_id,
            target_id=initiator.id,
            action="match",
        ).first()
        if reverse:
            response_data["is_mutual"] = True

    return jsonify(response_data)


@api_bp.route("/me/confirmed_matches", methods=["GET"])
@login_required
def get_confirmed_matches() -> Any:
    event_uuid = parse_uuid('00000000-0000-0000-0000-000000000001') # Assuming a single event for now
    participant = Participant.query.filter_by(user_id=g.user.id, event_id=event_uuid).first_or_404()
    actions = MatchAction.query.filter_by(
        initiator_id=participant.id,
        event_id=participant.event_id,
        action="match",
    ).all()

    confirmed: List[ConfirmedMatchResponse] = []
    seen = set()

    for action in actions:
        reverse = MatchAction.query.filter_by(
            event_id=participant.event_id,
            initiator_id=action.target_id,
            target_id=participant.id,
            action="match",
        ).first()
        if not reverse:
            continue
        if action.target_id in seen:
            continue
        seen.add(action.target_id)
        other = Participant.query.filter_by(id=action.target_id).first()
        if not other:
            continue
        contact_phone = other.phone if other.share_phone else None
        confirmed.append(
            ConfirmedMatchResponse(
                other_participant=other.id,
                other_name=other.full_name,
                other_company=other.company,
                other_phone=contact_phone,
                other_email=other.email,
                reason={"mutual": True},
            )
        )

    return jsonify([item.dict() for item in confirmed])


@api_bp.route("/events/<event_id>/search", methods=["GET"])
@login_required
def search_participants(event_id: str) -> Any:
    ensure_event(event_id)
    event_uuid = parse_uuid(event_id)
    term = request.args.get("term", "").strip()
    normalized_term = term.lower()
    
    exclude_participant = Participant.query.filter_by(user_id=g.user.id, event_id=event_uuid).first()
    exclude_uuid = exclude_participant.id if exclude_participant else None

    results: List[Dict[str, Any]] = []
    for participant in Participant.query.filter_by(event_id=event_uuid).all():
        if exclude_uuid and participant.id == exclude_uuid:
            continue

        matches = False
        if normalized_term:
            if fuzzy_match(participant.full_name, normalized_term):
                matches = True
            elif fuzzy_match(participant.bio, normalized_term):
                matches = True
            elif fuzzy_match(participant.goals, normalized_term):
                matches = True
            else:
                tags = participant.interests + participant.offers + participant.needs
                for tag in tags:
                    if fuzzy_match(tag, normalized_term):
                        matches = True
                        break
        if not normalized_term or matches:
            results.append(participant_to_response(participant))

    return jsonify(results)