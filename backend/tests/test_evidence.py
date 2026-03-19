import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_connector_config(client: AsyncClient, admin_user, ai_system):
    token = (await client.post("/api/v1/auth/login", json={"email": "admin@compass.dev", "password": "password123"})).json()["access_token"]
    resp = await client.post(
        f"/api/v1/systems/{ai_system.id}/connectors",
        json={"connector_name": "github", "config": {"repo": "org/repo", "token": "ghp_test"}, "is_enabled": True},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["connector_name"] == "github"
    assert data["is_enabled"] is True


@pytest.mark.asyncio
async def test_list_connector_configs(client: AsyncClient, admin_user, ai_system):
    token = (await client.post("/api/v1/auth/login", json={"email": "admin@compass.dev", "password": "password123"})).json()["access_token"]
    await client.post(
        f"/api/v1/systems/{ai_system.id}/connectors",
        json={"connector_name": "manual", "config": {}, "is_enabled": True},
        headers={"Authorization": f"Bearer {token}"},
    )
    resp = await client.get(f"/api/v1/systems/{ai_system.id}/connectors", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert len(resp.json()) == 1


@pytest.mark.asyncio
async def test_delete_connector_config(client: AsyncClient, admin_user, ai_system):
    token = (await client.post("/api/v1/auth/login", json={"email": "admin@compass.dev", "password": "password123"})).json()["access_token"]
    await client.post(
        f"/api/v1/systems/{ai_system.id}/connectors",
        json={"connector_name": "manual", "config": {}, "is_enabled": True},
        headers={"Authorization": f"Bearer {token}"},
    )
    resp = await client.delete(
        f"/api/v1/systems/{ai_system.id}/connectors/manual",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 204


@pytest.mark.asyncio
async def test_duplicate_connector_config_returns_409(client: AsyncClient, admin_user, ai_system):
    token = (await client.post("/api/v1/auth/login", json={"email": "admin@compass.dev", "password": "password123"})).json()["access_token"]
    body = {"connector_name": "github", "config": {"repo": "org/repo", "token": "ghp_test"}, "is_enabled": True}
    headers = {"Authorization": f"Bearer {token}"}
    await client.post(f"/api/v1/systems/{ai_system.id}/connectors", json=body, headers=headers)
    resp = await client.post(f"/api/v1/systems/{ai_system.id}/connectors", json=body, headers=headers)
    assert resp.status_code == 409
