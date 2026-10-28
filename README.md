# 👻 GhostTerminal AI

[![CI](https://github.com/suryacharan945/ghostterminal-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/suryacharan945/ghostterminal-ai/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.12+](https://img.shields.io/badge/Python-3.12%2B-blue.svg)](https://www.python.org/)
[![React 18](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Hacktoberfest 2026](https://img.shields.io/badge/Hacktoberfest-2026%20Week%204-ff79c6.svg)](https://dev.to/challenges/hacktoberfest-week4-2026-10-26)

> **"Ghost in the Machine"** — An original Halloween-themed AI terminal driven by local open-weight language model intelligence, running 100% offline without third-party cloud API subscriptions or external telemetry.

Developed for **Hacktoberfest 2026 DEV Challenge: Week 4 (October 26 – October 31, 2026)**.

---

## 🧭 Project Status: PART 1 OF 5 — FOUNDATION ONLY

- [x] **Repository & Clean Foundation**: Public GitHub repository under [`suryacharan945/ghostterminal-ai`](https://github.com/suryacharan945/ghostterminal-ai).
- [x] **Backend API Foundation**: FastAPI service with typed settings (`pydantic-settings`), CORS restriction, error handlers, and `/api/health`.
- [x] **Inference Interface Contract**: Placeholder `/api/infer` returning HTTP 501 Not Implemented (strictly zero fake AI).
- [x] **Frontend Foundation**: React + Vite + TypeScript application with verified backend connection states (`loading`, `connected`, `unavailable`, `error`).
- [x] **Model Research & Architecture**: Complete evaluation selecting `Qwen/Qwen2.5-0.5B-Instruct` (Apache 2.0, CPU-friendly quantized GGUF).
- [x] **CI & Automated Verification**: GitHub Actions workflow validating backend tests and frontend typechecking/builds.
- [ ] *Part 2 (Next)*: Local CPU inference engine integration with real open weights.
- [ ] *Part 3*: Haunted CRT visual atmosphere, teletype animations, and audio effects.
- [ ] *Part 4*: Sandboxed pseudo-terminal command execution and ghost interactions.
- [ ] *Part 5*: Final optimizations, showcase walkthrough, and DEV publication.

---

## 🏛 Architecture Overview

```
ghostterminal-ai/
├── backend/            # FastAPI backend service
│   ├── app/            # Application code, API routers, typed configuration
│   ├── requirements.txt
│   └── requirements-dev.txt
├── frontend/           # React + Vite + TypeScript interface
│   ├── src/            # App components, typed API client, styling
│   └── package.json
├── docs/               # System documentation & architectural reports
│   ├── ARCHITECTURE.md
│   ├── MODEL_SELECTION.md
│   ├── API_CONTRACT.md
│   └── PART1_COMPLETION_REPORT.md
├── tests/              # Pytest automated test suite
├── .github/workflows/  # CI pipeline configuration
└── LICENSE             # MIT License
```

For comprehensive architectural design, see [ARCHITECTURE.md](docs/ARCHITECTURE.md).  
For the API specifications and schemas, see [API_CONTRACT.md](docs/API_CONTRACT.md).  
For model memory benchmarks and licensing, see [MODEL_SELECTION.md](docs/MODEL_SELECTION.md).

---

## ⚡ Quickstart & Setup (Windows)

### Prerequisites
- **Git** 2.40+
- **Python** 3.12 or 3.13
- **Node.js** 20+ or 22+ & **npm** 10+

### 1. Clone the Repository
```powershell
git clone https://github.com/suryacharan945/ghostterminal-ai.git
cd ghostterminal-ai
```

### 2. Backend Setup
```powershell
# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r backend/requirements-dev.txt

# Run test suite
pytest -v tests/

# Start development backend
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API is accessible at `http://127.0.0.1:8000`.  
Interactive documentation is available at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup (New Terminal)
```powershell
cd frontend
npm install
npm run typecheck
npm run build
npm run dev
```
Open `http://localhost:5173` in your browser. The landing page automatically probes `http://127.0.0.1:8000/api/health` and displays the live operational status.

---

## 🛡 Security & Privacy Principles

1. **Zero Cloud API Leakage**: No prompts, tokens, or terminal sessions are transmitted to proprietary cloud LLM providers.
2. **Safe Terminal Sandbox**: GhostTerminal AI does not execute arbitrary shell commands or expose the host filesystem.
3. **No Phantom Weights in VCS**: Model weights and caches are explicitly excluded by `.gitignore` to preserve repository hygiene.
4. **Permissive Licensing**: Core codebase is licensed under [MIT](LICENSE), and the target model is licensed under [Apache 2.0](docs/MODEL_SELECTION.md).

---

## 📜 License & Acknowledgments

- **Code License**: MIT License © 2026 Surya Charan. See [LICENSE](LICENSE) for details.
- **Target Model**: Qwen2.5-0.5B-Instruct by Alibaba Cloud (Apache 2.0).
- **Challenge**: Hacktoberfest 2026 DEV Challenge — Week 4: "Ghost in the Machine".
