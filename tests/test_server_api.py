import pytest
from fastapi.testclient import TestClient
from astra.server.app import app

@pytest.fixture
def client():
    return TestClient(app)

def test_api_health(client):
    r = client.get("/api/v1/health")
    assert r.status_code == 200
    assert r.json()["status"] == "OPERATIONAL"

def test_api_dashboard_stats(client):
    r = client.get("/api/v1/dashboard/stats")
    assert r.status_code == 200
    data = r.json()
    assert data["active_actors_count"] >= 1
    assert data["chain_integrity_valid"] is True

def test_api_actors_list_and_profile(client):
    r = client.get("/api/v1/actors")
    assert r.status_code == 200
    actors = r.json()
    assert len(actors) >= 1

    actor_id = actors[0]["actor_id"]
    r_detail = client.get(f"/api/v1/actors/{actor_id}")
    assert r_detail.status_code == 200
    assert r_detail.json()["actor"]["actor_id"] == actor_id

def test_api_graph_topology(client):
    r = client.get("/api/v1/graph")
    assert r.status_code == 200
    data = r.json()
    assert "nodes" in data
    assert "edges" in data
    assert len(data["nodes"]) > 0

def test_api_demo_run(client):
    r = client.post("/api/v1/demo/run")
    assert r.status_code == 200
    assert r.json()["status"] == "COMPLETED"
