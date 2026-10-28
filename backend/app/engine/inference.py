"""Inference engine managing the Qwen2.5-0.5B-Instruct local model lifecycle."""

import asyncio
import logging
import os
import time
from enum import Enum
from typing import Optional, Tuple

from llama_cpp import Llama

from backend.app.config import settings
from backend.app.engine.downloader import (
    DEFAULT_MODEL_FILE,
    DEFAULT_MODEL_REPO,
    DEFAULT_MODEL_SHA256,
    ensure_model_available,
    verify_file_sha256,
)
from backend.app.engine.persona import HAUNTED_SYSTEM_PROMPT, handle_simulated_command

logger = logging.getLogger("ghostterminal.engine")


class ModelLifecycle(str, Enum):
    """Lifecycle state of the local inference model."""

    NOT_LOADED = "not_loaded"
    LOADING = "loading"
    READY = "ready"
    FAILED = "failed"


class ModelUnavailableError(Exception):
    """Raised when inference is requested while model is not ready."""


class InferenceEngine:
    """Thread-safe singleton engine managing local open-weight inference."""

    _instance: Optional["InferenceEngine"] = None

    def __init__(self) -> None:
        self.state: ModelLifecycle = ModelLifecycle.NOT_LOADED
        self.llm: Optional[Llama] = None
        self.model_path: str = os.path.join("models", DEFAULT_MODEL_FILE)
        self.model_id: str = DEFAULT_MODEL_REPO
        self.error_message: Optional[str] = None
        self.load_time_ms: float = 0.0
        self.total_inferences: int = 0
        self._lock = asyncio.Lock()

    @classmethod
    def get_instance(cls) -> "InferenceEngine":
        """Singleton accessor."""
        if cls._instance is None:
            cls._instance = InferenceEngine()
        return cls._instance

    def initialize_sync(self, auto_download: bool = True) -> bool:
        """Synchronously loads and verifies the model, running a smoke test."""
        if self.state == ModelLifecycle.READY and self.llm is not None:
            return True

        self.state = ModelLifecycle.LOADING
        self.error_message = None
        logger.info("Initializing GhostTerminal AI inference engine (%s)...", self.model_id)

        t_start = time.perf_counter()
        try:
            if auto_download:
                self.model_path = ensure_model_available(
                    model_dir="models",
                    filename=DEFAULT_MODEL_FILE,
                    expected_sha256=DEFAULT_MODEL_SHA256,
                )
            else:
                if not verify_file_sha256(self.model_path, DEFAULT_MODEL_SHA256):
                    raise FileNotFoundError(f"Verified model not found at {self.model_path}")

            # Instantiate Llama CPU runtime
            # n_ctx=2048, n_threads=4, n_batch=512 for optimal CPU performance
            self.llm = Llama(
                model_path=self.model_path,
                n_ctx=2048,
                n_threads=max(1, os.cpu_count() or 4),
                n_batch=512,
                verbose=False,
            )

            # Mandatory smoke test: verify output before declaring ready
            smoke_prompt = (
                "<|im_start|>system\nTest<|im_end|>\n"
                "<|im_start|>user\nPing<|im_end|>\n"
                "<|im_start|>assistant\n"
            )
            smoke_out = self.llm(
                smoke_prompt,
                max_tokens=5,
                temperature=0.1,
                stop=["<|im_end|>", "<|endoftext|>"],
            )
            if not smoke_out or "choices" not in smoke_out:
                raise RuntimeError("Model smoke test failed to produce output choices")

            self.load_time_ms = round((time.perf_counter() - t_start) * 1000, 2)
            self.state = ModelLifecycle.READY
            logger.info("Inference engine ready! Loaded in %.2f ms", self.load_time_ms)
            return True
        except Exception as exc:
            self.state = ModelLifecycle.FAILED
            self.error_message = str(exc)
            logger.error("Failed to initialize model: %s", str(exc), exc_info=True)
            return False

    async def initialize(self, auto_download: bool = True) -> bool:
        """Asynchronously triggers model initialization in worker thread."""
        return await asyncio.to_thread(self.initialize_sync, auto_download)

    def shutdown(self) -> None:
        """Releases model resources."""
        logger.info("Shutting down GhostTerminal inference engine...")
        self.llm = None
        self.state = ModelLifecycle.NOT_LOADED
        self.error_message = None

    async def infer(
        self,
        prompt: str,
        max_tokens: int = 128,
        temperature: float = 0.7,
    ) -> Tuple[str, float, int, str]:
        """Runs prompt inference through persona commands or local LLM.

        Returns:
            Tuple of (response_text, inference_ms, tokens_generated, mode)
        """
        # Step 1: Check simulated command interceptor (fast path, no LLM required)
        simulated = handle_simulated_command(prompt)
        if simulated is not None:
            text, mode = simulated
            # Simulated commands execute deterministically in sub-millisecond
            return text, 0.5, len(text.split()), mode

        # Step 2: Route to local open-weight LLM
        if self.state != ModelLifecycle.READY or self.llm is None:
            raise ModelUnavailableError(
                f"Model engine is currently in state '{self.state.value}'. "
                f"Error detail: {self.error_message or 'Initialization pending'}"
            )

        # Enforce single concurrency during CPU inference to protect host memory/CPU
        async with self._lock:
            formatted_prompt = (
                f"<|im_start|>system\n{HAUNTED_SYSTEM_PROMPT}<|im_end|>\n"
                f"<|im_start|>user\n{prompt.strip()}<|im_end|>\n"
                f"<|im_start|>assistant\n"
            )

            t_start = time.perf_counter()

            def _run():
                return self.llm(
                    formatted_prompt,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    top_p=0.9,
                    repeat_penalty=1.1,
                    stop=["<|im_end|>", "<|endoftext|>", "\n<|im_start|>"],
                )

            output = await asyncio.to_thread(_run)
            inference_ms = round((time.perf_counter() - t_start) * 1000, 2)

            text = output["choices"][0]["text"].strip()
            usage = output.get("usage", {})
            tokens_generated = usage.get("completion_tokens", len(text.split()))

            self.total_inferences += 1
            return text, inference_ms, tokens_generated, "local"
