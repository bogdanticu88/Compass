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


@pytest.mark.asyncio
async def test_manual_evidence_upload(client: AsyncClient, admin_user, ai_system, seeded_controls):
    token = (await client.post("/api/v1/auth/login", json={"email": "admin@compass.dev", "password": "password123"})).json()["access_token"]

    # Create assessment first
    assessment_resp = await client.post(
        "/api/v1/assessments",
        json={"system_id": ai_system.id, "frameworks": ["eu_ai_act"]},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert assessment_resp.status_code == 201
    assessment_id = assessment_resp.json()["id"]

    # Get a control id
    controls_resp = await client.get("/api/v1/controls?framework=eu_ai_act", headers={"Authorization": f"Bearer {token}"})
    control_id = controls_resp.json()[0]["id"]

    # Upload manual evidence
    resp = await client.post(
        "/api/v1/evidence",
        json={
            "assessment_id": assessment_id,
            "control_id": control_id,
            "payload": "Manual evidence: attached risk register document reviewed on 2026-03-19",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["source"] == "manual"
    assert data["status"] == "collected"
    assert data["control_id"] == control_id


@pytest.mark.asyncio
async def test_manual_evidence_replaces_existing(client: AsyncClient, admin_user, ai_system, seeded_controls):
    token = (await client.post("/api/v1/auth/login", json={"email": "admin@compass.dev", "password": "password123"})).json()["access_token"]

    assessment_id = (await client.post(
        "/api/v1/assessments",
        json={"system_id": ai_system.id, "frameworks": ["eu_ai_act"]},
        headers={"Authorization": f"Bearer {token}"},
    )).json()["id"]

    control_id = (await client.get("/api/v1/controls?framework=eu_ai_act", headers={"Authorization": f"Bearer {token}"})).json()[0]["id"]

    body = {"assessment_id": assessment_id, "control_id": control_id, "payload": "first upload"}
    await client.post("/api/v1/evidence", json=body, headers={"Authorization": f"Bearer {token}"})

    body["payload"] = "second upload"
    resp = await client.post("/api/v1/evidence", json=body, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 201
    assert resp.json()["payload"] == "second upload"
