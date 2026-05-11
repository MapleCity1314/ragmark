from __future__ import annotations

import pytest

from src.core.agent.executor import AgentExecutor
from src.core.agent.prompts import get_agent_prompt
from src.core.agent.tools import get_default_tools


def test_agent_prompt_returns_default() -> None:
    assert get_agent_prompt() == "You are a helpful AI assistant."


def test_agent_executor_not_implemented() -> None:
    with pytest.raises(NotImplementedError):
        AgentExecutor()


def test_agent_tools_not_implemented() -> None:
    with pytest.raises(NotImplementedError):
        get_default_tools()
