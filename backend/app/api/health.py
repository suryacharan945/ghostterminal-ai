"""Health check endpoint for GhostTerminal AI."""

from fastapi import APIRouter
from pydantic import BaseModel, Field
from backend.app.config import settings

router = APIRouter(tags=["Health"])


class HealthResponse(BaseModel):
    """Structured response schema for health status."""

    model_config = {"protected_namespaces": ()}

    status: str = Field(..., description="Operational status flag (e.g. 'ok')")
    app: str = Field(..., description="Application name")
    version: str = Field(..., description="Semantic version string")
    stage: str = Field(..., description="Current development stage")
    environment: str = Field(..., description="Runtime environment")
    model_status: str = Field(..., description="Local model inference readiness")
    model_id: str = Field(..., description="Configured open-weight model identifier")


@router.get("/health", response_model=HealthResponse)
async def get_health() -> HealthResponse:
    """Returns stable JSON health status of the GhostTerminal AI backend."""
    return HealthResponse(
        status="ok",
        app=settings.app_name,
        version=settings.app_version,
        stage=settings.stage,
        environment=settings.environment,
        model_status="not_loaded" if not settings.model_loaded else "ready",
        model_id=settings.model_id,
    )
