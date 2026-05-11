from __future__ import annotations

from src.schemas.chat import ChatRequest


def test_chat_request_validation() -> None:
    req = ChatRequest(message="Hello")
    assert req.message == "Hello"


def test_chat_request_empty_message_fails() -> None:
    import pytest
    from pydantic import ValidationError

    with pytest.raises(ValidationError):
        ChatRequest(message="")
