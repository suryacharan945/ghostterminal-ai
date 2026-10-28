# GhostTerminal AI - Model Selection & Inference Architecture

## 1. Selected Primary Model

| Attribute | Specification |
| :--- | :--- |
| **Model Name** | Qwen2.5-0.5B-Instruct |
| **Hugging Face Model ID** | `Qwen/Qwen2.5-0.5B-Instruct` |
| **Developer / Lab** | Qwen Team, Alibaba Cloud |
| **Parameter Count** | ~0.49 Billion (~490 Million parameters) |
| **Context Length** | Up to 32,768 tokens (native support up to 128k) |
| **License** | **Apache 2.0** (Open, permissive, commercial & non-commercial use permitted) |
| **Weights Release Date** | September 2024 (Active community support & broad runtime ecosystem) |

---

## 2. Resource Requirements & Memory Footprint

The primary design goal for GhostTerminal AI is **low-latency, zero-cost, CPU-friendly local inference** that runs smoothly on standard laptops without requiring a discrete GPU.

| Precision / Quantization | Memory Required (RAM) | Expected Inference Speed (CPU) | Suitability for GhostTerminal |
| :--- | :--- | :--- | :--- |
| **FP16 (Uncompressed)** | ~1.0 GB RAM | ~10 - 15 tokens/sec | Development / High precision |
| **Q8_0 (8-bit Quantized)** | ~550 MB RAM | ~25 - 35 tokens/sec | Near-lossless accuracy |
| **Q4_K_M (4-bit Medium)** | **~350 MB - 420 MB RAM** | **~40 - 65 tokens/sec** | **Recommended for Part 2 Production** |

With Q4_K_M GGUF quantization, the entire model footprint is well under 500 MB of RAM, allowing instantaneous response generation even on constrained hardware environments.

---

## 3. Inference Engine Approach for Part 2

For Part 2 integration, the backend will interface with the model using one of two production-ready, pure-local mechanisms:

1. **Option A (Default): `llama-cpp-python` with GGUF**
   - High-performance C++ backend compiled for AVX2 / AVX-512 / ARM Neon.
   - Zero GPU requirement; lightweight memory mapping (`mmap`).
   - Pre-quantized GGUF files freely accessible from Hugging Face (`Qwen/Qwen2.5-0.5B-Instruct-GGUF`).
2. **Option B (Alternative): `onnxruntime` (CPU Execution Provider)**
   - Pre-optimized ONNX graph execution.
   - Extremely minimal Python dependency surface.

*Note: In accordance with Part 1 boundaries, no weights are downloaded or loaded into memory during Part 1.*

---

## 4. Evaluation of Alternative Models

| Model ID | Parameters | License | Strengths | Reasons Not Selected as Primary |
| :--- | :--- | :--- | :--- | :--- |
| `HuggingFaceTB/SmolLM2-360M-Instruct` | 360M | Apache 2.0 | Ultra-lightweight, trained on high-quality curated educational datasets | Excellent secondary candidate; slightly less structured adherence in JSON parsing |
| `google/gemma-2-2b-it` | 2.6B | Gemma Terms of Use | Exceptional reasoning and prose generation | Requires ~1.6 GB - 4.5 GB RAM; proprietary non-standard open license |
| `meta-llama/Llama-3.2-1B-Instruct` | 1.2B | Llama 3.2 Community License | High conversational depth | Requires ~1.2 GB RAM (Q4); gated repository with custom licensing restrictions |

`Qwen/Qwen2.5-0.5B-Instruct` provides the optimal combination of an unencumbered **Apache 2.0** license, sub-500MB RAM consumption, and exceptional instruction-following capability for spooky terminal personas.

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

---

## 6. Limitations & Mitigations

- **Context Horizon**: While capable of 32k tokens, memory consumption increases with context size on CPU.
  - *Mitigation*: Part 2 will implement a sliding context window of 2,048 tokens, optimal for terminal interactions.
- **Factual Depth**: Sub-billion parameter models can hallucinate specific library versions or historical trivia.
  - *Mitigation*: GhostTerminal AI focuses on thematic persona roleplay, terminal command translation, and atmospheric dialogue rather than arbitrary broad-domain factual queries.
