from __future__ import annotations

from enum import StrEnum

from langchain_core.messages import AIMessage
from pydantic import BaseModel, Field


class Provider(StrEnum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"


class TokenUsage(BaseModel):
    input_tokens: int = 0
    output_tokens: int = 0
    total_tokens: int = 0


class LLMResponse(BaseModel):
    content: str
    usage: TokenUsage = Field(default_factory=TokenUsage)
    model: str = ""
    provider: Provider | None = None


def extract_token_usage(response: AIMessage) -> TokenUsage:
    usage_meta: dict[str, int] = getattr(response, "usage_metadata", {}) or {}
    return TokenUsage(
        input_tokens=usage_meta.get("input_tokens", 0),
        output_tokens=usage_meta.get("output_tokens", 0),
        total_tokens=usage_meta.get("total_tokens", 0),
    )


def extract_model(response: AIMessage) -> str:
    metadata: dict[str, object] = getattr(response, "response_metadata", {}) or {}
    return str(metadata.get("model_name", ""))
