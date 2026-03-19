async def test_list_all_controls(client, assessor_user, seeded_controls):
    login = await client.post("/api/v1/auth/login", json={"email": "assessor@compass.dev", "password": "password123"})
    token = login.json()["access_token"]
    resp = await client.get("/api/v1/controls", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert len(resp.json()) > 0


async def test_filter_controls_by_framework(client, assessor_user, seeded_controls):
    login = await client.post("/api/v1/auth/login", json={"email": "assessor@compass.dev", "password": "password123"})
    token = login.json()["access_token"]
    resp = await client.get("/api/v1/controls?framework=eu_ai_act", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) > 0
    assert all(c["framework"] == "eu_ai_act" for c in data)


async def test_controls_requires_auth(client):
    resp = await client.get("/api/v1/controls")
    assert resp.status_code == 401
