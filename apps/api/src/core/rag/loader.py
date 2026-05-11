from __future__ import annotations

from langchain_community.document_loaders import (
    PyPDFLoader,
    TextLoader,
    UnstructuredMarkdownLoader,
)
from langchain_core.documents import Document

LOADER_REGISTRY: dict[str, type[TextLoader | PyPDFLoader | UnstructuredMarkdownLoader]] = {
    "text/plain": TextLoader,
    "application/pdf": PyPDFLoader,
    "text/markdown": UnstructuredMarkdownLoader,
}


def load_document(file_path: str, mime_type: str | None = None) -> list[Document]:
    loader_cls = LOADER_REGISTRY.get(mime_type or "text/plain", TextLoader)
    loader = loader_cls(file_path)
    return list(loader.load())


def load_text(text: str, metadata: dict[str, object] | None = None) -> list[Document]:
    return [Document(page_content=text, metadata=metadata or {})]
