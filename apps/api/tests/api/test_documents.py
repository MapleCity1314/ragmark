from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_documents_empty(client: AsyncClient) -> None:
    response = await client.get("/api/v1/documents")
    assert response.status_code == 200
    assert response.json() == []
