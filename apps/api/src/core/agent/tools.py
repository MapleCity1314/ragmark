from __future__ import annotations

from langchain_core.tools import BaseTool

# TODO: Define built-in tools — search, calculator, document query, etc.
# Example:
#   search_tool = TavilySearchResults(max_results=3)
#   calc_tool = CalculatorTool()


def get_default_tools() -> list[BaseTool]:
    """TODO: Return default tool set for the agent."""
    raise NotImplementedError("Agent tools not implemented yet")
