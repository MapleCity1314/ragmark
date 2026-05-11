from __future__ import annotations

from collections.abc import Sequence
from typing import Any

from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.retrieval import create_retrieval_chain
from langchain_core.language_models import BaseChatModel
from langchain_core.prompts import ChatPromptTemplate

from src.core.rag.retriever import Retriever

SYSTEM_PROMPT = """\
You are a helpful AI assistant. Use the following pieces of retrieved context \
to answer the question. If you don't know the answer, say so.

Context:
{context}
"""


class RAGChain:
    def __init__(self, llm: BaseChatModel, retriever: Retriever) -> None:
        self._llm = llm
        self._retriever = retriever

    def build(self, collection_name: str) -> Any:
        retriever_tool = self._retriever.as_retriever(collection_name)

        prompt = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PROMPT),
            ("human", "{input}"),
        ])

        combine_docs_chain = create_stuff_documents_chain(self._llm, prompt)
        return create_retrieval_chain(retriever_tool, combine_docs_chain)

    async def query(
        self,
        question: str,
        collection_name: str,
        chat_history: Sequence[Any] | None = None,
    ) -> str:
        chain = self.build(collection_name)
        result = await chain.ainvoke({
            "input": question,
            "chat_history": chat_history or [],
        })
        return str(result["answer"])
