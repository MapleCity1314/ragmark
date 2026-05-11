from __future__ import annotations

import json
from collections.abc import AsyncGenerator, AsyncIterator
from typing import Any

from langchain_core.messages import AIMessageChunk, BaseMessage


async def sse_event(
    event: str,
    data: dict[str, Any],
) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


async def stream_to_sse(
    stream: AsyncIterator[BaseMessage],
) -> AsyncGenerator[str, None]:
    async for chunk in stream:
        if isinstance(chunk, AIMessageChunk) and chunk.content:
            yield await sse_event("token", {"content": chunk.content})
    yield await sse_event("done", {"status": "completed"})
