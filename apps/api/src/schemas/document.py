from __future__ import annotations

from pydantic import BaseModel


class DocumentOut(BaseModel):
    id: str
    filename: str


# TODO: Add full document fields (knowledge_base_id, mime_type, chunk_count, created_at)
