from __future__ import annotations

from enum import StrEnum


class Provider(StrEnum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"


# TODO: Define LLMResponse, TokenUsage, and extraction helpers
