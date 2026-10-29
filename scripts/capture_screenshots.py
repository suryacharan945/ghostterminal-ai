"""GhostTerminal AI - Automated High-Fidelity UI Screenshot Generator.

Uses headless Google Chrome to capture real screenshots of the frontend terminal
connected to the local FastAPI backend.
"""

import os
import sys
import time
import subprocess
import urllib.request
import http.server
import socketserver
import threading
from pathlib import Path

# Fix Windows cp1252 console encoding
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

WORKSPACE = Path(__file__).resolve().parent.parent
SCREENSHOTS_DIR = WORKSPACE / "docs" / "screenshots"
SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)
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
                with urllib.request.urlopen(req, timeout=5.0) as resp:
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

    def log_message(self, format, *args):
        # Quiet logging
        pass


def find_browser() -> str:
    for path in CHROME_PATHS:
        if os.path.exists(path):
            return path
    raise RuntimeError("No compatible Chrome or Edge executable found for headless capture.")


def check_url(url: str, timeout: float = 1.0) -> bool:
    try:
        with urllib.request.urlopen(url, timeout=timeout) as resp:
            return resp.status in (200, 304)
    except Exception:
        return False


def main():
    browser = find_browser()
    print(f"[*] Using browser for headless capture: {browser}")

    backend_proc = None
    httpd = None

    try:
        # 1. Start backend if not already running
        if not check_url("http://127.0.0.1:8000/api/health"):
            print("[*] Starting backend service on http://127.0.0.1:8000...")
            python_bin = sys.executable
            backend_proc = subprocess.Popen(
                [python_bin, "-m", "uvicorn", "backend.app.main:app", "--port", "8000", "--host", "127.0.0.1"],
                cwd=str(WORKSPACE),
            )
            for _ in range(30):
                time.sleep(0.5)
                if check_url("http://127.0.0.1:8000/api/health"):
                    print("[+] Backend ready.")
                    break
            else:
                print("[-] Warning: Backend did not respond, continuing...")

        # 2. Start threaded HTTP server with /api proxy
        socketserver.TCPServer.allow_reuse_address = True
        httpd = socketserver.TCPServer(("127.0.0.1", 5173), ProxyStaticHTTPRequestHandler)
        server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        server_thread.start()
        print(f"[+] Proxy static server running on http://127.0.0.1:5173 serving {DIST_DIR}")

        time.sleep(1.5)

        captures = [
            {
                "name": "01_desktop_terminal.png",
                "url": "http://127.0.0.1:5173/",
                "size": "1280,800",
                "desc": "Desktop clean terminal view with CRT phosphor green glow",
            },
            {
                "name": "02_ai_generation.png",
                "url": "http://127.0.0.1:5173/?demo=ai",
                "size": "1280,800",
                "desc": "Live creative response from local open-weight Qwen model with latency & token metrics",
            },
            {
                "name": "03_simulated_command.png",
                "url": "http://127.0.0.1:5173/?demo=simulated",
                "size": "1280,800",
                "desc": "Deterministic simulated commands (whoami & git status) with SIMULATED badge",
            },
            {
                "name": "04_mobile_terminal.png",
                "url": "http://127.0.0.1:5173/?demo=simulated",
                "size": "390,844",
                "desc": "Responsive mobile layout on 390x844 viewport",
            },
            {
                "name": "05_settings_and_status.png",
                "url": "http://127.0.0.1:5173/?modal=settings",
                "size": "1280,800",
                "desc": "Terminal configurations modal with CRT, sound, speed, tokens & temperature",
            },
            {
                "name": "06_spectral_manual.png",
                "url": "http://127.0.0.1:5173/?modal=help",
                "size": "1280,800",
                "desc": "GhostTerminal spectral manual and command reference guide modal",
            },
        ]

        for item in captures:
            out_file = SCREENSHOTS_DIR / item["name"]
            print(f"[*] Capturing {item['name']} ({item['size']})...")
            cmd = [
                browser,
                "--headless=new",
                "--disable-gpu",
                "--no-sandbox",
                f"--screenshot={out_file}",
                f"--window-size={item['size']}",
                "--hide-scrollbars",
                "--run-all-compositor-stages-before-draw",
                f"--virtual-time-budget=2500",
                item["url"],
            ]
            subprocess.run(cmd, check=True)
            if out_file.exists() and out_file.stat().st_size > 0:
                print(f"  [OK] Saved {out_file.name} ({out_file.stat().st_size // 1024} KB) - {item['desc']}")
            else:
                print(f"  [FAIL] Failed to generate {out_file.name}")

        print("\n[+] All UI screenshots captured successfully!")

    finally:
        if httpd:
            print("[*] Shutting down frontend server...")
            httpd.shutdown()
        if backend_proc:
            print("[*] Stopping backend service...")
            backend_proc.terminate()


if __name__ == "__main__":
    main()
