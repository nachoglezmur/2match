from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, List, Tuple

from sqlalchemy.orm import Session

from ..models import Participant
from ..utils.text import fuzzy_match, normalize_text, tokenize_variants


@dataclass(slots=True)
class MatchCandidate:
    participant: Participant
    score: float
    reason: dict


def calculate_similarity(reference: Participant, other: Participant) -> Tuple[float, dict]:
    reason = {
        "common_interests": 0,
        "you_need_they_offer": 0,
        "they_need_you_offer": 0,
        "goal_similarity": 0.0,
        "name_similarity": False,
    }

    ref_interests = tokenize_variants(reference.interests)
    other_interests = tokenize_variants(other.interests)
    common_interests = ref_interests.intersection(other_interests)
    reason["common_interests"] = len(common_interests)

    ref_needs = tokenize_variants(reference.needs)
    other_offers = tokenize_variants(other.offers)
    ref_offers = tokenize_variants(reference.offers)
    other_needs = tokenize_variants(other.needs)

    reason["you_need_they_offer"] = len(ref_needs.intersection(other_offers))
    reason["they_need_you_offer"] = len(other_needs.intersection(ref_offers))

    goal_similarity = 0.0
    ref_goal = normalize_text(reference.goals)
    other_goal = normalize_text(other.goals)
    if ref_goal and other_goal:
        if fuzzy_match(ref_goal, other_goal):
            goal_similarity = 1.0
    reason["goal_similarity"] = goal_similarity

    name_similarity = False
    if reference.full_name and other.full_name:
        name_similarity = fuzzy_match(reference.full_name, normalize_text(other.full_name))
    reason["name_similarity"] = name_similarity

    score = (
        reason["common_interests"] * 10
        + reason["you_need_they_offer"] * 15
        + reason["they_need_you_offer"] * 15
        + goal_similarity * 10
    )

    if name_similarity:
        score += 5

    score = min(100, score)

    return score, reason


def find_best_matches(session: Session, participant: Participant, limit: int = 20) -> List[MatchCandidate]:
    candidates: List[MatchCandidate] = []

    query = (
        session.query(Participant)
        .filter(Participant.event_id == participant.event_id)
        .filter(Participant.id != participant.id)
    )

    for other in query:
        score, reason = calculate_similarity(participant, other)
        if score >= 20:
            candidates.append(MatchCandidate(participant=other, score=score, reason=reason))

    candidates.sort(key=lambda item: item.score, reverse=True)
    return candidates[:limit]


def confirm_mutual_match(session: Session, initiator: Participant, target: Participant) -> dict | None:
    initiator_actions = {
        action.action
        for action in initiator.initiated_matches
        if action.target_id == target.id
    }
    target_actions = {
        action.action
        for action in target.initiated_matches
        if action.target_id == initiator.id
    }

    if "match" in initiator_actions and "match" in target_actions:
        return {
            "other_name": target.full_name,
            "other_email": target.email,
            "other_phone": target.phone if target.share_phone else None,
        }
    return None