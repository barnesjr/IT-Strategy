import os
import sys
import socket
import webbrowser
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
import uvicorn


def get_base_dir() -> str:
    """Get the base directory (where the executable or script lives).
    Used for user data: data.json, exports/, backups."""
    if getattr(sys, "frozen", False):
        return os.path.dirname(sys.executable)
    return str(Path(__file__).parent.parent)


def get_resource_dir() -> str:
    """Get the resource directory (where bundled assets live).
    PyInstaller onefile extracts to sys._MEIPASS; in dev mode same as base dir."""
    if getattr(sys, "frozen", False):
        return sys._MEIPASS
    return str(Path(__file__).parent.parent)


BASE_DIR = get_base_dir()
RESOURCE_DIR = get_resource_dir()

app = FastAPI(title="IT Strategy Assessment Tool", version="1.0.0")


# --- API Routes (stubs) ---

@app.get("/api/assessment")
async def get_assessment():
    raise HTTPException(status_code=501, detail="Not implemented yet")


@app.put("/api/assessment")
async def save_assessment():
    raise HTTPException(status_code=501, detail="Not implemented yet")


@app.get("/api/framework")
async def get_framework():
    raise HTTPException(status_code=501, detail="Not implemented yet")


@app.post("/api/export/{export_type}")
async def export_deliverable(export_type: str):
    raise HTTPException(status_code=501, detail="Not implemented yet")


# --- Static File Serving ---

static_dir = Path(RESOURCE_DIR) / "backend" / "static"
if not static_dir.exists():
    static_dir = Path(RESOURCE_DIR) / "static"

if static_dir.exists() and (static_dir / "index.html").exists():
    assets_dir = static_dir / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = static_dir / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(static_dir / "index.html"))


def find_available_port(start: int = 8761, end: int = 8770) -> int:
    import subprocess
    import platform

    for port in range(start, end + 1):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue

    # All ports busy — show diagnostics
    print(f"\nError: All ports {start}-{end} are in use.")
    print("Processes using these ports:")
    for port in range(start, end + 1):
        try:
            if platform.system() == "Darwin":
                result = subprocess.run(
                    ["lsof", "-i", f":{port}", "-t"],
                    capture_output=True, text=True, timeout=5
                )
            else:
                result = subprocess.run(
                    ["netstat", "-tlnp"],
                    capture_output=True, text=True, timeout=5
                )
            if result.stdout.strip():
                print(f"  Port {port}: PID {result.stdout.strip()}")
        except Exception:
            pass
    print("\nClose other assessment-tool instances or free a port in this range.")
    raise RuntimeError(f"No available port in range {start}-{end}")


def main():
    try:
        port = find_available_port()
    except RuntimeError as e:
        print(f"ERROR: {e}")
        sys.exit(1)

    url = f"http://localhost:{port}"
    print(f"\n  IT Strategy Assessment Tool")
    print(f"  Running at: {url}")
    print(f"  Press Ctrl+C to stop\n")

    webbrowser.open(url)

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=port,
        log_level="warning",
    )


if __name__ == "__main__":
    main()
