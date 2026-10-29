# GhostTerminal AI — UI Design System & Component Architecture

**Hacktoberfest 2026 Week 4 — Ghost in the Machine**  
**Component:** Frontend Terminal Interface (Part 3 of 5)  
**Status:** Completed & Verified

---

## 1. Design Vision & Theatrical Atmosphere

GhostTerminal AI bridges retro command-line computing with a haunting supernatural aesthetic. The interface evokes a séance conducted through a cathode-ray tube (CRT) monitor awakened from cold silicon.

The design embodies the **"Ghost in the Machine"** theme by pairing vintage computing elements (scanlines, phosphor persistence, monospace typography) with ethereal accents (spectral cyan, violet chromatic aberration, pulsing telemetry).

---

## 2. Color Palette & Design Tokens

All colors are exposed through CSS custom variables in `frontend/src/index.css` and `frontend/src/App.css` for runtime adaptability and theme consistency.

| Token Name | Hex Code | Visual Role | Contrast vs. Background |
|---|---|---|---|
| `--bg-base` | `#080c12` | Deepest void backdrop | Baseline |
| `--bg-surface` | `#0f1722` | Terminal chassis & frame | 1.3:1 |
| `--bg-surface-elevated` | `#16202e` | Modals & dropdown cards | 1.8:1 |
| `--border-subtle` | `#1d2c3f` | Dividers & containment borders | 2.5:1 |
| `--accent-phosphor` | `#00ff66` | Primary terminal prompt & outputs | **13.8:1 (AAA)** |
| `--accent-phosphor-glow`| `rgba(0, 255, 102, 0.45)` | CRT text bloom & ambient radiance | Decorative |
| `--accent-spectral` | `#00e5ff` | Status highlights, AI badges & pills | **11.4:1 (AAA)** |
| `--accent-spectral-dim` | `#007a8a` | Subtle secondary metadata | 4.8:1 (AA) |
| `--accent-ghost` | `#a78bfa` | Atmospheric headers & spiritual glyphs| 7.2:1 (AAA) |
| `--accent-error` | `#ff5370` | Connection disruptions & failures | 5.9:1 (AA) |
| `--accent-warning` | `#ffd166` | Standby status & caution indicators | 12.1:1 (AAA) |
| `--text-primary` | `#d8f8e8` | Monospace message text | **12.9:1 (AAA)** |
| `--text-muted` | `#6b829d` | Secondary telemetry & timestamps | 4.9:1 (AA) |

---

## 3. Typography & Monospace Hierarchy

The terminal strictly adheres to monospace legibility while preserving character-cell alignment:

- **Primary Terminal Font:** `ui-monospace, 'Fira Code', 'JetBrains Mono', 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace`
- **Display Heading Font:** Monospace display pairing with letter-spacing tracking (`0.08em`) to mimic vintage computer ROM fonts.
- **Font Scale:**
  - App Title: `1.15rem` (`700` weight)
  - Subtitle: `0.78rem` (`400` weight, muted code blue)
  - Terminal Banner: Preformatted ASCII Art (`0.70rem` desktop, `0.45rem` mobile)
  - Message Text: `0.92rem` (`1.55` line-height for readability)
  - Badges & Telemetry: `0.72rem` (`600` uppercase weight)
  - Character Counter: `0.75rem` (`tabular-nums` for rock-steady alignment)

---

## 4. CRT Simulation & Visual Effects

The CRT atmosphere is constructed entirely with pure CSS and lightweight SVG filters:

1. **Scanline Grid:** A subtle repeating SVG gradient (`linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.35) 50%)`) overlaid across the screen with a `2px` repeat cycle.
2. **Radial Vignette:** Subtle edge falloff (`radial-gradient(circle at center, transparent 70%, rgba(0, 0, 0, 0.6) 100%)`) simulating curved glass monitor tubes.
3. **Phosphor Persistence Bloom:** Subtle `text-shadow: 0 0 4px var(--accent-phosphor-glow)` applied to active ghost communications.
4. **Flicker-Free Design:** Atmospheric effects remain static or utilize smooth opacity tweens rather than strobe animations, eliminating seizure hazards.
5. **Configurable Toggle:** Users can instantly disable CRT scanlines and phosphor bloom via the Terminal Configurations modal (`settings.crtEffects`).

---

## 5. Component Breakdown & Accessibility

### A. Header Bar (`Header.tsx`)
- Displays branding, Hacktoberfest challenge attribution, real-time backend/model status pill, reconnect trigger, settings toggle, and spectral manual modal trigger.
- Accessible focus indicators, `aria-label` tags, and live status announcements for assistive technologies.

### B. Suggested Incantations (`Suggestions.tsx`)
- Provides fast, clickable prompts divided into:
  - **Simulated Commands:** `$ whoami`, `$ help`, `$ history`, `$ git status`, `$ echo hello mortal`
  - **Creative AI Invocations:** `👻 Tell me a ghost story`, `👻 Write a haunted haiku`
- Disabled state during active generation prevents accidental race conditions.

### C. Terminal Display & History (`Terminal.tsx`)
- Retro ASCII art banner and welcome guide.
- Distinct message bubbles with visual sender separation:
  - `user`: Bright phosphor green prompt with `>` indicator.
  - `ghost`: Spectral cyan / ghost violet with metadata header tag.
  - `system`: Subdued slate notifications (e.g. buffer cleared).
  - `error`: Ghostly crimson with diagnostic breakdown.
- Telemetry chip bar:
  - Execution mode badge: `SIMULATED` (deterministic) vs. `LOCAL AI` (Qwen CPU engine).
  - Wall-clock inference latency (e.g. `⏱ 320.5 ms`).
  - Tokens generated count (e.g. `⚡ 42 tok`).
- Copy button with reactive `✓ Copied` feedback state.
- Thinking indicator: Pulsing spectral spinner and "Communing through the wires at 0xDEADBEEF..." status.

### D. Input Bar (`InputBar.tsx`)
- Terminal shell prompt prefix `ghost@terminal:~$`.
- Auto-expanding textarea supporting multiline composition (`Shift+Enter` for newlines).
- Command history ring buffer navigable via `↑` (previous) and `↓` (next) arrow keys.
- Real-time character counter showing usage against the 2,000 character limit.
- Clear buffer button with confirmation toast.

### E. Terminal Configurations Modal (`SettingsModal.tsx`)
- CRT scanline & phosphor glow toggle.
- Synthesized mechanical sound effects toggle.
- Typewriter playback speed selection: `Instant`, `Fast` (12ms/char), `Normal` (25ms/char).
- Reduced Motion accessibility toggle.
- Model generation sliders: Temperature (`0.10` to `1.20`) and Max Generation Length (`32` to `384` tokens).
- Settings persist across browser sessions in `localStorage`.

### F. Spectral Manual Modal (`HelpModal.tsx`)
- Comprehensive overview of the Hacktoberfest 2026 Week 4 Ghost in the Machine challenge.
- Full command reference table detailing simulated shell commands.
- Freeform creative query examples for the local Qwen LLM.
- Clear security disclosure stating no host operating system access occurs.

---

## 6. Sound Effects Architecture (`sound.ts`)

Zero-dependency retro sound synthesizer built on the standard Web Audio API:

- **Mechanical Keystroke:** Subtle randomized triangle wave burst (`800-1000 Hz`) with exponential ramp decay (`15ms`).
- **Spectral Chime:** Ethereal three-tone harmonic chord (`330 Hz`, `440 Hz`, `660 Hz`) with soft exponential release (`350ms`) upon completion of local AI generation.
- **Error Tone:** Subdued retro sawtooth buzz (`140 Hz`, `80ms`).
- **Sound Control:** Disabled by default to respect user audio preferences; easily toggled on in Settings.

---

## 7. Accessibility & Reduced Motion Support

- **WCAG 2.1 Compliance:** All primary text and interactive states exceed AA contrast standards (minimum 4.5:1), with primary phosphor green achieving **13.8:1**.
- **Motion Reduction:** Full `@media (prefers-reduced-motion: reduce)` media query support, plus an in-app software toggle that collapses all animations and typewriter timeouts to `0.001ms`.
- **Keyboard Navigation:** Full keyboard navigation throughout all modals, buttons, sliders, and the terminal input bar (`Tab`, `Shift+Tab`, `Escape`, `Enter`, `↑`, `↓`).
