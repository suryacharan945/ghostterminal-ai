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
    app_version: str = "0.2.0"
    stage: str = "Part 2 - Inference Engine"
    environment: str = "development"
    host: str = "127.0.0.1"
    port: int = 8000
    cors_origins: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # Model settings
    model_id: str = "Qwen/Qwen2.5-0.5B-Instruct"
    model_file: str = "qwen2.5-0.5b-instruct-q4_k_m.gguf"
    model_dir: str = "models"
    model_device: str = "cpu"
    model_autoload: bool = True
    max_tokens_limit: int = 512
    default_max_tokens: int = 128
    default_temperature: float = 0.7

    @field_validator("cors_origins", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v


settings = Settings()
