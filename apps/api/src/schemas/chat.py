from __future__ import annotations

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=32768)
    conversation_id: str | None = None
    knowledge_base_id: str | None = None


class ChatResponse(BaseModel):
    reply: str
    conversation_id: str | None = None
    sources: list[dict[str, object]] = Field(default_factory=list)
