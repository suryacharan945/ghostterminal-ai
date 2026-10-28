"""Inference interface placeholder for GhostTerminal AI (Part 1).

Explicitly marked not implemented. Real open-weight model integration
(Qwen2.5-0.5B-Instruct) occurs in Part 2. Fake AI responses are strictly prohibited.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from backend.app.config import settings

router = APIRouter(tags=["Inference"])


class InferenceRequest(BaseModel):
    """Payload for prompt submission."""

    prompt: str = Field(..., min_length=1, max_length=2000, description="User terminal prompt")


class NotImplementedResponse(BaseModel):
    """Response indicating inference is deferred to Part 2."""

    model_config = {"protected_namespaces": ()}

    status: str
    stage: str
    message: str
    model_id: str
    model_loaded: bool


@router.post(
    "/infer",
    status_code=status.HTTP_501_NOT_IMPLEMENTED,
    response_model=NotImplementedResponse,
    responses={
        501: {
            "description": "Inference engine intentionally deferred to Part 2.",
            "model": NotImplementedResponse,
        }
    },
)
async def infer_placeholder(request: InferenceRequest) -> NotImplementedResponse:
    """Placeholder endpoint for AI terminal inference.

    Returns HTTP 501 Not Implemented in accordance with Part 1 foundation guidelines.
    No mock or fake AI responses are generated.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail={
            "status": "not_implemented",
            "stage": settings.stage,
            "message": (
                "AI inference engine is not implemented in Part 1. "
                "Integration with local open-weight model Qwen2.5-0.5B-Instruct is scheduled for Part 2."
            ),
            "model_id": settings.model_id,
            "model_loaded": settings.model_loaded,
        },
    )
