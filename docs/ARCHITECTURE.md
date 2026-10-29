# GhostTerminal AI — Architecture Specification

## 1. Project Overview & Context

**GhostTerminal AI** is an original Halloween-themed AI terminal developed for **Hacktoberfest 2026 Week 4: "Ghost in the Machine"**. 
The project embodies the spirit of a haunted terminal possessed by a cryptic spirit living inside the machine. Instead of relying on closed third-party cloud APIs, GhostTerminal AI operates purely via **local open-weight AI inference** on standard consumer hardware (CPU-friendly).

### Development Stages
- **Part 1: Clean Foundation** — Completed. FastAPI backend foundation, React + Vite scaffolding, CI pipeline, security guidelines.
- **Part 2: Real Local AI Inference Engine** — Completed. Real local inference with `Qwen2.5-0.5B-Instruct` (Q4_K_M GGUF), `llama-cpp-python` CPU engine, haunted persona system prompt, deterministic simulated commands, 23 automated tests, and empirical CPU benchmarks.
- **Part 3: Premium Interactive Haunted Terminal** — Completed. CRT scanlines, phosphor glow, suggested incantations, command history ring buffer, Web Audio synthesizer, settings/help modals, 29 Vitest tests, and automated high-fidelity UI screenshots.
- **Part 4: Final Integration, Security, QA & Demo** — Completed. All 12 end-to-end user journeys validated, threat modeling and security review, WCAG AA accessibility, release checklist, and 120-second demo script.
- **Part 5 (Current): Final Hacktoberfest Submission & Release** — Completed. Official DEV Community submission draft, challenge compliance verification, demo media manifest, and complete 5-part engineering summary.

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
│   │   ├── __tests__/           # Vitest unit & integration test suites
│   │   │   ├── api.test.ts
│   │   │   ├── App.test.tsx
│   │   │   ├── sound.test.ts
│   │   │   └── Terminal.test.tsx
│   │   ├── components/          # Modular UI components
│   │   │   ├── Header.tsx       # System title, real-time status pill & modal buttons
│   │   │   ├── HelpModal.tsx    # Spectral manual and command reference guide
│   │   │   ├── InputBar.tsx     # Shell prompt, history navigation, character counter
│   │   │   ├── SettingsModal.tsx# CRT scanlines, audio, speed & model parameter controls
│   │   │   ├── Suggestions.tsx  # Clickable suggested incantations & commands
│   │   │   └── Terminal.tsx     # Monospace CRT console, message list, copy buttons
│   │   ├── api.ts               # Resilient fetch client with abort signal
│   │   ├── App.css              # Responsive CRT layout, scanlines, and glow styles
│   │   ├── App.tsx              # Central state coordinator & localStorage persistence
│   │   ├── index.css            # Color palette tokens & dark background
│   │   ├── main.tsx             # Application bootstrap
│   │   ├── sound.ts             # Web Audio API mechanical click & chime synthesizer
│   │   ├── test-setup.ts        # Vitest jsdom polyfills & matchers
│   │   └── types.ts             # TypeScript definitions
│   ├── index.html
│   ├── package.json             # Pinned dependencies (React 18, Vite 5.4.14, Vitest 2.1.8)
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts           # Development proxy & Vitest jsdom configuration
├── models/                      # Gitignored directory storing verified GGUF weights
│   └── qwen2.5-0.5b-instruct-q4_k_m.gguf
├── docs/
│   ├── demo/                    # E2E journey evidence and demo captures
│   ├── screenshots/             # Real automated headless Chrome captures
│   ├── AI_EVALUATION.md         # 17-prompt evaluation dataset & safety review
│   ├── API_CONTRACT.md          # OpenAPI / schema definitions
│   ├── ARCHITECTURE.md          # System architecture and design
│   ├── INFERENCE_BENCHMARK.md   # Empirical CPU latency & throughput measurements
│   ├── MODEL_SELECTION.md       # Open-weight model research & evaluation
│   ├── FINAL_QA_REPORT.md       # Comprehensive 12-journey QA verification report
│   ├── SECURITY_REVIEW.md       # Threat modeling, host isolation, and security audit
│   ├── DEMO_SCRIPT.md           # 120-second video demo walkthrough script
│   ├── RELEASE_CHECKLIST.md     # Pre-submission release candidate checklist
│   ├── DEV_SUBMISSION_DRAFT.md  # Official publication-ready DEV Community article
│   ├── DEV_SUBMISSION_CHECKLIST.md # Submission checklist against DEV contest rules
│   ├── DEMO_ASSET_MANIFEST.md   # Public raw GitHub URLs for all screenshots & demo assets
│   ├── FINAL_PROJECT_SUMMARY.md # Complete multi-part project overview and metrics
│   ├── PART1_COMPLETION_REPORT.md # Part 1 completion deliverable
│   ├── PART2_COMPLETION_REPORT.md # Part 2 completion deliverable
│   ├── PART3_COMPLETION_REPORT.md # Part 3 completion deliverable
│   ├── PART4_COMPLETION_REPORT.md # Part 4 completion deliverable
│   ├── UI_DESIGN_SYSTEM.md      # UI design tokens, CRT simulation & accessibility
│   └── UI_TEST_RESULTS.md       # Unit test, responsive, and accessibility results
├── tests/
│   ├── __init__.py
│   ├── test_health.py           # Contract, CORS, and model status tests
│   ├── test_inference_integration.py # Real model integration tests
│   ├── test_inference_unit.py   # Parameter validation, 422/503 shielding tests
│   └── test_persona.py          # Simulated commands & injection ward tests
├── scripts/
│   ├── benchmark_and_eval.py    # Benchmark & evaluation runner
│   ├── capture_screenshots.py   # Headless Chrome automated UI capture runner
│   └── e2e_journey_validation.py# Automated 12-journey E2E test runner
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
