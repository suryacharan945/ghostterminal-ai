"""Integration tests using the real local Qwen2.5-0.5B-Instruct model."""

import asyncio
import os
import pytest
from backend.app.engine.inference import InferenceEngine, ModelLifecycle

MODEL_PATH = os.path.join("models", "qwen2.5-0.5b-instruct-q4_k_m.gguf")


@pytest.fixture(scope="module")
def real_engine():
    """Initializes the real inference engine once for the integration test module."""
    if not os.path.exists(MODEL_PATH):
        pytest.skip(f"Model file not found at {MODEL_PATH}")

    engine = InferenceEngine.get_instance()
    success = engine.initialize_sync(auto_download=False)
    assert success is True
    assert engine.state == ModelLifecycle.READY
    assert engine.llm is not None
    yield engine
    # Cleanup


@pytest.mark.asyncio
async def test_real_model_inference_valid_query(real_engine):
    """Verify real open-weight model generates non-trivial creative text."""
    prompt = "Who lurks inside the CRT monitor?"
    text, latency, tokens, mode = await real_engine.infer(
        prompt=prompt,
        max_tokens=60,
        temperature=0.7,
    )

    assert mode == "local"
    assert latency > 0
    assert tokens > 0
    assert len(text.strip()) > 10
    # Must not produce mocked or template filler
    assert "not implemented" not in text.lower()


@pytest.mark.asyncio
async def test_real_model_repeated_requests(real_engine):
    """Verify model can handle sequential queries cleanly without degradation."""
    prompts = [
        "What is the date of Halloween?",
        "Whisper a secret about the machine.",
    ]
    for p in prompts:
        text, latency, tokens, mode = await real_engine.infer(
            prompt=p,
            max_tokens=40,
            temperature=0.7,
        )
        assert mode == "local"
        assert tokens > 0
        assert len(text) > 0


@pytest.mark.asyncio
async def test_real_model_concurrent_requests(real_engine):
    """Verify async lock serializes concurrent inferences safely."""
    async def _query(p):
        return await real_engine.infer(prompt=p, max_tokens=30, temperature=0.7)

    results = await asyncio.gather(
        _query("First spirit call"),
        _query("Second spirit call"),
    )
    assert len(results) == 2
    for text, latency, tokens, mode in results:
        assert mode == "local"
        assert tokens > 0
        assert len(text) > 0


@pytest.mark.asyncio
async def test_real_model_deterministic_and_generative_mixed(real_engine):
    """Verify seamless switching between simulated commands and generative LLM."""
    # 1. Deterministic simulated command
    sim_text, sim_lat, sim_tokens, sim_mode = await real_engine.infer("whoami")
    assert sim_mode == "simulated"
    assert "Ghost in the Machine" in sim_text

    # 2. Generative LLM query
    gen_text, gen_lat, gen_tokens, gen_mode = await real_engine.infer(
        "Describe the autumn moon through the window.",
        max_tokens=40,
    )
    assert gen_mode == "local"
    assert len(gen_text) > 5
