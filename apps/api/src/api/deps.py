from __future__ import annotations

from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.config import Settings
from src.dependencies import get_db, get_settings_dep
from src.services.chat_service import ChatService
from src.services.document_service import DocumentService
from src.services.knowledge_service import KnowledgeService


def get_chat_service(
    db: Annotated[AsyncSession, Depends(get_db)],
    settings: Annotated[Settings, Depends(get_settings_dep)],
) -> ChatService:
    return ChatService(db=db, settings=settings)


def get_document_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> DocumentService:
    return DocumentService(db=db)


def get_knowledge_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> KnowledgeService:
    return KnowledgeService(db=db)
