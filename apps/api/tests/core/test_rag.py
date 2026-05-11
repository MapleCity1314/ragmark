from __future__ import annotations

from src.core.rag.splitter import TextSplitter


def test_splitter_splits_text() -> None:
    splitter = TextSplitter(chunk_size=200, chunk_overlap=50)
    text = "Hello " * 500
    from langchain_core.documents import Document

    docs = [Document(page_content=text)]
    chunks = splitter.split(docs)
    assert len(chunks) > 1
    for chunk in chunks:
        assert len(chunk.page_content) <= 200
