from __future__ import annotations

# TODO: Agent system prompt templates
# Example:
#   REACT_PROMPT = \"\"\"\
#   You are a helpful AI assistant with access to tools...
#   \"\"\"


DEFAULT_SYSTEM_PROMPT = "You are a helpful AI assistant."


def get_agent_prompt(template: str = "default") -> str:
    """TODO: Return agent system prompt based on template name."""
    return DEFAULT_SYSTEM_PROMPT
