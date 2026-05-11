from __future__ import annotations

from src.core.knowledge.manager import KnowledgeManager
from src.db.vector_store import VectorStoreManager
from src.utils.logger import logger


class BatchIndexer:
    def __init__(self, vector_store: VectorStoreManager) -> None:
        self._manager = KnowledgeManager(vector_store)

    def index_files(
        self,
        file_paths: list[str],
        collection_name: str,
        mime_type: str | None = None,
    ) -> dict[str, int]:
        results: dict[str, int] = {}
        for path in file_paths:
            try:
                count = self._manager.index_file(path, collection_name, mime_type)
                results[path] = count
                logger.info("indexed_file", path=path, chunks=count)
            except Exception as e:
                logger.error("index_failed", path=path, error=str(e))
                results[path] = 0
        return results
