from __future__ import annotations

from pydantic import BaseModel


class KnowledgeBaseIn(BaseModel):
    name: str


class KnowledgeBaseOut(BaseModel):
    id: str
    name: str


# TODO: Add description, collection_name, timestamps
