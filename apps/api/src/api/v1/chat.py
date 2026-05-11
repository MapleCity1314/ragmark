from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(tags=["chat"])


# TODO: Implement chat endpoints
# POST /chat       — non-streaming chat
# POST /chat/stream — SSE streaming chat
