import argparse
import shutil
import sys
from pathlib import Path

SERVICE_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SERVICE_ROOT))

from app.config import get_settings  # noqa: E402
from app.diagnostics import EXPECTED_MODEL_FILES, EXPECTED_PREPROCESSING_CHECKPOINTS  # noqa: E402


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Download IDM-VTON model and preprocessing weights.")
    parser.add_argument(
        "--model-dir",
        type=Path,
        default=SERVICE_ROOT.parent / "IDM-VTON" / "models" / "yisol-IDM-VTON",
        help="Local directory for the main yisol/IDM-VTON Diffusers model snapshot.",
    )
    parser.add_argument(
        "--skip-main-model",
        action="store_true",
        help="Only download preprocessing checkpoints into IDM-VTON/ckpt.",
    )
    return parser.parse_args()


def main() -> int:
    try:
        from huggingface_hub import hf_hub_download, snapshot_download
    except ImportError:
        print("Install service dependencies first: pip install -r idm-vton-service/requirements.txt")
        return 1

    args = parse_args()
    settings = get_settings()
    repo_id = "yisol/IDM-VTON"

    print("Downloading preprocessing checkpoints...")
    for name, info in EXPECTED_PREPROCESSING_CHECKPOINTS.items():
        target = settings.idm_vton_repo_dir / info["target"]
        target.parent.mkdir(parents=True, exist_ok=True)
        downloaded = hf_hub_download(repo_id=repo_id, filename=str(info["repo_path"]))
        shutil.copyfile(downloaded, target)
        actual_size = target.stat().st_size
        print(f"- {name}: {target} ({actual_size} bytes)")

    if args.skip_main_model:
        print("Skipped main model snapshot. The service will use IDM_VTON_MODEL_ID from config.")
        return 0

    print(f"Downloading main model snapshot into {args.model_dir}...")
    args.model_dir.mkdir(parents=True, exist_ok=True)
    snapshot_download(
        repo_id=repo_id,
        local_dir=args.model_dir,
        local_dir_use_symlinks=False,
        allow_patterns=sorted(EXPECTED_MODEL_FILES.keys()),
    )
    print("\nSet this in idm-vton-service/.env for fully local model loading:")
    print(f"IDM_VTON_MODEL_ID={args.model_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
