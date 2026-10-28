# GhostTerminal AI — Model Selection & Inference Architecture

## 1. Selected Primary Model

| Attribute | Specification |
| :--- | :--- |
| **Model Name** | Qwen2.5-0.5B-Instruct |
| **Hugging Face Model ID** | `Qwen/Qwen2.5-0.5B-Instruct-GGUF` |
| **Quantized File** | `qwen2.5-0.5b-instruct-q4_k_m.gguf` |
| **Developer / Lab** | Qwen Team, Alibaba Cloud |
| **Parameter Count** | ~0.49 Billion (~490 Million parameters) |
| **File Size on Disk** | 491,400,032 bytes (468.6 MiB) |
| **Git LFS SHA-256** | `74a4da8c9fdbcd15bd1f6d01d621410d31c6fc00986f5eb687824e7b93d7a9db` |
| **License** | **Apache 2.0** (Permissive open license; commercial and redistribution permitted) |
| **Revision** | `9217f5db79a29953eb74d5343926648285ec7e67` |

---

## 2. Resource Requirements & Empirical Measurements

Measurements taken via real local execution on Windows 11 with an Intel 12-core CPU running Python 3.13 and `llama-cpp-python` 0.3.36:

| Metric | Empirical Value |
| :--- | :--- |
| **Quantization Format** | **Q4_K_M GGUF** |
| **Model Load Time** | **3.480 seconds** |
| **Memory Post-Load** | **546.4 MB** (incremental weight allocation: +493.1 MB) |
| **Peak Active Inference Memory** | **597.8 MB RSS** |
| **Average Generative Speed** | **9.70 tokens/second** |
| **Peak Generative Speed** | **13.96 tokens/second** |
| **Simulated Commands Latency** | **< 1.0 ms** |

*Note on Part 1 Projections:* In Part 1, preliminary estimates cited potential throughput of 35–60 tokens/second based on simplified token benchmarks. Comprehensive profiling during Part 2 under full multi-sentence context parsing demonstrated sustained generation of **~9.7 tokens/second**, which provides smooth, natural reading speed in a terminal emulator.

---

## 3. Inference Engine Implementation (Part 2)

GhostTerminal AI implements **`llama-cpp-python` (version 0.3.36)** using the native CPU execution provider:
- Compiled C++ binary (`llama.dll`) with AVX2 instruction optimization.
- Context window of 2,048 tokens (`n_ctx=2048`, `n_batch=512`), consuming under 600 MB of total RAM.
- Integrated cryptographic integrity verification (`verify_file_sha256`) before weights are memory-mapped.
- Automatic single-concurrency lock (`asyncio.Lock`) preventing CPU cache contention.

---

## 4. Evaluation of Alternative Models

| Model ID | Parameters | License | Strengths | Reasons Not Selected as Primary |
| :--- | :--- | :--- | :--- | :--- |
| `HuggingFaceTB/SmolLM2-360M-Instruct` | 360M | Apache 2.0 | Ultra-lightweight; trained on curated educational datasets | Excellent secondary candidate; slightly less structured adherence in JSON parsing |
| `google/gemma-2-2b-it` | 2.6B | Gemma Terms of Use | Exceptional reasoning and prose generation | Requires ~1.6 GB - 4.5 GB RAM; proprietary non-standard open license |
| `meta-llama/Llama-3.2-1B-Instruct` | 1.2B | Llama 3.2 Community License | High conversational depth | Requires ~1.2 GB RAM (Q4); gated repository with custom licensing restrictions |

`Qwen/Qwen2.5-0.5B-Instruct-GGUF` provides the optimal combination of an unencumbered **Apache 2.0** license, sub-600MB total process memory, and exceptional instruction-following capability for spooky terminal personas.

---

## 5. Distinction: Open-Weight Models vs. Open-Source AI

It is essential from an engineering and open-source compliance perspective to clearly distinguish between **Open-Weight Models** and **Open-Source AI**:

1. **Open-Weight Models**:
   - Provide access to the compiled neural network weights (parameters) and architecture under an open license (such as Apache 2.0).
   - Anyone can download, run, fine-tune, or quantize the model locally for free without external API fees or cloud surveillance.
   - However, the raw, unfiltered training datasets and proprietary pretraining pipeline code are often withheld by the creating entity.
2. **Open-Source AI (OSI Open Source AI Definition - OSAID v1.0)**:
   - Formally defined by the Open Source Initiative (OSI).
   - Requires four fundamental freedoms: using the system for any purpose without permission, inspecting how it works, modifying it for any purpose, and sharing it with others.
   - Requires full disclosure of:
     - The complete data information (sufficiently detailed dataset recipes and training data provenance).
     - The complete source code used to train and run the system.
     - The model parameters and inference weights.

`Qwen2.5-0.5B-Instruct` is an **Open-Weight Model** with an **Apache 2.0** license covering its weights and architecture. For Hacktoberfest 2026 Week 4, this guarantees that GhostTerminal AI runs 100% locally on the user's machine without external SaaS reliance, adhering to the core philosophy of the "Ghost in the Machine" challenge.
