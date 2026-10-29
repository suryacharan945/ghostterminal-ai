# GhostTerminal AI — Demo Asset Manifest

**Project:** GhostTerminal AI  
**Repository:** https://github.com/suryacharan945/ghostterminal-ai  
**Challenge:** Hacktoberfest 2026 Week 4 — "Ghost in the Machine"  
**Branch:** `main`  
**Latest Release Commit:** `aca8062`  

---

## 1. Public Media & Screenshot Assets

All visual assets are stored in the public repository and can be embedded directly into markdown documents and the DEV submission post using raw GitHub URLs.

| Asset File | Public Raw GitHub URL | Viewport | Size | Description |
|---|---|---|---|---|
| `01_desktop_terminal.png` | `https://raw.githubusercontent.com/suryacharan945/ghostterminal-ai/main/docs/screenshots/01_desktop_terminal.png` | 1280×800 | 355 KB | Full desktop terminal chassis, CRT scanlines, welcome banner, and real-time model status indicator |
| `02_ai_generation.png` | `https://raw.githubusercontent.com/suryacharan945/ghostterminal-ai/main/docs/screenshots/02_ai_generation.png` | 1280×800 | 464 KB | Live creative response from local open-weight Qwen2.5-0.5B model with `LOCAL AI` badge and latency/token telemetry |
| `03_simulated_command.png` | `https://raw.githubusercontent.com/suryacharan945/ghostterminal-ai/main/docs/screenshots/03_simulated_command.png` | 1280×800 | 428 KB | Deterministic simulated commands (`whoami` & `git status`) demonstrating sub-millisecond execution with `SIMULATED` badge |
| `04_mobile_terminal.png` | `https://raw.githubusercontent.com/suryacharan945/ghostterminal-ai/main/docs/screenshots/04_mobile_terminal.png` | 390×844 | 171 KB | Responsive mobile layout on iPhone viewport showing touch navigation and stacked actions |
| `05_settings_and_status.png`| `https://raw.githubusercontent.com/suryacharan945/ghostterminal-ai/main/docs/screenshots/05_settings_and_status.png` | 1280×800 | 105 KB | Terminal Configurations modal showing CRT effects, Web Audio toggle, typewriter speed, and generation sliders |
| `06_spectral_manual.png` | `https://raw.githubusercontent.com/suryacharan945/ghostterminal-ai/main/docs/screenshots/06_spectral_manual.png` | 1280×800 | 130 KB | GhostTerminal Spectral Manual modal detailing simulated command reference table and open-weight architecture |
| `demo_journey_mobile.png` | `https://raw.githubusercontent.com/suryacharan945/ghostterminal-ai/main/docs/demo/demo_journey_mobile.png` | 390×844 | 202 KB | Mobile terminal view with active creative AI response and character budget counter |
| `demo_journey_settings.png`| `https://raw.githubusercontent.com/suryacharan945/ghostterminal-ai/main/docs/demo/demo_journey_settings.png` | 1280×800 | 105 KB | Settings configuration view with adjusted temperature and token budget parameters |
| `demo_journey_manual.png` | `https://raw.githubusercontent.com/suryacharan945/ghostterminal-ai/main/docs/demo/demo_journey_manual.png` | 1280×800 | 130 KB | Spectral manual view showcasing simulated command reference table |

---

## 2. Machine-Readable Telemetry Evidence

- **File:** `docs/demo/e2e_journey_evidence.json`
- **Public URL:** `https://raw.githubusercontent.com/suryacharan945/ghostterminal-ai/main/docs/demo/e2e_journey_evidence.json`
- **Contents:** Verified JSON payloads, wall-clock latencies, and token generation metrics for all 12 end-to-end user journeys executed against the live local CPU inference engine.

---

## 3. Demonstration Script & Visual Walkthrough

- **File:** `docs/DEMO_SCRIPT.md`
- **Structure:** 6 distinct acts across 120 seconds:
  1. *Act I (00:00–00:18)*: The Séance Chamber — Interface introduction & theme alignment.
  2. *Act II (00:18–00:40)*: The Phantom Console — Vintage CRT scanlines & Web Audio mechanical keystrokes.
  3. *Act III (00:40–01:02)*: Deterministic Incantations — `whoami`, `git status`, and zero host shell execution proof.
  4. *Act IV (01:02–01:34)*: The Ghost Speaks — Real open-weight CPU inference via `Qwen2.5-0.5B-Instruct`.
  5. *Act V (01:34–01:48)*: Séance Configurations — Parameters, audio, reduced motion, and mobile layout.
  6. *Act VI (01:48–02:00)*: Open-Weight Integrity — Apache 2.0 open-weight sovereignty and conclusion.
