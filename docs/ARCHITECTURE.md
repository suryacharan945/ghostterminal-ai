# GhostTerminal AI - Architecture Specification

## 1. Project Overview & Context

**GhostTerminal AI** is an original Halloween-themed AI terminal developed for **Hacktoberfest 2026 Week 4: "Ghost in the Machine"**. 
The project embodies the spirit of a haunted terminal possessed by a cryptic spirit living inside the machine. Instead of relying on closed third-party cloud APIs, GhostTerminal AI operates purely via **local open-weight AI inference** on standard consumer hardware (CPU-friendly).

### Development Stages
- **Part 1 (Current): Foundation Only** — Scaffolding, repository establishment, typed backend with health and placeholder contracts, lightweight React + Vite + TypeScript frontend, zero-mock AI compliance, CI validation, model research.
- **Part 2: Local AI Engine** — Integration of the chosen open-weight model (`Qwen/Qwen2.5-0.5B-Instruct`) running purely locally on CPU via GGUF / llama.cpp or ONNX.
- **Part 3: Spooky Terminal Experience** — CRT scanline effects, phosphor glow, typing teletype animations, eerie spectral persona prompts.
- **Part 4: Autonomous Terminal Commands** — Safe sandboxed pseudo-terminal command parsing and haunted system status inspections.
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
│   │   │   ├── health.py        # GET /api/health implementation
│   │   │   └── inference.py     # Placeholder POST /api/infer (HTTP 501 in Part 1)
│   │   ├── __init__.py
│   │   ├── config.py            # Typed settings via pydantic-settings
│   │   └── main.py              # FastAPI application, CORS, error handling
│   ├── requirements.txt         # Production dependencies pinned
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
│   ├── package.json             # Minimal dependencies (React 18, Vite 5, TS 5)
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts           # Development proxy configuration
├── docs/
│   ├── API_CONTRACT.md          # OpenAPI / schema definitions
│   ├── ARCHITECTURE.md          # System architecture and design
│   ├── MODEL_SELECTION.md       # Open-weight model research & evaluation
│   └── PART1_COMPLETION_REPORT.md # Verification report for Part 1
├── tests/
│   ├── __init__.py
│   ├── test_health.py           # Contract and CORS verification
│   └── test_inference.py        # 501 Not Implemented verification
├── .env.example                 # Example configuration template
├── .gitignore                   # Comprehensive secret/weight/node_modules exclusion
├── LICENSE                      # MIT Open Source License
├── pytest.ini                   # Pytest test discovery & event loop configuration
└── README.md                    # Setup guide, architecture, and project status
```

---

## 3. Backend Architecture

- **Framework**: FastAPI (Python 3.12+ / 3.13)
- **ASGI Server**: Uvicorn
- **Configuration Management**: Strongly typed configuration via `pydantic-settings.BaseSettings` reading environment variables with fallback defaults.
- **CORS Protection**: Explicitly restricted to configured development origins (`http://localhost:5173`, `http://127.0.0.1:5173`), preventing cross-site hijacking.
- **Error Handling**: Centralized exception handlers for `StarletteHTTPException`, `RequestValidationError`, and unexpected exceptions, standardizing JSON responses and avoiding internal stack trace exposure.
- **Zero Fake AI Policy**: The placeholder inference endpoint `/api/infer` strictly returns `501 Not Implemented`. No mocked or hardcoded simulated responses are provided until real model inference is established in Part 2.

---

## 4. Frontend Architecture

- **Stack**: React 18, TypeScript 5, Vite 5
- **Design Philosophy**: Minimalist terminal aesthetic in Part 1. Focuses strictly on robust state handling:
  - `loading`: Displays probing status with clear visual feedback.
  - `connected`: Displays operational backend metadata, version, and model target.
  - `unavailable`: Graceful fallback if backend is offline or unreachable.
  - `error`: Diagnostic details on network or schema failures.
- **Networking**: Native `fetch` with `AbortController` timeout (5000ms) to prevent UI hanging.

---

## 5. Security & Isolation Model

1. **No Arbitrary Command Execution**: GhostTerminal AI parses inputs purely as conversational queries and sandboxed pseudo-commands. No `os.system`, `subprocess.Popen`, or `eval` is exposed to user input.
2. **Secret Hygiene**: Strict `.gitignore` rules prevent accidental commit of `.env`, tokens, private keys, or credentials.
3. **Model Weight Segregation**: No large binaries or model weights are committed to Git. Models will be loaded dynamically via cache directories in Part 2.
4. **No Third-Party Paid API Dependencies**: The system relies exclusively on local, open-weight models, ensuring zero subscription costs, high privacy, and complete offline capability.
