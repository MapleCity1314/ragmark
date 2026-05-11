from __future__ import annotations

from src.core.rag.loader import load_document, load_text
from src.core.rag.splitter import TextSplitter
from src.db.vector_store import VectorStoreManager


class KnowledgeManager:
    def __init__(self, vector_store: VectorStoreManager) -> None:
        self._vector_store = vector_store
        self._splitter = TextSplitter()

    def index_text(
        self,
        text: str,
        collection_name: str,
        metadata: dict[str, object] | None = None,
    ) -> int:
        docs = load_text(text, metadata)
        chunks = self._splitter.split(docs)
        self._vector_store.add_documents(collection_name, chunks)
        return len(chunks)

    def index_file(
        self,
        file_path: str,
        collection_name: str,
        mime_type: str | None = None,
    ) -> int:
        docs = load_document(file_path, mime_type)
        chunks = self._splitter.split(docs)
        self._vector_store.add_documents(collection_name, chunks)
        return len(chunks)

    def delete_collection(self, collection_name: str) -> None:
        self._vector_store.delete_collection(collection_name)
