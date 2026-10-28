"""GhostTerminal AI - Main FastAPI Application.

Part 2: Real Local Inference Engine.
Provides GET /api/health, GET /api/model/status, and POST /api/infer.
"""

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from backend.app.config import settings
from backend.app.engine.inference import InferenceEngine
from backend.app.api.health import router as health_router
from backend.app.api.inference import router as inference_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("ghostterminal.app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager handling startup model loading and shutdown cleanup."""
    engine = InferenceEngine.get_instance()
    if settings.model_autoload:
        logger.info("Scheduling model initialization in background task...")
        # Initialize without blocking the server boot
        asyncio.create_task(engine.initialize(auto_download=False))
    yield
    # Clean shutdown
    engine.shutdown()


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "GhostTerminal AI: A Halloween-themed local AI terminal. "
        "Hacktoberfest 2026 Week 4 submission - Ghost in the Machine. "
        "Powered by local open-weight Qwen2.5-0.5B-Instruct."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS restricted to configured development origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins if isinstance(settings.cors_origins, list) else [settings.cors_origins],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Normalized JSON handler for HTTP exceptions."""
    detail = exc.detail
    if isinstance(detail, dict):
        return JSONResponse(status_code=exc.status_code, content=detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": detail, "status_code": exc.status_code},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Clean validation error handling."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation error",
            "details": exc.errors(),
            "status_code": 422,
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Top-level safety handler avoiding stack trace leakage."""
    logger.error("Unhandled server exception: %s", str(exc), exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred in the GhostTerminal AI backend.",
            "status_code": 500,
        },
    )


# Include API routers under /api prefix
app.include_router(health_router, prefix="/api")
app.include_router(inference_router, prefix="/api")


@app.get("/", tags=["Root"])
async def root():
    """Service information root."""
    engine = InferenceEngine.get_instance()
    return {
        "app": settings.app_name,
        "version": settings.app_version,
        "stage": settings.stage,
        "health_check": "/api/health",
        "model_status": engine.state.value,
        "model_id": settings.model_id,
        "documentation": "/docs",
    }
