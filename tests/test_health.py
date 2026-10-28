"""Unit tests for GhostTerminal AI health and status endpoints."""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_root_endpoint():
    """Verify root info endpoint responds with expected application metadata."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "GhostTerminal AI"
    assert data["version"] == "0.2.0"
    assert "Part 2" in data["stage"]
    assert data["health_check"] == "/api/health"
    assert "model_status" in data


def test_health_endpoint_contract():
    """Verify /api/health returns HTTP 200 with all required fields."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "ok"
    assert data["app"] == "GhostTerminal AI"
    assert data["version"] == "0.2.0"
    assert "Part 2" in data["stage"]
    assert data["environment"] in ["development", "production", "testing"]
    assert data["model_status"] in ["not_loaded", "loading", "ready", "failed"]
    assert data["model_id"] == "Qwen/Qwen2.5-0.5B-Instruct"


def test_cors_headers_allowed_origin():
    """Verify CORS headers for configured development origin."""
    response = client.options(
        "/api/health",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"


def test_model_status_endpoint():
    """Verify /api/model/status returns lifecycle metadata."""
    response = client.get("/api/model/status")
    assert response.status_code == 200
    data = response.json()
    assert data["model_id"] == "Qwen/Qwen2.5-0.5B-Instruct"
    assert data["model_file"] == "qwen2.5-0.5b-instruct-q4_k_m.gguf"
    assert data["device"] == "cpu"
    assert "status" in data
    assert "load_time_ms" in data
    assert "total_inferences" in data
