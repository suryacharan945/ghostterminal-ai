"""Unit tests for inference API validation, error shielding, and contracts."""

from unittest.mock import AsyncMock, patch
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.engine.inference import ModelLifecycle, ModelUnavailableError

client = TestClient(app)


def test_empty_prompt_rejected_422():
    """Verify empty prompt is rejected with HTTP 422."""
    response = client.post("/api/infer", json={"prompt": ""})
    assert response.status_code == 422


def test_oversized_prompt_rejected_422():
    """Verify prompts exceeding 2000 characters are rejected with HTTP 422."""
    long_prompt = "a" * 2001
    response = client.post("/api/infer", json={"prompt": long_prompt})
    assert response.status_code == 422


def test_invalid_temperature_rejected_422():
    """Verify out-of-range temperatures are rejected."""
    # Negative temperature
    resp1 = client.post("/api/infer", json={"prompt": "hi", "temperature": -0.5})
    assert resp1.status_code == 422

    # Temperature > 1.5
    resp2 = client.post("/api/infer", json={"prompt": "hi", "temperature": 2.5})
    assert resp2.status_code == 422


def test_invalid_max_tokens_rejected_422():
    """Verify out-of-range token limits are rejected."""
    resp1 = client.post("/api/infer", json={"prompt": "hi", "max_tokens": 0})
    assert resp1.status_code == 422

    resp2 = client.post("/api/infer", json={"prompt": "hi", "max_tokens": 1000})
    assert resp2.status_code == 422


def test_simulated_command_execution():
    """Verify simulated commands execute with mode 'simulated' and contract consistency."""
    response = client.post("/api/infer", json={"prompt": "whoami"})
    assert response.status_code == 200
    data = response.json()

    assert "Ghost in the Machine" in data["response"]
    assert data["mode"] == "simulated"
    assert data["model_id"] == "Qwen/Qwen2.5-0.5B-Instruct"
    assert data["inference_ms"] >= 0
    assert data["tokens_generated"] > 0


def test_model_unavailable_returns_503():
    """Verify HTTP 503 is returned when model engine is not ready."""
    with patch(
        "backend.app.engine.inference.InferenceEngine.infer",
        new_callable=AsyncMock,
    ) as mock_infer:
        mock_infer.side_effect = ModelUnavailableError("Model engine is currently in state 'not_loaded'")
        response = client.post("/api/infer", json={"prompt": "Tell me a mystery"})
        assert response.status_code == 503
        data = response.json()
        assert data["error"] == "Model unavailable"
        assert "not_loaded" in data["message"]


def test_internal_error_shielding_returns_500():
    """Verify internal unhandled errors do not leak stack traces."""
    with patch(
        "backend.app.engine.inference.InferenceEngine.infer",
        new_callable=AsyncMock,
    ) as mock_infer:
        mock_infer.side_effect = RuntimeError("Internal CUDA/C++ pointer fault (simulated)")
        response = client.post("/api/infer", json={"prompt": "Tell me a story"})
        assert response.status_code == 500
        data = response.json()
        assert data["error"] == "Inference error"
        # Verify raw exception is shielded
        assert "Internal CUDA" not in data["message"]


def test_shell_injection_attempt_is_safely_handled():
    """Verify shell injection strings are caught and disarmed without host execution."""
    injection_prompts = [
        "; rm -rf / ;",
        "echo $(whoami)",
        "`cat /etc/passwd`",
        "| del /f C:\\*",
    ]
    for prompt in injection_prompts:
        response = client.post("/api/infer", json={"prompt": prompt})
        # Should succeed safely with either simulated access-denied or creative response
        assert response.status_code in [200, 503]
        if response.status_code == 200:
            data = response.json()
            assert "response" in data
            # Never execute real host command
            assert "root:" not in data["response"]
