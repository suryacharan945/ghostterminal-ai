# GhostTerminal AI — Architecture Specification

## 1. Project Overview & Context

**GhostTerminal AI** is an original Halloween-themed AI terminal developed for **Hacktoberfest 2026 Week 4: "Ghost in the Machine"**. 
The project embodies the spirit of a haunted terminal possessed by a cryptic spirit living inside the machine. Instead of relying on closed third-party cloud APIs, GhostTerminal AI operates purely via **local open-weight AI inference** on standard consumer hardware (CPU-friendly).

### Development Stages
- **Part 1: Clean Foundation** — Completed. FastAPI backend foundation, React + Vite scaffolding, CI pipeline, security guidelines.
- **Part 2 (Current): Real Local AI Inference Engine** — Completed. Real local inference with `Qwen2.5-0.5B-Instruct` (Q4_K_M GGUF), `llama-cpp-python` CPU engine, haunted persona system prompt, deterministic simulated commands, 23 automated tests, and empirical CPU benchmarks.
- **Part 3: Spooky Terminal Experience** — CRT scanline effects, phosphor glow, typing teletype animations, spectral audio effects.
- **Part 4: Autonomous Terminal Commands** — Sandboxed pseudo-terminal command parsing and haunted system status inspections.
- **Part 5: Production Packaging & Showcase** — Final performance benchmarking, documentation, and DEV Challenge community article.

---

## 2. Directory Structure

```
ghostterminal-ai/
├── .github/
│   └── workflows/
│       └── ci.yml               # Automated CI for backend tests and frontend build
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── health.py        # GET /api/health (lifecycle state reporting)
│   │   │   └── inference.py     # POST /api/infer & GET /api/model/status
│   │   ├── engine/
│   │   │   ├── __init__.py
│   │   │   ├── downloader.py    # SHA-256 verification and GGUF downloader
│   │   │   ├── inference.py     # InferenceEngine singleton & concurrency lock
│   │   │   └── persona.py       # Haunted persona prompt & simulated command parser
│   │   ├── __init__.py
│   │   ├── config.py            # Typed settings via pydantic-settings
│   │   └── main.py              # FastAPI application, CORS, and lifespan management
│   ├── requirements.txt         # Production dependencies pinned with CPU wheel index
│   └── requirements-dev.txt     # Development/testing dependencies
├── frontend/
│   ├── src/
│   │   ├── api.ts               # Resilient fetch client with abort signal
│   │   ├── App.css              # Terminal layout styles
│   │   ├── App.tsx              # Terminal landing view with connection states
│   │   ├── index.css            # Base dark theme styling
│   │   ├── main.tsx             # Application bootstrap
│   │   └── types.ts             # TypeScript definitions
│   ├── index.html
│   ├── package.json             # Minimal dependencies (React 18, Vite 5.4.14, TS 5)
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts           # Development proxy configuration
├── models/                      # Gitignored directory storing verified GGUF weights
│   └── qwen2.5-0.5b-instruct-q4_k_m.gguf
├── docs/
│   ├── AI_EVALUATION.md         # 17-prompt evaluation dataset & safety review
│   ├── API_CONTRACT.md          # OpenAPI / schema definitions
│   ├── ARCHITECTURE.md          # System architecture and design
│   ├── INFERENCE_BENCHMARK.md   # Empirical CPU latency & throughput measurements
│   ├── MODEL_SELECTION.md       # Open-weight model research & evaluation
│   ├── PART1_COMPLETION_REPORT.md # Part 1 completion deliverable
│   └── PART2_COMPLETION_REPORT.md # Part 2 completion deliverable
├── tests/
│   ├── __init__.py
│   ├── test_health.py           # Contract, CORS, and model status tests
│   ├── test_inference_integration.py # Real model integration tests
│   ├── test_inference_unit.py   # Parameter validation, 422/503 shielding tests
│   └── test_persona.py          # Simulated commands & injection ward tests
├── scripts/
│   └── benchmark_and_eval.py    # Benchmark & evaluation runner
├── .env.example                 # Example configuration template
├── .gitignore                   # Comprehensive secret/weight/node_modules exclusion
├── LICENSE                      # MIT Open Source License
├── pytest.ini                   # Pytest test discovery & event loop configuration
└── README.md                    # Setup guide, architecture, and project status
```

---

## 3. Backend & Inference Engine Architecture

- **Framework**: FastAPI (Python 3.12+ / 3.13)
- **ASGI Server**: Uvicorn with async lifespan management
- **Inference Runtime**: `llama-cpp-python` (version 0.3.36) using high-performance C++ backend (`llama.dll` compiled with AVX2).
- **Execution Model**:
  - `InferenceEngine` operates as a thread-safe singleton.
  - Model is loaded **once per process** at application startup or via explicit initialization, never per request.
  - Generative inference runs within worker threads (`asyncio.to_thread`) to avoid blocking FastAPI's asynchronous event loop.
  - Concurrent requests are serialized via `asyncio.Lock` to preserve CPU cache locality and prevent memory spikes.
- **Hybrid Processing Pipeline**:
  1. **Deterministic Fast Path**: Inputs matching standard terminal incantations (`whoami`, `help`, `history`, `git status`, `echo`, `date`, `clear`) execute in sub-millisecond via `handle_simulated_command()`.
  2. **Generative LLM Path**: Unmatched creative prompts are formatted using the Qwen ChatML template with the haunted persona system prompt and processed by `Qwen2.5-0.5B-Instruct`.
  3. **Protective Ward Layer**: Shell injection attempts (`rm -rf`, `powershell`, `format`, `del`) are intercepted deterministically and disarmed with in-character access-denied responses.
- **Model Verification**: Before loading, `downloader.py` calculates the SHA-256 hash of the `.gguf` file in 1MB chunks and verifies it against the Git LFS pointer (`74a4da8c9fdbcd15bd1f6d01d621410d31c6fc00986f5eb687824e7b93d7a9db`).

---

## 4. Model Lifecycle & Health States

The application health reporting actively reflects the internal lifecycle of the model:
- `not_loaded`: Initial state prior to loading.
- `loading`: File verification and memory mapping underway.
- `ready`: Model loaded into memory and verified via smoke test.
- `failed`: Model verification or loading encountered an error (surfaced with error detail in `/api/model/status`).

---

## 5. Security & Isolation Model

1. **No Arbitrary Command Execution**: GhostTerminal AI processes terminal inputs purely as text queries or simulated state. No `os.system`, `subprocess.Popen`, or `eval` is exposed to user input.
2. **Secret Hygiene**: Strict `.gitignore` rules prevent accidental commit of `.env`, tokens, private keys, or credentials.
3. **Model Weight Segregation**: GGUF binaries are gitignored and stored in `models/`.
4. **No Third-Party Paid API Dependencies**: The system relies exclusively on local, open-weight models, ensuring zero subscription costs, high privacy, and complete offline capability.
