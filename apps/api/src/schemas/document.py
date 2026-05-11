from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class DocumentOut(BaseModel):
    id: str
    knowledge_base_id: str
    filename: str
    mime_type: str | None = None
    chunk_count: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}
