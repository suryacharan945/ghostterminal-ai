# GhostTerminal AI — Video & Walkthrough Demo Script

**Project:** GhostTerminal AI  
**Challenge:** Hacktoberfest 2026 Week 4 — "Ghost in the Machine"  
**Format:** 120-Second Video / Guided Screenshot Walkthrough  
**Target Audience:** Hacktoberfest community, DEV reviewers, open-source engineers  
**Visual Assets Directory:** `docs/demo/` and `docs/screenshots/`  

---

## 1. Timing & Scene Overview (Total: 120 Seconds)

| Time Window | Scene Title | Visual Focus | Core Message |
|---|---|---|---|
| **00:00 – 00:18** | **Act I: The Séance Chamber** | Desktop Terminal View (`01_desktop_terminal.png`) | Introduce project, Hacktoberfest theme, and offline local AI architecture |
| **00:18 – 00:40** | **Act II: The Phantom Console** | Terminal Chassis, CRT scanlines, Topbar status | Showcase retro phosphor green styling, Web Audio mechanical clicks, and live status indicator |
| **00:40 – 01:02** | **Act III: Deterministic Incantations** | `whoami`, `git status`, `history` (`03_simulated_command.png`) | Sub-millisecond simulated commands; explicit proof of zero host shell execution |
| **01:02 – 01:34** | **Act IV: The Ghost Speaks** | Real local Qwen LLM generation (`02_ai_generation.png`) | Live CPU inference with `Qwen2.5-0.5B-Instruct`, wall-clock latency, and token metrics |
| **01:34 – 01:48** | **Act V: Séance Configurations** | Settings Modal & Mobile View (`05_settings...png`, `04_mobile...png`) | Adjusting temperature, token caps, CRT effects, typewriter cadence, and mobile responsiveness |
| **01:48 – 02:00** | **Act VI: Open-Weight Integrity** | Spectral Manual & Architecture (`06_spectral...png`) | 100% offline open-weight AI, Apache 2.0 license, zero cloud dependency, MIT repository |

---

## 2. Precise Frame-by-Frame Narration & Action Cue Script

### Act I: The Séance Chamber (00:00 – 00:18)
- **Visual Cue:** Screen opens on `http://localhost:5173`. Phosphor green scanlines flicker softly over the pitch-black chassis. The ASCII banner glows: `GHOSTTERMINAL AI — Ghost in the Machine`.
- **Top Bar Pill:** Pulsing radar dot shifts to bright green: `Local AI Ready | Qwen2.5-0.5B (CPU)`.
- **Narration (Voiceover / Captions):**
  > *"Welcome to GhostTerminal AI — our official submission for Hacktoberfest 2026 Week 4: Ghost in the Machine.*  
  > *This isn't a wrapper around a paid cloud API. GhostTerminal is an authentic, 100% offline haunted terminal powered by local open-weight AI running directly on your CPU."*

---

### Act II: The Phantom Console (00:18 – 00:40)
- **Visual Cue:** Cursor scrolls smoothly past the welcome banner. Click on sound effects toggle (or audio enabled). Keystrokes produce subtle mechanical typewriter clicks.
- **Action:** Click the suggested incantation chip `$ whoami`.
- **Narration:**
  > *"At memory address 0xDEADBEEF dwells an apparition awakened from cold silicon. The interface recreates vintage cathode-ray tube physics—scanlines, subtle phosphor persistence bloom, and synthesized mechanical key clicks—all built with lightweight, zero-dependency modern React and CSS."*

---

### Act III: Deterministic Incantations (00:40 – 01:02)
- **Visual Cue:** Terminal prints the `whoami` response in `< 1ms` with an amber `SIMULATED` badge:
  `You are a mortal user tapping keys into the dark. I am the Ghost in the Machine — dwelling at memory address 0xDEADBEEF...`
- **Action:** User types `git status` and presses Enter.
- **Terminal Output:** Displays the phantom underworld branch (`realm/underworld`, `untracked spectral artifacts: .ghosts/unsettled_bytes.hex`).
- **Narration:**
  > *"To ensure absolute safety, terminal commands are handled deterministically. Queries like `whoami`, `git status`, `help`, and `history` execute in less than one millisecond with zero host shell execution. Ethereal wards isolate your operating system, providing a completely safe, theatrical computing experience."*

---

### Act IV: The Ghost Speaks (01:02 – 01:34)
- **Visual Cue:** User clicks the suggestion chip: `👻 Tell me a ghost story`.
- **Action:** The prompt submits. The thinking indicator pulses: `Communing through the wires at 0xDEADBEEF...`
- **Output Arrival:** A harmonic spectral chime rings (`330-660 Hz`). The response streams in character-by-character via typewriter playback. A cyan `LOCAL AI` badge appears with real telemetry: `⏱ 1240.2 ms | ⚡ 78 tok`.
- **Text Preview:**
  > *"The night was cold and quiet, but not like this. The machine hummed softly as it waited for its next user on this eerie street known only as the Data Center..."*
- **Narration:**
  > *"When you ask freeform questions, the local Qwen2.5-0.5B open-weight model awakens. Running quantized on standard CPU hardware via `llama-cpp-python`, it generates atmospheric Halloween folklore and haunted haikus at over 12 tokens per second without sending a single byte to the cloud."*

---

### Act V: Séance Configurations & Mobile Adaptation (01:34 – 01:48)
- **Visual Cue:** Click `⚙ Settings` in top navigation. The Terminal Configurations modal opens smoothly.
- **Action:** Toggle CRT scanlines on/off. Move the temperature slider to `0.85` and max tokens to `256`. Show the mobile viewport screenshot (`demo_journey_mobile.png`).
- **Narration:**
  > *"Through the settings modal, users can configure generation creativity, token length caps, typewriter cadence, audio effects, and accessibility options like Reduced Motion. On smartphones, the layout collapses into a sleek, touch-optimized mobile console."*

---

### Act VI: Open-Weight Integrity & Conclusion (01:48 – 02:00)
- **Visual Cue:** Click `? Help` to reveal the GhostTerminal Spectral Manual, detailing all commands and the open-weight Apache 2.0 license. Fade to the repository URL and Hacktoberfest badge.
- **Narration:**
  > *"GhostTerminal AI demonstrates that genuine, responsive, creative AI doesn't require cloud monopolies or massive GPU clusters. It is fully open-source under the MIT license with open-weight model transparency. Thank you for visiting the machine!"*

---

## 3. Demo Walkthrough Verification Artifacts

All supporting screenshot artifacts for this demo are verified in the repository:
1. `docs/demo/demo_journey_settings.png` — Settings configuration panel
2. `docs/demo/demo_journey_manual.png` — Spectral manual and command guide
3. `docs/demo/demo_journey_mobile.png` — Mobile viewport layout (390×844)
4. `docs/screenshots/01_desktop_terminal.png` — Desktop terminal chassis
5. `docs/screenshots/02_ai_generation.png` — Live Qwen generative response with telemetry
6. `docs/screenshots/03_simulated_command.png` — Deterministic simulated output
7. `docs/demo/e2e_journey_evidence.json` — Machine-readable proof of all 12 journeys
