from __future__ import annotations

from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


# TODO: Add streaming event schemas, conversation_id, knowledge_base_id, sources
