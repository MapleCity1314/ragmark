from __future__ import annotations

from src.schemas.chat import ChatRequest


def test_chat_request_minimal() -> None:
    req = ChatRequest(message="Hello")
    assert req.message == "Hello"
