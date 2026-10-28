"""Application configuration module for GhostTerminal AI."""

from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Strongly typed application configuration."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        protected_namespaces=(),
    )

    app_name: str = "GhostTerminal AI"
    app_version: str = "0.1.0"
    stage: str = "Part 1 - Foundation"
    environment: str = "development"
    host: str = "127.0.0.1"
    port: int = 8000
    cors_origins: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # Model metadata (Part 2 preview - no weights loaded in Part 1)
    model_id: str = "Qwen/Qwen2.5-0.5B-Instruct"
    model_device: str = "cpu"
    model_loaded: bool = False

    @field_validator("cors_origins", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v


settings = Settings()
