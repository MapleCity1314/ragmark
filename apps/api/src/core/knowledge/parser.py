from __future__ import annotations

from src.core.rag.loader import LOADER_REGISTRY


def get_supported_mime_types() -> list[str]:
    return list(LOADER_REGISTRY.keys())


def is_supported_format(mime_type: str) -> bool:
    return mime_type in LOADER_REGISTRY
