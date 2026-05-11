from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(prefix="/knowledge", tags=["knowledge"])


# TODO: Implement knowledge base CRUD endpoints
# POST   /knowledge      — create knowledge base
# GET    /knowledge      — list knowledge bases
# GET    /knowledge/{id} — get knowledge base
# DELETE /knowledge/{id} — delete knowledge base
