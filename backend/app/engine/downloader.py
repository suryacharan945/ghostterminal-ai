"""Model download and cryptographic verification utility for GhostTerminal AI."""

import hashlib
import logging
import os
import urllib.request
from typing import Optional

logger = logging.getLogger("ghostterminal.downloader")

DEFAULT_MODEL_REPO = "Qwen/Qwen2.5-0.5B-Instruct-GGUF"
DEFAULT_MODEL_FILE = "qwen2.5-0.5b-instruct-q4_k_m.gguf"
DEFAULT_MODEL_REVISION = "9217f5db79a29953eb74d5343926648285ec7e67"
DEFAULT_MODEL_URL = f"https://huggingface.co/{DEFAULT_MODEL_REPO}/resolve/main/{DEFAULT_MODEL_FILE}"
DEFAULT_MODEL_SHA256 = "74a4da8c9fdbcd15bd1f6d01d621410d31c6fc00986f5eb687824e7b93d7a9db"
DEFAULT_MODEL_SIZE_BYTES = 491400032


def verify_file_sha256(filepath: str, expected_sha256: str) -> bool:
    """Computes SHA-256 in 1MB chunks and verifies against expected checksum."""
    if not os.path.exists(filepath):
        return False
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(1024 * 1024):
            h.update(chunk)
    actual = h.hexdigest().lower()
    match = actual == expected_sha256.lower()
    if not match:
        logger.warning(
            "Checksum mismatch for %s. Expected: %s, Actual: %s",
            filepath,
            expected_sha256,
            actual,
        )
    return match


def ensure_model_available(
    model_dir: str = "models",
    filename: str = DEFAULT_MODEL_FILE,
    url: str = DEFAULT_MODEL_URL,
    expected_sha256: str = DEFAULT_MODEL_SHA256,
) -> str:
    """Ensures model weights are present and verified before inference.

    Downloads file if missing or corrupt, validating SHA-256 against Git LFS record.
    """
    os.makedirs(model_dir, exist_ok=True)
    target_path = os.path.join(model_dir, filename)

    if os.path.exists(target_path):
        if verify_file_sha256(target_path, expected_sha256):
            logger.info("Verified existing model at %s (SHA-256 matched)", target_path)
            return target_path
        logger.warning("Existing model failed integrity check. Re-downloading...")
        os.remove(target_path)

    temp_path = f"{target_path}.tmp"
    logger.info("Downloading %s from %s...", filename, url)

    req = urllib.request.Request(
        url,
        headers={"User-Agent": "GhostTerminal-Engine/0.2.0 (Hacktoberfest 2026)"},
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp, open(temp_path, "wb") as f:
            total_size = int(resp.headers.get("Content-Length", 0))
            downloaded = 0
            hasher = hashlib.sha256()

            while chunk := resp.read(1024 * 512):
                f.write(chunk)
                hasher.update(chunk)
                downloaded += len(chunk)

        computed_sha = hasher.hexdigest().lower()
        if computed_sha != expected_sha256.lower():
            if os.path.exists(temp_path):
                os.remove(temp_path)
            raise ValueError(
                f"Model integrity verification failed! Expected SHA-256: {expected_sha256}, "
                f"computed: {computed_sha}"
            )

        if os.path.exists(target_path):
            os.remove(target_path)
        os.rename(temp_path, target_path)
        logger.info("Successfully downloaded and verified %s", target_path)
        return target_path
    except Exception as exc:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                pass
        logger.error("Failed to download model %s: %s", filename, str(exc))
        raise
