from __future__ import annotations

from collections.abc import AsyncIterator

from langchain_core.messages import HumanMessage
from sqlalchemy.ext.asyncio import AsyncSession

from src.config import Settings
from src.core.llm.gateway import LLMGateway
from src.core.llm.models import LLMResponse
from src.core.llm.streaming import stream_to_sse
from src.schemas.chat import ChatRequest, ChatResponse


class ChatService:
    def __init__(self, db: AsyncSession, settings: Settings) -> None:
        self._db = db
        self._gateway = LLMGateway(settings)

    async def chat(self, request: ChatRequest) -> ChatResponse:
        messages = [HumanMessage(content=request.message)]
        response: LLMResponse = await self._gateway.invoke(messages)
        return ChatResponse(
            reply=response.content,
            conversation_id=request.conversation_id,
        )

    async def chat_stream(self, request: ChatRequest) -> AsyncIterator[str]:
        messages = [HumanMessage(content=request.message)]
        stream = self._gateway.stream(messages)
        async for event in stream_to_sse(stream):
            yield event
