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


async def test_assessment_detail_includes_evidence_payload(
    client, system_and_token, seeded_controls
):
    sys_data, token = system_and_token
    headers = {"Authorization": f"Bearer {token}"}

    create = await client.post(
        "/api/v1/assessments",
        json={"system_id": sys_data["id"], "frameworks": ["eu_ai_act"]},
        headers=headers,
    )
    assessment_id = create.json()["id"]

    detail = await client.get(f"/api/v1/assessments/{assessment_id}", headers=headers)
    first_control = detail.json()["controls"][0]

    # Before any evidence: payload and source are null
    assert "evidence_payload" in first_control
    assert "evidence_source" in first_control
    assert first_control["evidence_payload"] is None
    assert first_control["evidence_source"] is None

    # Upload manual evidence for this control
    await client.post(
        "/api/v1/evidence",
        json={
            "assessment_id": assessment_id,
            "control_id": first_control["id"],
            "payload": "Manually entered evidence text",
        },
        headers=headers,
    )

    # Fetch again — payload and source must now be populated
    detail2 = await client.get(f"/api/v1/assessments/{assessment_id}", headers=headers)
    updated = next(
        c for c in detail2.json()["controls"] if c["id"] == first_control["id"]
    )
    assert updated["evidence_payload"] == "Manually entered evidence text"
    assert updated["evidence_source"] == "manual"


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
