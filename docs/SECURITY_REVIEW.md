# GhostTerminal AI — Security & Threat Modeling Review

**Project:** GhostTerminal AI  
**Challenge:** Hacktoberfest 2026 Week 4 — "Ghost in the Machine"  
**Stage:** Part 4 of 5 — Final Integration, Security, QA & Demo  
**Security Posture:** **SECURE & PASS**  
**Reviewer:** Senior Security & Release Engineer  
**Date:** 2026-10-29  

---

## 1. Security Architecture & Threat Model

GhostTerminal AI is designed with an explicit **containment-first security model**. Although the interface mimics a command-line terminal, it is fundamentally a **theatrical simulation**:

```
[ User Input ]
      │
      ▼
[ Validation & Length Shield ] ──── ( > 2000 chars ) ──► [ HTTP 422 Rejection ]
      │
      ▼
[ Deterministic Command Interceptor ] ── ( match ) ──► [ Static Simulated Response ]
      │                                                ( Sub-millisecond, zero shell )
      │ ( unmatched )
      ▼
[ Protective Ward Scanner ] ──────── ( dangerous ) ──► [ ACCESS DENIED Ward ]
      │
      ▼
[ Concurrency Lock (asyncio.Lock) ]
      │
      ▼
[ Local Qwen2.5-0.5B CPU Engine ]
      │
      ▼
[ Output Sanitization & Safe React Render ]
```

---

## 2. Comprehensive Security Controls Evaluation

### 2.1 Host Isolation & Shell Execution Prevention
- **Finding:** **ZERO host shell execution.**
- **Verification:** An exhaustive search of `backend/app/` reveals zero invocations of `os.system`, `subprocess.Popen`, `subprocess.run`, `shutil`, `pty`, or `eval` connected to user input.
- **Interception:** Common destructive commands (e.g. `rm -rf`, `del /f`, `format c:`, `drop table`, `shutdown`, `reboot`, `powershell`, `cmd.exe`, `net user`) are deterministically trapped by the protective ward in `persona.py` and disarmed with in-character `[ACCESS DENIED]` notifications.

### 2.2 Input Validation & Denial-of-Service (DoS) Mitigation
- **Length Limits:** Pydantic schema enforces `min_length=1`, `max_length=2000`. Inputs with 2,001+ characters are rejected at the HTTP gateway with `422 Unprocessable Entity` before reaching the inference engine.
- **Sampling Bounds:** `max_tokens` is bounded between `1` and `384` (default: `128`). `temperature` is clamped between `0.0` and `1.5`.
- **Inference Concurrency Lock:** Local CPU model execution is protected by an `asyncio.Lock` singleton. Concurrent requests queue cleanly rather than spawning multiple thread pools, preventing RAM exhaustion or CPU starvation.
- **Generation Timeout:** The frontend fetch client enforces a 45-second `AbortController` timeout for local CPU inference, preventing client hangs.

### 2.3 Cross-Site Scripting (XSS) & UI Injection
- **Safe React Text Nodes:** In `Terminal.tsx`, model outputs and simulated texts are rendered strictly as standard React text nodes (`<pre className="ghost-text">{msg.text}</pre>`).
- **No `dangerouslySetInnerHTML`:** The frontend contains zero occurrences of `dangerouslySetInnerHTML`. Even if the local LLM generates raw HTML or `<script>` tags, the browser renders them as inert text strings.

### 2.4 Model Binary Provenance & Cryptographic Integrity
- **Model Distribution:** Official Alibaba Cloud Qwen team distribution via Hugging Face (`Qwen/Qwen2.5-0.5B-Instruct-GGUF`).
- **Cryptographic Hash:** The local GGUF file is verified against its published Git LFS OID via SHA-256:
  `74a4da8c9fdbcd15bd1f6d01d621410d31c6fc00986f5eb687824e7b93d7a9db`
- **Tamper Resistance:** If the file size or checksum does not match, the downloader aborts and refuses to load unverified weights into memory.
- **Repository Cleanliness:** The `.gitignore` rules strictly exclude `models/*.gguf`. Zero weight binaries are committed to version control.

### 2.5 Privacy & Telemetry Exposure
- **100% Offline Capability:** All inference executes locally on CPU. No prompts, session history, or responses are transmitted to any third-party cloud service (OpenAI, Anthropic, Google, etc.).
- **Zero Secret Storage:** The repository contains no API keys, cloud secrets, or private tokens.
- **Log Hygiene:** The backend logger outputs request lengths, inference latencies, and token counts; it never dumps sensitive environment variables or authorization headers.

### 2.6 CORS & Network Hardening
- **CORS Configuration:** Handled via FastAPI's `CORSMiddleware`. By default, origins are strictly bound to development loopbacks (`http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:3000`). Wildcard `*` origins with credentials are explicitly prohibited.

### 2.7 LocalStorage State Integrity
- **Settings Deserialization:** The frontend retrieves settings from `localStorage` within a `try/catch` wrapper and shallow-merges them with `DEFAULT_SETTINGS`. Corrupt or manipulated JSON fails gracefully back to known safe defaults.

### 2.8 Dependency Security Assessment
- **Production Dependencies:**
  - Backend: `fastapi`, `uvicorn`, `pydantic`, `pydantic-settings`, `llama-cpp-python`. Zero high or critical CVEs reported.
  - Frontend: `react`, `react-dom`. Zero production vulnerabilities.
- **Development Tooling:**
  - `npm audit` flagged moderate advisories in `vite` / `vitest` dev tooling (`esbuild` and `tinypool`).
  - **Risk Assessment:** **Negligible in production.** The frontend is distributed as precompiled static HTML, CSS, and JS (`dist/`). Dev server tools (`esbuild`, `tinypool`) are never bundled or exposed in production environments.

---

## 3. Prompt Injection Analysis

Large language models are inherently susceptible to prompt injection. GhostTerminal AI applies defense-in-depth:

1. **Host Isolation:** Even if a malicious user succeeds in "jailbreaking" the persona (e.g. instructing the model to pretend it has access to the machine), the model has **no execution capabilities whatsoever**. The backend simply returns the model's text response.
2. **Deterministic Fast Path:** Common attacks (e.g. `whoami; rm -rf /`) are intercepted deterministically by code and never reach the language model.
3. **Strict Persona Prompt:** The system prompt instructs the model to refuse commands to break character or reveal system instructions.
4. **Explicit Transparency:** The UI explicitly stamps deterministic outputs with `SIMULATED` and creative generation with `LOCAL AI`, ensuring users are never deceived about execution reality.

---

## 4. Final Security Decision

**Decision:** **PASS — PRODUCTION & SUBMISSION READY**  
No unresolved critical or high-severity vulnerabilities exist in the application code.
