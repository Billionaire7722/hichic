import json
import sys
from pathlib import Path

SERVICE_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SERVICE_ROOT))

from app.config import get_settings  # noqa: E402
from app.diagnostics import build_diagnostics  # noqa: E402


def main() -> int:
    diagnostics = build_diagnostics(get_settings())
    print(json.dumps(diagnostics, indent=2))

    failures = []
    if not diagnostics["dependencies"]["ok"]:
        failures.append("dependency mismatch or missing package")
    if not diagnostics["cuda"]["ok"]:
        failures.append("CUDA unavailable")
    if not diagnostics["checkpoints"]["ok"]:
        failures.append("missing or placeholder checkpoint")
    if diagnostics["model"]["ok"] is False:
        failures.append("local model path is incomplete")
    if not diagnostics["detectron2"]["ok"]:
        failures.append("Detectron2 runtime mismatch")

    if failures:
        print("\nIDM-VTON service is not ready:")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print("\nIDM-VTON service diagnostics passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
