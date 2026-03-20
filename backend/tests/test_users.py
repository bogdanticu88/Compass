import pytest


async def test_list_users_requires_admin(client, assessor_user):
    login = await client.post("/api/v1/auth/login", json={"email": "assessor@compass.dev", "password": "password123"})
    token = login.json()["access_token"]
    resp = await client.get("/api/v1/users", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 403


async def test_admin_can_list_users(client, admin_user):
    login = await client.post("/api/v1/auth/login", json={"email": "admin@compass.dev", "password": "password123"})
    token = login.json()["access_token"]
    resp = await client.get("/api/v1/users", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert len(resp.json()) >= 1


async def test_admin_can_create_user(client, admin_user):
    login = await client.post("/api/v1/auth/login", json={"email": "admin@compass.dev", "password": "password123"})
    token = login.json()["access_token"]
    resp = await client.post("/api/v1/users", json={
        "email": "newuser@compass.dev",
        "password": "password123",
        "full_name": "New User",
        "role": "assessor",
    }, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 201
    assert resp.json()["email"] == "newuser@compass.dev"


async def test_create_user_duplicate_email(client, admin_user):
    login = await client.post("/api/v1/auth/login", json={"email": "admin@compass.dev", "password": "password123"})
    token = login.json()["access_token"]
    # Try to create with admin's own email
    resp = await client.post("/api/v1/users", json={
        "email": "admin@compass.dev",
        "password": "password123",
        "full_name": "Duplicate",
        "role": "assessor",
    }, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 400
