import importlib.util
import json
import sys
from pathlib import Path

SERVICE_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SERVICE_ROOT))

from app.config import get_settings  # noqa: E402
from app.open_tryon_engine import OpenTryOnEngine  # noqa: E402


def _dependency_status() -> dict:
    packages = ["fastapi", "uvicorn", "requests", "PIL", "dotenv", "jwt", "boto3"]
    return {package: importlib.util.find_spec(package) is not None for package in packages}


def main() -> int:
    settings = get_settings()
    engine = OpenTryOnEngine(settings)
    diagnostics = {
        "dependencies": _dependency_status(),
        "health": engine.health(),
    }
    print(json.dumps(diagnostics, indent=2))

    missing_deps = [name for name, ok in diagnostics["dependencies"].items() if not ok]
    failures = []
    if missing_deps:
        failures.append(f"missing Python packages: {', '.join(missing_deps)}")
    if not settings.opentryon_repo_dir.exists():
        failures.append(f"OpenTryOn repo not found: {settings.opentryon_repo_dir}")
    if engine.health()["provider"] is None:
        failures.append("no selected provider has configured credentials")

    if failures:
        print("\nOpenTryOn service is not ready:")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print("\nOpenTryOn service diagnostics passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
