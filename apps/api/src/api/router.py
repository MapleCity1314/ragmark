from __future__ import annotations

from fastapi import APIRouter

from src.api.v1.chat import router as chat_router
from src.api.v1.documents import router as documents_router
from src.api.v1.knowledge import router as knowledge_router

api_router = APIRouter()
api_router.include_router(chat_router, prefix="/v1")
api_router.include_router(documents_router, prefix="/v1")
api_router.include_router(knowledge_router, prefix="/v1")
