"""Unit tests for GhostTerminal AI inference placeholder."""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_infer_endpoint_returns_501_not_implemented():
    """Verify /api/infer returns HTTP 501 Not Implemented in Part 1."""
    payload = {"prompt": "Hello terminal ghost"}
    response = client.post("/api/infer", json=payload)
    assert response.status_code == 501
    data = response.json()
    assert data["status"] == "not_implemented"
    assert "Part 1" in data["stage"]
    assert "Qwen2.5-0.5B-Instruct" in data["message"]
    assert data["model_loaded"] is False


def test_infer_endpoint_validation_error():
    """Verify empty prompt is rejected with 422 Unprocessable Entity."""
    response = client.post("/api/infer", json={"prompt": ""})
    assert response.status_code == 422
    data = response.json()
    assert "details" in data or "detail" in data
