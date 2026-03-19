import pytest
import pytest_asyncio


@pytest_asyncio.fixture
async def system_and_token(client, assessor_user):
    login = await client.post("/api/v1/auth/login", json={"email": "assessor@compass.dev", "password": "password123"})
    token = login.json()["access_token"]
    resp = await client.post(
        "/api/v1/systems",
        json={"name": "Test Model", "risk_tier": "high"},
        headers={"Authorization": f"Bearer {token}"},
    )
    return resp.json(), token


async def test_create_assessment(client, system_and_token):
    sys_data, token = system_and_token
    headers = {"Authorization": f"Bearer {token}"}
    resp = await client.post("/api/v1/assessments", json={
        "system_id": sys_data["id"],
        "frameworks": ["eu_ai_act"],
    }, headers=headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["status"] == "draft"
    assert "eu_ai_act" in data["frameworks"]


async def test_assessment_detail_has_controls(client, system_and_token, seeded_controls):
    sys_data, token = system_and_token
    headers = {"Authorization": f"Bearer {token}"}
    create = await client.post("/api/v1/assessments", json={
        "system_id": sys_data["id"],
        "frameworks": ["eu_ai_act"],
    }, headers=headers)
    assessment_id = create.json()["id"]

    resp = await client.get(f"/api/v1/assessments/{assessment_id}", headers=headers)
    assert resp.status_code == 200
    assert len(resp.json()["controls"]) > 0


async def test_submit_assessment_generates_findings(client, system_and_token, seeded_controls):
    sys_data, token = system_and_token
    headers = {"Authorization": f"Bearer {token}"}
    create = await client.post("/api/v1/assessments", json={
        "system_id": sys_data["id"],
        "frameworks": ["eu_ai_act"],
    }, headers=headers)
    assessment_id = create.json()["id"]

    resp = await client.post(f"/api/v1/assessments/{assessment_id}/submit", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "in_review"

    findings = await client.get(f"/api/v1/findings?assessment_id={assessment_id}", headers=headers)
    assert findings.status_code == 200
    assert len(findings.json()) > 0
