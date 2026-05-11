from __future__ import annotations

from collections.abc import AsyncIterator, Sequence

from langchain_anthropic import ChatAnthropic
from langchain_core.language_models import BaseChatModel
from langchain_core.messages import BaseMessage
from langchain_openai import ChatOpenAI

from src.config import Settings
from src.core.llm.models import (
    LLMResponse,
    Provider,
    extract_model,
    extract_token_usage,
)
from src.utils.logger import logger


class LLMGateway:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._models: dict[Provider, BaseChatModel] = {}
        self._init_models()

    def _init_models(self) -> None:
        if self._settings.openai_api_key.get_secret_value():
            self._models[Provider.OPENAI] = ChatOpenAI(
                model=self._settings.openai_model,
                api_key=self._settings.openai_api_key,
                base_url=self._settings.openai_base_url,
                temperature=self._settings.llm_temperature,
                max_completion_tokens=self._settings.llm_max_tokens,
            )

        if self._settings.anthropic_api_key.get_secret_value():
            self._models[Provider.ANTHROPIC] = ChatAnthropic(  # type: ignore[call-arg]
                model_name=self._settings.anthropic_model,
                api_key=self._settings.anthropic_api_key,
                temperature=self._settings.llm_temperature,
                timeout=60,
                stop_sequences=None,
            )

    def _resolve_provider(self, provider: Provider | None = None) -> Provider:
        if provider and provider in self._models:
            return provider
        default = Provider(self._settings.llm_provider)
        if default in self._models:
            return default
        if self._models:
            return next(iter(self._models))
        raise RuntimeError("No LLM provider configured")

    def get_model(self, provider: Provider | None = None) -> BaseChatModel:
        resolved = self._resolve_provider(provider)
        return self._models[resolved]

    def list_providers(self) -> list[Provider]:
        return list(self._models.keys())

    async def invoke(
        self,
        messages: Sequence[BaseMessage],
        provider: Provider | None = None,
    ) -> LLMResponse:
        resolved = self._resolve_provider(provider)
        model = self._models[resolved]
        logger.debug("llm_invoke", provider=resolved.value)
        response = await model.ainvoke(messages)
        return LLMResponse(
            content=str(response.content),
            usage=extract_token_usage(response),  # type: ignore[arg-type]
            model=extract_model(response),  # type: ignore[arg-type]
            provider=resolved,
        )

    async def stream(
        self,
        messages: Sequence[BaseMessage],
        provider: Provider | None = None,
    ) -> AsyncIterator[BaseMessage]:
        resolved = self._resolve_provider(provider)
        model = self._models[resolved]
        logger.debug("llm_stream", provider=resolved.value)
        async for chunk in model.astream(messages):
            yield chunk
