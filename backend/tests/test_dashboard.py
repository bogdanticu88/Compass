import pytest
import pytest_asyncio


@pytest_asyncio.fixture
async def assessor_token(client, assessor_user):
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": "assessor@compass.dev", "password": "password123"},
    )
    return login.json()["access_token"]


async def test_dashboard_requires_auth(client):
    resp = await client.get("/api/v1/dashboard")
    assert resp.status_code == 401


async def test_dashboard_returns_expected_shape(client, assessor_token):
    headers = {"Authorization": f"Bearer {assessor_token}"}
    resp = await client.get("/api/v1/dashboard", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "framework_compliance" in data
    assert "overdue_assessments" in data
    for fw in ["eu_ai_act", "dora", "iso_42001", "nist_ai_rmf"]:
        assert fw in data["framework_compliance"]


async def test_dashboard_compliance_is_none_with_no_submitted_assessments(
    client, assessor_token
):
    headers = {"Authorization": f"Bearer {assessor_token}"}
    resp = await client.get("/api/v1/dashboard", headers=headers)
    assert resp.status_code == 200
    # No submitted assessments → all None
    for pct in resp.json()["framework_compliance"].values():
        assert pct is None


async def test_dashboard_compliance_reflects_evidence_coverage(
    client, assessor_token, seeded_controls
):
    headers = {"Authorization": f"Bearer {assessor_token}"}

    system = await client.post(
        "/api/v1/systems",
        json={"name": "Dashboard Test System", "risk_tier": "high"},
        headers=headers,
    )
    system_id = system.json()["id"]

    create = await client.post(
        "/api/v1/assessments",
        json={"system_id": system_id, "frameworks": ["eu_ai_act"]},
        headers=headers,
    )
    assessment_id = create.json()["id"]

    # Add evidence for the first control
    detail = await client.get(f"/api/v1/assessments/{assessment_id}", headers=headers)
    first_control_id = detail.json()["controls"][0]["id"]
    await client.post(
        "/api/v1/evidence",
        json={"assessment_id": assessment_id, "control_id": first_control_id, "payload": "Test"},
        headers=headers,
    )

    # Submit to make it in_review (compliance now computed)
    await client.post(f"/api/v1/assessments/{assessment_id}/submit", headers=headers)

    resp = await client.get("/api/v1/dashboard", headers=headers)
    eu_compliance = resp.json()["framework_compliance"]["eu_ai_act"]
    assert eu_compliance is not None
    assert 0.0 < eu_compliance <= 1.0


async def test_dashboard_overdue_assessments(client, assessor_token, seeded_controls):
    headers = {"Authorization": f"Bearer {assessor_token}"}

    system = await client.post(
        "/api/v1/systems",
        json={"name": "Overdue Test System", "risk_tier": "limited"},
        headers=headers,
    )
    system_id = system.json()["id"]

    # Assessment with past due date (not complete)
    await client.post(
        "/api/v1/assessments",
        json={"system_id": system_id, "frameworks": ["dora"], "due_date": "2020-01-01"},
        headers=headers,
    )

    resp = await client.get("/api/v1/dashboard", headers=headers)
    assert resp.status_code == 200
    overdue = resp.json()["overdue_assessments"]
    assert len(overdue) == 1
    assert overdue[0]["due_date"] == "2020-01-01"
    assert overdue[0]["status"] == "draft"
