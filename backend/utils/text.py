from __future__ import annotations

import math
import re
from functools import lru_cache
from typing import Iterable, List, Set

__all__ = [
    "normalize_text",
    "levenshtein_distance",
    "fuzzy_match",
    "generate_tag_variants",
    "strip_auto_token",
    "tokenize_variants",
]

NON_ALPHANUMERIC_PATTERN = re.compile(r"[^a-z0-9\s]")
MULTISPACE_PATTERN = re.compile(r"\s+")
AUTO_PREFIX = "__auto:"


def normalize_text(value: str | None) -> str:
    if value is None:
        return ""
    normalized = (
        value
        .strip()
        .lower()
        .encode("utf-8", "ignore")
        .decode("utf-8")
    )
    normalized = normalized.replace("á", "a").replace("é", "e").replace("í", "i")
    normalized = normalized.replace("ó", "o").replace("ú", "u").replace("ü", "u")
    normalized = normalized.replace("ñ", "n")
    normalized = NON_ALPHANUMERIC_PATTERN.sub(" ", normalized)
    normalized = MULTISPACE_PATTERN.sub(" ", normalized)
    return normalized.strip()


@lru_cache(maxsize=4096)
def levenshtein_distance(a: str, b: str) -> int:
    if a == b:
        return 0
    if not a:
        return len(b)
    if not b:
        return len(a)

    previous_row = list(range(len(b) + 1))
    for i, char_a in enumerate(a, start=1):
        current_row = [i]
        for j, char_b in enumerate(b, start=1):
            insertions = previous_row[j] + 1
            deletions = current_row[j - 1] + 1
            substitutions = previous_row[j - 1] + (char_a != char_b)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]


def fuzzy_match(text: str | None, normalized_term: str) -> bool:
    if not normalized_term:
        return False

    normalized_text = normalize_text(text)
    if not normalized_text:
        return False

    if normalized_term in normalized_text:
        return True

    tokens = normalized_text.split(" ")
    for token in tokens:
        if not token:
            continue
        if normalized_term in token or token in normalized_term:
            return True
        if abs(len(token) - len(normalized_term)) > 2:
            continue
        if min(len(token), len(normalized_term)) < 3:
            continue
        if levenshtein_distance(token, normalized_term) <= 1:
            return True
    return False


def generate_tag_variants(tags: Iterable[str]) -> List[str]:
    result: Set[str] = set()
    for tag in tags:
        if not tag:
            continue
        original = tag.strip()
        if not original:
            continue
        result.add(original)

        normalized = normalize_text(original)
        if not normalized:
            continue

        result.add(f"{AUTO_PREFIX}{normalized}")

        tokens = [token for token in normalized.split(" ") if token]
        for token in tokens:
            if len(token) >= 4:
                result.add(f"{AUTO_PREFIX}{token}")

        for i in range(len(tokens) - 1):
            bigram = f"{tokens[i]} {tokens[i + 1]}".strip()
            if len(bigram) >= 6:
                result.add(f"{AUTO_PREFIX}{bigram}")

    return list(result)


def strip_auto_token(value: str | None) -> str:
    if not value:
        return ""
    if value.startswith(AUTO_PREFIX):
        return value[len(AUTO_PREFIX):]
    return normalize_text(value)


def tokenize_variants(values: Iterable[str]) -> Set[str]:
    tokens: Set[str] = set()
    for value in values:
        if not value:
            continue
        tokens.add(strip_auto_token(value))
    return {token for token in tokens if token}
