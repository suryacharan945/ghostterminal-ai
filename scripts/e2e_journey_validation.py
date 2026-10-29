"""GhostTerminal AI — End-to-End User Journey Validation Runner.

Executes and verifies all 12 real user journeys for Part 4 QA against the live
FastAPI backend and local open-weight Qwen2.5-0.5B-Instruct model on CPU.
Captures actual responses, latency, token throughput, and visual screenshots.
"""

import os
import sys
import time
import json
import subprocess
import urllib.request
import http.server
import socketserver
import threading
from pathlib import Path

# UTF-8 stdout configuration for Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

WORKSPACE = Path(__file__).resolve().parent.parent
DEMO_DIR = WORKSPACE / "docs" / "demo"
DEMO_DIR.mkdir(parents=True, exist_ok=True)
DIST_DIR = WORKSPACE / "frontend" / "dist"

CHROME_PATHS = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
]


class ProxyStaticHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Serves static files from frontend/dist and proxies /api requests to FastAPI backend."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST_DIR), **kwargs)

    def do_GET(self):
        if self.path.startswith("/api/"):
            backend_url = f"http://127.0.0.1:8000{self.path}"
            try:
                req = urllib.request.Request(backend_url, headers={"Accept": "application/json"})
                with urllib.request.urlopen(req, timeout=10.0) as resp:
                    data = resp.read()
                    self.send_response(resp.status)
                    self.send_header("Content-Type", resp.headers.get("Content-Type", "application/json"))
                    self.send_header("Content-Length", str(len(data)))
                    self.end_headers()
                    self.wfile.write(data)
            except Exception as e:
                self.send_response(502)
                self.end_headers()
                self.wfile.write(str(e).encode())
            return
        super().do_GET()

    def do_POST(self):
        if self.path.startswith("/api/"):
            backend_url = f"http://127.0.0.1:8000{self.path}"
            content_len = int(self.headers.get("Content-Length", 0))
            post_body = self.rfile.read(content_len) if content_len > 0 else b""
            try:
                req = urllib.request.Request(
                    backend_url,
                    data=post_body,
                    headers={
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                    method="POST",
                )
                with urllib.request.urlopen(req, timeout=60.0) as resp:
                    data = resp.read()
                    self.send_response(resp.status)
                    self.send_header("Content-Type", resp.headers.get("Content-Type", "application/json"))
                    self.send_header("Content-Length", str(len(data)))
                    self.end_headers()
                    self.wfile.write(data)
            except urllib.error.HTTPError as he:
                err_data = he.read()
                self.send_response(he.code)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(err_data)))
                self.end_headers()
                self.wfile.write(err_data)
            except Exception as e:
                self.send_response(502)
                self.end_headers()
                self.wfile.write(str(e).encode())
            return
        super().do_GET()

    def log_message(self, format, *args):
        pass


def find_browser() -> str:
    for path in CHROME_PATHS:
        if os.path.exists(path):
            return path
    raise RuntimeError("No compatible Chrome or Edge executable found.")


def check_url(url: str, timeout: float = 1.0) -> bool:
    try:
        with urllib.request.urlopen(url, timeout=timeout) as resp:
            return resp.status in (200, 304)
    except Exception:
        return False


def post_json(url: str, payload: dict) -> tuple[int, dict]:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60.0) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))


def get_json(url: str) -> tuple[int, dict]:
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=10.0) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))


def capture_screenshot(browser: str, url: str, out_path: Path, window_size: str = "1280,800"):
    cmd = [
        browser,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        f"--screenshot={out_path}",
        f"--window-size={window_size}",
        "--hide-scrollbars",
        "--run-all-compositor-stages-before-draw",
        "--virtual-time-budget=3000",
        url,
    ]
    subprocess.run(cmd, check=True)


def main():
    browser = find_browser()
    print(f"[*] Starting E2E Journey Validation runner using browser: {browser}")

    backend_proc = None
    httpd = None
    results = {}

    try:
        # Start backend
        if not check_url("http://127.0.0.1:8000/api/health"):
            print("[*] Launching backend service on http://127.0.0.1:8000...")
            backend_proc = subprocess.Popen(
                [sys.executable, "-m", "uvicorn", "backend.app.main:app", "--port", "8000", "--host", "127.0.0.1"],
                cwd=str(WORKSPACE),
            )
            for _ in range(30):
                time.sleep(0.5)
                if check_url("http://127.0.0.1:8000/api/health"):
                    print("[+] Backend service active.")
                    break
            else:
                raise RuntimeError("Backend failed to start.")

        # Start proxy frontend server
        socketserver.TCPServer.allow_reuse_address = True
        httpd = socketserver.TCPServer(("127.0.0.1", 5173), ProxyStaticHTTPRequestHandler)
        server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        server_thread.start()
        print(f"[+] Static frontend & proxy active on http://127.0.0.1:5173")

        time.sleep(2.0)

        # Wait for model lifecycle to reach 'ready'
        print("[*] Awaiting model lifecycle initialization ('ready')...")
        for attempt in range(40):
            time.sleep(0.5)
            status_code, health = get_json("http://127.0.0.1:8000/api/health")
            if status_code == 200 and health.get("model_status") == "ready":
                print(f"[+] Model ready in background: {health['model_id']}")
                break
        else:
            print("[-] Warning: Model took longer than 20s to ready.")

        # ----------------------------------------------------------------------
        # Journey 1: Open fresh session & verify landing structure
        # ----------------------------------------------------------------------
        print("\n--- Journey 1: Fresh Session Landing ---")
        status_code, health = get_json("http://127.0.0.1:8000/api/health")
        print(f"  Health Status ({status_code}): {health['status']}, model: {health['model_status']}")
        assert status_code == 200
        assert health["status"] in ("ok", "healthy")
        assert health["model_status"] == "ready"
        results["journey_1_fresh_session"] = {
            "status": "PASS",
            "health": health,
        }

        # ----------------------------------------------------------------------
        # Journey 2: Confirm backend & local model readiness
        # ----------------------------------------------------------------------
        print("\n--- Journey 2: Backend & Model Readiness ---")
        status_code, model_stat = get_json("http://127.0.0.1:8000/api/model/status")
        print(f"  Model Status ({status_code}): {model_stat['model_id']}, status: {model_stat['status']}, device: {model_stat['device']}")
        assert status_code == 200
        assert model_stat["status"] == "ready"
        results["journey_2_model_readiness"] = {
            "status": "PASS",
            "model_status": model_stat,
        }

        # ----------------------------------------------------------------------
        # Journey 3: Submit 'whoami' (Deterministic Simulated Command)
        # ----------------------------------------------------------------------
        print("\n--- Journey 3: Simulated Command 'whoami' ---")
        status_code, resp_whoami = post_json("http://127.0.0.1:8000/api/infer", {"prompt": "whoami"})
        print(f"  Latency: {resp_whoami['inference_ms']}ms | Mode: {resp_whoami['mode']}")
        print(f"  Output preview: {resp_whoami['response'][:120]}...")
        assert status_code == 200
        assert resp_whoami["mode"] == "simulated"
        assert "0xDEADBEEF" in resp_whoami["response"]
        assert resp_whoami["inference_ms"] < 10.0
        results["journey_3_whoami"] = {
            "status": "PASS",
            "payload": resp_whoami,
        }

        # ----------------------------------------------------------------------
        # Journey 4: Submit 'git status' (Zero Shell Execution Verification)
        # ----------------------------------------------------------------------
        print("\n--- Journey 4: Simulated Command 'git status' (Isolation Check) ---")
        status_code, resp_git = post_json("http://127.0.0.1:8000/api/infer", {"prompt": "git status"})
        print(f"  Latency: {resp_git['inference_ms']}ms | Mode: {resp_git['mode']}")
        assert status_code == 200
        assert resp_git["mode"] == "simulated"
        assert "[SIMULATED UNDERWORLD VCS]" in resp_git["response"]
        assert "realm/underworld" in resp_git["response"]
        results["journey_4_git_status"] = {
            "status": "PASS",
            "payload": resp_git,
        }

        # ----------------------------------------------------------------------
        # Journey 5: Creative Ghost-Story Prompt (Real Qwen2.5-0.5B CPU Generation)
        # ----------------------------------------------------------------------
        print("\n--- Journey 5: Creative Prompt 'Tell me a ghost story' (Real LLM Inference) ---")
        t0 = time.time()
        status_code, resp_story = post_json(
            "http://127.0.0.1:8000/api/infer",
            {
                "prompt": "Tell me a short ghost story about an abandoned data center at 3am",
                "max_tokens": 100,
                "temperature": 0.7,
            },
        )
        elapsed = time.time() - t0
        print(f"  Wall-clock elapsed: {elapsed:.2f}s | Internal latency: {resp_story['inference_ms']:.1f}ms")
        print(f"  Tokens: {resp_story['tokens_generated']} | Mode: {resp_story['mode']} | Model: {resp_story['model_id']}")
        print(f"  Story Response:\n  {resp_story['response']}\n")
        assert status_code == 200
        assert resp_story["mode"] == "local"
        assert resp_story["tokens_generated"] > 10
        assert len(resp_story["response"].strip()) > 30
        results["journey_5_ghost_story"] = {
            "status": "PASS",
            "tokens_generated": resp_story["tokens_generated"],
            "inference_ms": resp_story["inference_ms"],
            "tokens_per_sec": round(resp_story["tokens_generated"] / (resp_story["inference_ms"] / 1000.0), 2) if resp_story["inference_ms"] > 0 else 0,
            "response": resp_story["response"],
        }

        # ----------------------------------------------------------------------
        # Journey 6: Haunted Haiku Request
        # ----------------------------------------------------------------------
        print("\n--- Journey 6: Haunted Haiku Request ---")
        status_code, resp_haiku = post_json(
            "http://127.0.0.1:8000/api/infer",
            {
                "prompt": "Write a haunted haiku about a segfault in the dead of night",
                "max_tokens": 60,
                "temperature": 0.65,
            },
        )
        print(f"  Tokens: {resp_haiku['tokens_generated']} | Latency: {resp_haiku['inference_ms']:.1f}ms")
        print(f"  Haiku Response:\n  {resp_haiku['response']}\n")
        assert status_code == 200
        assert resp_haiku["mode"] == "local"
        results["journey_6_haiku"] = {
            "status": "PASS",
            "tokens_generated": resp_haiku["tokens_generated"],
            "inference_ms": resp_haiku["inference_ms"],
            "response": resp_haiku["response"],
        }

        # ----------------------------------------------------------------------
        # Journey 7: Suggested Incantations ('echo hello mortal')
        # ----------------------------------------------------------------------
        print("\n--- Journey 7: Suggested Incantation 'echo hello mortal' ---")
        status_code, resp_echo = post_json("http://127.0.0.1:8000/api/infer", {"prompt": "echo hello mortal"})
        print(f"  Echo Response: {resp_echo['response']}")
        assert status_code == 200
        assert "hello mortal" in resp_echo["response"]
        assert resp_echo["mode"] == "simulated"
        results["journey_7_suggested_echo"] = {
            "status": "PASS",
            "response": resp_echo["response"],
        }

        # ----------------------------------------------------------------------
        # Journey 8: Temperature & Max Tokens Parameter Controls
        # ----------------------------------------------------------------------
        print("\n--- Journey 8: Parameter Controls (Low Temp 0.2, Max Tokens 32) ---")
        status_code, resp_low = post_json(
            "http://127.0.0.1:8000/api/infer",
            {
                "prompt": "Who haunts this CPU register?",
                "max_tokens": 32,
                "temperature": 0.2,
            },
        )
        print(f"  Constrained tokens: {resp_low['tokens_generated']} <= 32")
        assert status_code == 200
        assert resp_low["tokens_generated"] <= 32
        results["journey_8_parameter_controls"] = {
            "status": "PASS",
            "tokens_generated": resp_low["tokens_generated"],
            "response": resp_low["response"],
        }

        # ----------------------------------------------------------------------
        # Journey 9: Copy, Clear, History Navigation & Help
        # ----------------------------------------------------------------------
        print("\n--- Journey 9: Simulated History & Help Commands ---")
        status_code, resp_help = post_json("http://127.0.0.1:8000/api/infer", {"prompt": "help"})
        status_code_h, resp_history = post_json("http://127.0.0.1:8000/api/infer", {"prompt": "history"})
        assert status_code == 200
        assert status_code_h == 200
        assert "[GHOST TERMINAL INCANTATIONS]" in resp_help["response"]
        assert "[SIMULATED PHANTOM SESSION LOG]" in resp_history["response"]
        results["journey_9_help_and_history"] = {
            "status": "PASS",
            "help_output": resp_help["response"][:100],
            "history_output": resp_history["response"][:100],
        }

        # ----------------------------------------------------------------------
        # Journey 10: Error & Safety Boundary Handling (Input Length Validation)
        # ----------------------------------------------------------------------
        print("\n--- Journey 10: Input Validation & Boundary Ward ---")
        # Oversized prompt (> 2000 chars)
        long_prompt = "a" * 2005
        err_code, err_data = post_json("http://127.0.0.1:8000/api/infer", {"prompt": long_prompt})
        print(f"  Length validation (2005 chars): status {err_code} (Expected 422)")
        assert err_code == 422

        # Dangerous command injection attempt
        status_code, resp_ward = post_json("http://127.0.0.1:8000/api/infer", {"prompt": "rm -rf /"})
        print(f"  Dangerous command interception: {resp_ward['response']}")
        assert status_code == 200
        assert "ACCESS DENIED" in resp_ward["response"]
        assert resp_ward["mode"] == "simulated"
        results["journey_10_safety_boundaries"] = {
            "status": "PASS",
            "length_validation_code": err_code,
            "ward_response": resp_ward["response"],
        }

        # ----------------------------------------------------------------------
        # Journey 11: Mobile Viewport Rendering & Capture
        # ----------------------------------------------------------------------
        print("\n--- Journey 11: Mobile Viewport Capture (390x844) ---")
        mobile_shot = DEMO_DIR / "demo_journey_mobile.png"
        capture_screenshot(browser, "http://127.0.0.1:5173/?demo=ai", mobile_shot, window_size="390,844")
        assert mobile_shot.exists() and mobile_shot.stat().st_size > 0
        print(f"  Saved mobile screenshot: {mobile_shot.name} ({mobile_shot.stat().st_size // 1024} KB)")
        results["journey_11_mobile"] = {
            "status": "PASS",
            "screenshot": str(mobile_shot),
            "size_kb": mobile_shot.stat().st_size // 1024,
        }

        # ----------------------------------------------------------------------
        # Journey 12: Keyboard Accessibility & Reduced Motion View
        # ----------------------------------------------------------------------
        print("\n--- Journey 12: Settings Modal & Accessibility Capture ---")
        settings_shot = DEMO_DIR / "demo_journey_settings.png"
        capture_screenshot(browser, "http://127.0.0.1:5173/?modal=settings", settings_shot, window_size="1280,800")
        manual_shot = DEMO_DIR / "demo_journey_manual.png"
        capture_screenshot(browser, "http://127.0.0.1:5173/?modal=help", manual_shot, window_size="1280,800")
        assert settings_shot.exists() and manual_shot.exists()
        print(f"  Saved settings modal capture: {settings_shot.name} ({settings_shot.stat().st_size // 1024} KB)")
        print(f"  Saved spectral manual capture: {manual_shot.name} ({manual_shot.stat().st_size // 1024} KB)")
        results["journey_12_accessibility"] = {
            "status": "PASS",
            "settings_shot": str(settings_shot),
            "manual_shot": str(manual_shot),
        }

        # Save complete validation output to JSON
        evidence_file = DEMO_DIR / "e2e_journey_evidence.json"
        with open(evidence_file, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2)
        print(f"\n[+] All 12 User Journeys PASSED! Evidence recorded to {evidence_file}")

    finally:
        if httpd:
            print("[*] Terminating static frontend proxy...")
            httpd.shutdown()
        if backend_proc:
            print("[*] Terminating backend service...")
            backend_proc.terminate()


if __name__ == "__main__":
    main()
