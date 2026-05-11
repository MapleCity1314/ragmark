from __future__ import annotations


class LLMGateway:
    """
    TODO: Implement unified LLM gateway with multi-provider routing.

    Expected functionality:
    - Register models per provider (OpenAI, Anthropic, etc.)
    - Resolve provider with fallback chain
    - invoke() for non-streaming, stream() for SSE streaming
    - Token usage tracking

    See:
        langchain_openai.ChatOpenAI
        langchain_anthropic.ChatAnthropic
    """

    def __init__(self) -> None:
        raise NotImplementedError("LLM gateway not implemented yet")
