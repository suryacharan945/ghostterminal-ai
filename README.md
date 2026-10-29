# 👻 GhostTerminal AI

[![CI](https://github.com/suryacharan945/ghostterminal-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/suryacharan945/ghostterminal-ai/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.12%20|%203.13](https://img.shields.io/badge/Python-3.12%20%7C%203.13-blue.svg)](https://www.python.org/)
[![Model: Qwen2.5-0.5B-Instruct](https://img.shields.io/badge/Model-Qwen2.5--0.5B--Instruct-purple.svg)](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF)
[![Hacktoberfest 2026](https://img.shields.io/badge/Hacktoberfest-2026%20Week%204-ff79c6.svg)](https://dev.to/challenges/hacktoberfest-week4-2026-10-26)
[![DEV Post](https://img.shields.io/badge/DEV_Post-Published-0a0a0a.svg?logo=devdotto)](https://dev.to/surya_charan_945/ghostterminal-ai-a-haunted-terminal-powered-by-local-open-weight-ai-15g0)

> **"Ghost in the Machine"** — An original Halloween-themed AI terminal driven by genuine local open-weight language model intelligence, running 100% offline without third-party cloud API subscriptions or external telemetry.
>
> 🎃 **Official Hacktoberfest 2026 Week 4 Submission:**  
> **DEV Community Article:** [**GhostTerminal AI: A Haunted Terminal Powered by Local Open-Weight AI 👻**](https://dev.to/surya_charan_945/ghostterminal-ai-a-haunted-terminal-powered-by-local-open-weight-ai-15g0)

Developed for **Hacktoberfest 2026 DEV Challenge: Week 4 (October 26 – October 31, 2026)**.

---

## 🧭 Project Roadmap & Status

- [x] **Part 1: Clean Foundation** — Repository, typed FastAPI backend, React + Vite frontend scaffolding, CI pipeline, security guidelines.
- [x] **Part 2: Real AI Inference Engine** — Genuine local open-weight CPU inference via `llama-cpp-python` and `Qwen2.5-0.5B-Instruct` (Q4_K_M GGUF), haunted persona, deterministic command handling, 23 automated tests, and empirical performance benchmarks.
- [x] **Part 3: Premium Interactive Haunted Terminal** — Phosphor green CRT aesthetic, scanline overlays, suggested incantations, command history ring buffer, Web Audio synthesis, settings/help modals, 29 Vitest tests, and automated high-fidelity UI screenshots.
- [x] **Part 4: Final Integration, Security, QA & Demo** — All 12 end-to-end user journeys validated against real local Qwen model on CPU, security audit and threat modeling, accessibility verification, release checklist, and 120-second demo walkthrough script.
- [x] **Part 5: Final Hacktoberfest Submission (Published & Verified)** — Officially submitted to DEV Community: [**Read the Full Submission Article**](https://dev.to/surya_charan_945/ghostterminal-ai-a-haunted-terminal-powered-by-local-open-weight-ai-15g0) 🎃

---

## 📸 Interactive Terminal Interface

| Desktop Terminal View | Local AI Inference Generation |
| :---: | :---: |
| ![Desktop Terminal](docs/screenshots/01_desktop_terminal.png) | ![Local AI Generation](docs/screenshots/02_ai_generation.png) |

| Deterministic Command Execution | Responsive Mobile Viewport |
| :---: | :---: |
| ![Simulated Command](docs/screenshots/03_simulated_command.png) | ![Mobile Viewport](docs/screenshots/04_mobile_terminal.png) |

| Terminal Configurations Modal | Spectral Manual & Guide |
| :---: | :---: |
| ![Settings Modal](docs/screenshots/05_settings_and_status.png) | ![Help Manual](docs/screenshots/06_spectral_manual.png) |

---

## 🏛 Architecture Overview

```
ghostterminal-ai/
├── backend/            # FastAPI backend service
│   ├── app/            
│   │   ├── api/        # Endpoints: /api/health, /api/model/status, /api/infer
│   │   ├── engine/     # Local model downloader, lifecycle manager, haunted persona
│   │   ├── config.py   # Typed application settings
│   │   └── main.py     # FastAPI application & lifespan management
│   ├── requirements.txt
│   └── requirements-dev.txt
├── frontend/           # React + Vite 5.4.14 + TypeScript interface
│   ├── src/            # App components, typed API client, styling
│   └── package.json
├── models/             # Local GGUF weights (gitignored, auto-verified)
├── docs/               # System documentation & architectural reports
│   ├── ARCHITECTURE.md
│   ├── MODEL_SELECTION.md
│   ├── API_CONTRACT.md
│   ├── INFERENCE_BENCHMARK.md
│   ├── AI_EVALUATION.md
│   ├── UI_DESIGN_SYSTEM.md
│   ├── UI_TEST_RESULTS.md
│   ├── FINAL_QA_REPORT.md
│   ├── SECURITY_REVIEW.md
│   ├── DEMO_SCRIPT.md
│   ├── RELEASE_CHECKLIST.md
│   ├── DEV_SUBMISSION_DRAFT.md
│   ├── DEV_SUBMISSION_CHECKLIST.md
│   ├── DEMO_ASSET_MANIFEST.md
│   ├── FINAL_PROJECT_SUMMARY.md
│   ├── PART1_COMPLETION_REPORT.md
│   ├── PART2_COMPLETION_REPORT.md
│   ├── PART3_COMPLETION_REPORT.md
│   ├── PART4_COMPLETION_REPORT.md
│   ├── demo/           # E2E journey evidence and demo captures
│   └── screenshots/    # High-fidelity visual captures
├── tests/              # 23 automated pytest tests (unit + integration + persona)
└── LICENSE             # MIT License
```

For the publication-ready DEV Community article, see [DEV_SUBMISSION_DRAFT.md](docs/DEV_SUBMISSION_DRAFT.md).  
For the challenge compliance checklist, see [DEV_SUBMISSION_CHECKLIST.md](docs/DEV_SUBMISSION_CHECKLIST.md).  
For the complete 5-part engineering summary, see [FINAL_PROJECT_SUMMARY.md](docs/FINAL_PROJECT_SUMMARY.md).  
For public screenshot and demo links, see [DEMO_ASSET_MANIFEST.md](docs/DEMO_ASSET_MANIFEST.md).  
For complete architectural design, see [ARCHITECTURE.md](docs/ARCHITECTURE.md).  
For the QA test matrix across all 12 journeys, see [FINAL_QA_REPORT.md](docs/FINAL_QA_REPORT.md).  
For threat modeling and security analysis, see [SECURITY_REVIEW.md](docs/SECURITY_REVIEW.md).  
For the 120-second demo script and walkthrough, see [DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md).  
For the release candidate verification checklist, see [RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md).  
For the Part 4 completion deliverable, see [PART4_COMPLETION_REPORT.md](docs/PART4_COMPLETION_REPORT.md).  
For UI design system tokens, see [UI_DESIGN_SYSTEM.md](docs/UI_DESIGN_SYSTEM.md).  
For the UI test suite results, see [UI_TEST_RESULTS.md](docs/UI_TEST_RESULTS.md).  
For empirical hardware latency and throughput, see [INFERENCE_BENCHMARK.md](docs/INFERENCE_BENCHMARK.md).  
For persona safety and prompt evaluations, see [AI_EVALUATION.md](docs/AI_EVALUATION.md).

---

## ⚡ Quickstart & Setup (Windows)

### Prerequisites
- **Git** 2.40+
- **Python** 3.12 or 3.13 (64-bit)
- **Node.js** 20+ or 22+ & **npm** 10+

### 1. Clone the Repository
```powershell
git clone https://github.com/suryacharan945/ghostterminal-ai.git
cd ghostterminal-ai
```

### 2. Backend Setup & Model Initialization
```powershell
# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\Activate.ps1

# Install core and testing dependencies
pip install -r backend/requirements-dev.txt

# Run the test suite (unit + integration with real model)
pytest -v tests/

# Start development backend
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Note: On first startup, the backend verifies and downloads `qwen2.5-0.5b-instruct-q4_k_m.gguf` (468.6 MiB) if not already present in `models/`, validating its SHA-256 integrity.*

Interactive API documentation is live at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup (New Terminal)
```powershell
cd frontend
npm install
npm run typecheck
npm run build
npm test
npm run dev
```
Open `http://localhost:5173` in your browser. The landing page probes `http://127.0.0.1:8000/api/health` and displays the live operational status.

---

## 👻 The Haunted Terminal Persona

GhostTerminal AI features a hybrid architecture combining **deterministic simulated commands** and **local generative open-weight intelligence**:

| Incantation / Command | Nature | Expected Response |
| :--- | :--- | :--- |
| `whoami` | Deterministic | Reveals the ghost's identity at memory address `0xDEADBEEF` |
| `help` | Deterministic | Displays the spectral manual of terminal commands |
| `history` | Deterministic | Inspects simulated séance log of past boot events |
| `git status` | Deterministic | Displays the state of the underworld branch |
| `echo <msg>` | Deterministic | Bounces a whisper through the digital void |
| *Freeform prompt* | Local Generative LLM | Atmospheric, cryptic Halloween / Día de los Muertos response from `Qwen2.5-0.5B-Instruct` |
| `rm -rf /` | Safety Ward | Blocked with access denied ward; zero host command execution |

---

## 📊 Measured Performance (Local CPU)

- **Model Load Time:** **3.48 s**
- **Average Generative Speed:** **9.70 tokens/second**
- **Peak Process Memory:** **597.8 MB RAM**
- **Simulated Command Latency:** **< 1.0 ms**
- **Hardware Profile:** Intel 12-core CPU, Windows 11, Python 3.13

---

## 🛡 Security & Privacy Principles

1. **Zero Cloud API Reliance**: Model weights run locally via quantized GGUF on CPU; no prompt or telemetry leaves your machine.
2. **Absolute Host Isolation**: No shell execution (`os.system`, `subprocess`, shell pipes) is connected to terminal inputs.
3. **Cryptographic Integrity**: Model weights are checked against Git LFS SHA-256 (`74a4da8c9fdbcd15bd1f6d01d621410d31c6fc00986f5eb687824e7b93d7a9db`).
4. **Permissive Licensing**: Source code under [MIT](LICENSE); model weights under [Apache 2.0](docs/MODEL_SELECTION.md).

---

## 🎬 Demo Walkthrough & Presentation

A timed 120-second walkthrough script is available in [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md).  
To run the automated 12-journey validation suite and capture verification screenshots:

```powershell
# Execute the full end-to-end journey validation
.venv\Scripts\python scripts\e2e_journey_validation.py
```

Machine-readable execution telemetry is stored in [docs/demo/e2e_journey_evidence.json](docs/demo/e2e_journey_evidence.json).

---

## 🤝 Acknowledgments & AI Assistance

GhostTerminal AI was developed with the assistance of **Google Antigravity**, an agentic AI pair programming assistant, for test design, architecture drafting, documentation generation, and headless verification automation. All code and local model inference logic have been authored, verified, and benchmarked on local consumer hardware.
