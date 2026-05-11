from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models import KnowledgeBase
from src.schemas.knowledge import KnowledgeBaseIn, KnowledgeBaseOut
from src.utils.exceptions import ConflictException, NotFoundException


class KnowledgeService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def create(self, data: KnowledgeBaseIn) -> KnowledgeBaseOut:
        existing = await self._db.execute(
            select(KnowledgeBase).where(KnowledgeBase.name == data.name)
        )
        if existing.scalar_one_or_none():
            raise ConflictException(f"Knowledge base '{data.name}' already exists")

        kb = KnowledgeBase(
            name=data.name,
            description=data.description,
            collection_name=f"kb_{uuid.uuid4().hex[:12]}",
        )
        self._db.add(kb)
        await self._db.flush()
        return KnowledgeBaseOut.model_validate(kb)

    async def list_all(self) -> list[KnowledgeBaseOut]:
        result = await self._db.execute(select(KnowledgeBase))
        kbs = result.scalars().all()
        return [KnowledgeBaseOut.model_validate(k) for k in kbs]

    async def get(self, kb_id: str) -> KnowledgeBaseOut:
        kb = await self._db.get(KnowledgeBase, kb_id)
        if not kb:
            raise NotFoundException("Knowledge base not found")
        return KnowledgeBaseOut.model_validate(kb)

    async def delete(self, kb_id: str) -> None:
        kb = await self._db.get(KnowledgeBase, kb_id)
        if not kb:
            raise NotFoundException("Knowledge base not found")
        await self._db.delete(kb)
