from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends

from src.api.deps import get_knowledge_service
from src.schemas.knowledge import KnowledgeBaseIn, KnowledgeBaseOut
from src.services.knowledge_service import KnowledgeService

router = APIRouter(prefix="/knowledge", tags=["knowledge"])


@router.post("", response_model=KnowledgeBaseOut, status_code=201)
async def create_knowledge_base(
    body: KnowledgeBaseIn,
    service: Annotated[KnowledgeService, Depends(get_knowledge_service)],
) -> KnowledgeBaseOut:
    return await service.create(body)


@router.get("", response_model=list[KnowledgeBaseOut])
async def list_knowledge_bases(
    service: Annotated[KnowledgeService, Depends(get_knowledge_service)],
) -> list[KnowledgeBaseOut]:
    return await service.list_all()


@router.get("/{kb_id}", response_model=KnowledgeBaseOut)
async def get_knowledge_base(
    kb_id: str,
    service: Annotated[KnowledgeService, Depends(get_knowledge_service)],
) -> KnowledgeBaseOut:
    return await service.get(kb_id)


@router.delete("/{kb_id}")
async def delete_knowledge_base(
    kb_id: str,
    service: Annotated[KnowledgeService, Depends(get_knowledge_service)],
) -> dict[str, str]:
    await service.delete(kb_id)
    return {"status": "deleted"}
