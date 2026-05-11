from __future__ import annotations

from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.dependencies import get_db


def get_db_dep() -> Annotated[AsyncSession, Depends(get_db)]:
    """Reusable DB session dependency for route handlers to compose from."""
    raise NotImplementedError("Inject via FastAPI Depends — do not call directly")
