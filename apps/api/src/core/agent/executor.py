from __future__ import annotations


class AgentExecutor:
    """
    TODO: Implement ReAct / ToolLoopAgent executor.

    Expected interface:
        async def run(self, messages: list[BaseMessage]) -> str
        async def stream(self, messages: list[BaseMessage]) -> AsyncIterator[BaseMessage]
    """

    def __init__(self) -> None:
        raise NotImplementedError("Agent executor not implemented yet")
