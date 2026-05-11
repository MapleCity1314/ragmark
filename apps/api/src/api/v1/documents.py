from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends

from src.api.deps import get_document_service
from src.schemas.document import DocumentOut
from src.services.document_service import DocumentService

router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("", response_model=list[DocumentOut])
async def list_documents(
    service: Annotated[DocumentService, Depends(get_document_service)],
    knowledge_base_id: str | None = None,
) -> list[DocumentOut]:
    return await service.list_documents(knowledge_base_id)


@router.get("/{document_id}", response_model=DocumentOut)
async def get_document(
    document_id: str,
    service: Annotated[DocumentService, Depends(get_document_service)],
) -> DocumentOut:
    return await service.get_document(document_id)


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    service: Annotated[DocumentService, Depends(get_document_service)],
) -> dict[str, str]:
    await service.delete_document(document_id)
    return {"status": "deleted"}
