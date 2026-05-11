from __future__ import annotations

from src.core.llm.models import Provider


def test_provider_enum_values() -> None:
    assert Provider.OPENAI == "openai"
    assert Provider.ANTHROPIC == "anthropic"
