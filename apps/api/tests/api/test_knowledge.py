from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_knowledge_base(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/knowledge",
        json={"name": "test-kb", "description": "Test knowledge base"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "test-kb"
    assert "id" in data


@pytest.mark.asyncio
async def test_list_knowledge_bases(client: AsyncClient) -> None:
    response = await client.get("/api/v1/knowledge")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_get_knowledge_base_not_found(client: AsyncClient) -> None:
    response = await client.get("/api/v1/knowledge/nonexistent")
    assert response.status_code == 404
