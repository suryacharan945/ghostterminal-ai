"""Inference endpoint for GhostTerminal AI (Part 2: Real Local Inference)."""

import logging
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from backend.app.config import settings
from backend.app.engine.inference import (
    InferenceEngine,
    ModelLifecycle,
    ModelUnavailableError,
)

logger = logging.getLogger("ghostterminal.api.infer")
router = APIRouter(tags=["Inference"])


class InferenceRequest(BaseModel):
    """Payload for submitting a terminal prompt."""

    model_config = {"protected_namespaces": ()}

    prompt: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="User terminal prompt or command",
        examples=["whoami", "What stirs inside this haunted machine?"],
    )
    max_tokens: int = Field(
        default=settings.default_max_tokens,
        ge=1,
        le=settings.max_tokens_limit,
        description="Maximum tokens to generate",
    )
    temperature: float = Field(
        default=settings.default_temperature,
        ge=0.0,
        le=1.5,
        description="Sampling temperature for creative narrative",
    )


class InferenceResponse(BaseModel):
    """Structured response from the local inference engine."""

    model_config = {"protected_namespaces": ()}

    response: str = Field(..., description="Generated text or simulated output")
    model_id: str = Field(..., description="Identifier of the executing model")
    inference_ms: float = Field(..., description="Wall-clock inference latency in ms")
    tokens_generated: int = Field(..., description="Number of tokens generated")
    mode: str = Field(..., description="Execution mode: 'local' (LLM) or 'simulated'")


class ModelStatusResponse(BaseModel):
    """Health and lifecycle details of the local model."""

    model_config = {"protected_namespaces": ()}

    model_id: str
    model_file: str
    status: str
    device: str
    load_time_ms: float
    total_inferences: int


@router.post("/infer", response_model=InferenceResponse)
async def infer(request: InferenceRequest) -> InferenceResponse:
    """Submits a prompt to GhostTerminal AI.

    Routes input to simulated deterministic commands or local Qwen2.5-0.5B-Instruct inference.
    Executes 100% locally on CPU without remote third-party API calls.
    """
    engine = InferenceEngine.get_instance()

    try:
        text, latency, tokens, mode = await engine.infer(
            prompt=request.prompt,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
        )
        return InferenceResponse(
            response=text,
            model_id=settings.model_id,
            inference_ms=latency,
            tokens_generated=tokens,
            mode=mode,
        )
    except ModelUnavailableError as exc:
        logger.warning("Inference rejected: %s", str(exc))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": "Model unavailable",
                "message": str(exc),
                "status_code": 503,
            },
        )
    except Exception as exc:
        logger.error("Unhandled inference error: %s", str(exc), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Inference error",
                "message": "The ghost in the machine encountered an internal glitch.",
                "status_code": 500,
            },
        )


@router.get("/model/status", response_model=ModelStatusResponse)
async def get_model_status() -> ModelStatusResponse:
    """Returns runtime status and performance statistics of the local model."""
    engine = InferenceEngine.get_instance()
    return ModelStatusResponse(
        model_id=settings.model_id,
        model_file=settings.model_file,
        status=engine.state.value,
        device=settings.model_device,
        load_time_ms=engine.load_time_ms,
        total_inferences=engine.total_inferences,
    )
