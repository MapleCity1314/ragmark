from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(prefix="/documents", tags=["documents"])


# TODO: Implement document CRUD endpoints
# GET    /documents          — list documents
# GET    /documents/{id}     — get document
# DELETE /documents/{id}     — delete document
