from __future__ import annotations

from langchain_core.documents import Document
from langchain_core.vectorstores import VectorStoreRetriever

from src.db.vector_store import VectorStoreManager


class Retriever:
    def __init__(self, vector_store: VectorStoreManager, k: int = 4) -> None:
        self._store = vector_store
        self._k = k

    def as_retriever(self, collection_name: str) -> VectorStoreRetriever:
        store = self._store.get_collection(collection_name)
        return store.as_retriever(search_kwargs={"k": self._k})

    def similarity_search(
        self,
        query: str,
        collection_name: str,
        k: int | None = None,
    ) -> list[Document]:
        store = self._store.get_collection(collection_name)
        return store.similarity_search(query, k=k or self._k)
