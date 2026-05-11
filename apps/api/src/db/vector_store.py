from __future__ import annotations

from langchain_chroma import Chroma
from langchain_core.documents import Document

from src.config import get_settings
from src.core.rag.embeddings import create_embeddings


class VectorStoreManager:
    def __init__(self) -> None:
        settings = get_settings()
        self._embeddings = create_embeddings(settings)
        self._persist_dir = settings.chroma_persist_dir
        self._collections: dict[str, Chroma] = {}

    def get_collection(self, name: str) -> Chroma:
        if name not in self._collections:
            self._collections[name] = Chroma(
                collection_name=name,
                embedding_function=self._embeddings,
                persist_directory=self._persist_dir,
            )
        return self._collections[name]

    def add_documents(self, collection_name: str, documents: list[Document]) -> None:
        store = self.get_collection(collection_name)
        store.add_documents(documents)

    def delete_collection(self, name: str) -> None:
        store = self.get_collection(name)
        store.delete_collection()
        self._collections.pop(name, None)

    def get_collection_names(self) -> list[str]:
        return list(self._collections.keys())
