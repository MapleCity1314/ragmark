from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models import Document
from src.schemas.document import DocumentOut
from src.utils.exceptions import NotFoundException


class DocumentService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def list_documents(
        self,
        knowledge_base_id: str | None = None,
    ) -> list[DocumentOut]:
        stmt = select(Document)
        if knowledge_base_id:
            stmt = stmt.where(Document.knowledge_base_id == knowledge_base_id)
        result = await self._db.execute(stmt)
        docs = result.scalars().all()
        return [DocumentOut.model_validate(d) for d in docs]

    async def get_document(self, document_id: str) -> DocumentOut:
        doc = await self._db.get(Document, document_id)
        if not doc:
            raise NotFoundException("Document not found")
        return DocumentOut.model_validate(doc)

    async def delete_document(self, document_id: str) -> None:
        doc = await self._db.get(Document, document_id)
        if not doc:
            raise NotFoundException("Document not found")
        await self._db.delete(doc)
