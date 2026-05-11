from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from src.config import get_settings

_engine = create_async_engine(
    get_settings().database_url,
    echo=get_settings().is_development,
)

async_session_factory = async_sessionmaker(_engine, class_=AsyncSession, expire_on_commit=False)


async def create_db_and_tables() -> None:
    from src.db.models import Base

    async with _engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_session() -> AsyncSession:
    return async_session_factory()
