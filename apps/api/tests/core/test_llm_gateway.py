from __future__ import annotations

from src.core.llm.models import TokenUsage


def test_token_usage_defaults() -> None:
    usage = TokenUsage()
    assert usage.input_tokens == 0
    assert usage.output_tokens == 0
    assert usage.total_tokens == 0
