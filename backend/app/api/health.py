"""Health check endpoint for GhostTerminal AI."""

from fastapi import APIRouter
from pydantic import BaseModel, Field

from backend.app.config import settings
from backend.app.engine.inference import InferenceEngine

router = APIRouter(tags=["Health"])


class HealthResponse(BaseModel):
    """Structured response schema for health status."""

    model_config = {"protected_namespaces": ()}

    status: str = Field(..., description="Operational status flag (e.g. 'ok')")
    app: str = Field(..., description="Application name")
    version: str = Field(..., description="Semantic version string")
    stage: str = Field(..., description="Current development stage")
    environment: str = Field(..., description="Runtime environment")
    model_status: str = Field(..., description="Local model lifecycle state")
    model_id: str = Field(..., description="Configured open-weight model identifier")


@router.get("/health", response_model=HealthResponse)
async def get_health() -> HealthResponse:
    """Returns stable JSON health status including active model lifecycle."""
    engine = InferenceEngine.get_instance()
    return HealthResponse(
        status="ok",
        app=settings.app_name,
        version=settings.app_version,
        stage=settings.stage,
        environment=settings.environment,
        model_status=engine.state.value,
        model_id=settings.model_id,
    )
