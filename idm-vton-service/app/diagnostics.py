import importlib.metadata
import platform
import sys
from pathlib import Path

from .config import Settings


EXPECTED_PREPROCESSING_CHECKPOINTS = {
    "densepose": {
        "repo_path": "densepose/model_final_162be9.pkl",
        "target": "ckpt/densepose/model_final_162be9.pkl",
        "size": 255_757_821,
    },
    "parsing_atr": {
        "repo_path": "humanparsing/parsing_atr.onnx",
        "target": "ckpt/humanparsing/parsing_atr.onnx",
        "size": 266_859_305,
    },
    "parsing_lip": {
        "repo_path": "humanparsing/parsing_lip.onnx",
        "target": "ckpt/humanparsing/parsing_lip.onnx",
        "size": 266_863_411,
    },
    "openpose": {
        "repo_path": "openpose/ckpts/body_pose_model.pth",
        "target": "ckpt/openpose/ckpts/body_pose_model.pth",
        "size": 209_267_595,
    },
}

EXPECTED_MODEL_FILES = {
    "model_index.json": 750,
    "scheduler/scheduler_config.json": 504,
    "tokenizer/special_tokens_map.json": 472,
    "tokenizer/tokenizer_config.json": 737,
    "tokenizer/merges.txt": 524_619,
    "tokenizer/vocab.json": 1_059_962,
    "tokenizer_2/special_tokens_map.json": 460,
    "tokenizer_2/tokenizer_config.json": 725,
    "tokenizer_2/merges.txt": 524_619,
    "tokenizer_2/vocab.json": 1_059_962,
    "text_encoder/config.json": 746,
    "text_encoder/model.safetensors": 492_265_879,
    "text_encoder_2/config.json": 758,
    "text_encoder_2/model.safetensors": 2_778_702_976,
    "image_encoder/config.json": 560,
    "image_encoder/model.safetensors": 2_528_373_448,
    "vae/config.json": 659,
    "vae/diffusion_pytorch_model.safetensors": 334_643_268,
    "unet/config.json": 1_939,
    "unet/diffusion_pytorch_model.bin": 11_965_769_774,
    "unet_encoder/config.json": 1_642,
    "unet_encoder/diffusion_pytorch_model.safetensors": 10_270_077_736,
}

EXPECTED_PACKAGES = {
    "torch": "2.0.1",
    "torchvision": "0.15.2",
    "diffusers": "0.25.0",
    "transformers": "4.36.2",
    "accelerate": "0.25.0",
    "onnxruntime": "1.16.2",
    "opencv-python": None,
    "fastapi": None,
    "python-multipart": None,
    "pydantic-settings": None,
}


def build_diagnostics(settings: Settings) -> dict:
    return {
        "runtime": runtime_status(settings),
        "dependencies": dependency_status(),
        "cuda": cuda_status(),
        "checkpoints": preprocessing_checkpoint_status(settings),
        "model": model_status(settings),
        "detectron2": detectron2_status(settings),
    }


def runtime_status(settings: Settings) -> dict:
    return {
        "python": sys.version.split()[0],
        "platform": platform.platform(),
        "repoDir": str(settings.idm_vton_repo_dir),
        "checkpointDir": str(settings.checkpoint_dir),
        "modelSource": settings.idm_vton_model_id,
        "outputDir": str(settings.idm_vton_output_dir),
    }


def dependency_status() -> dict:
    packages = []
    missing = []
    mismatched = []
    for name, expected in EXPECTED_PACKAGES.items():
        try:
            version = importlib.metadata.version(name)
        except importlib.metadata.PackageNotFoundError:
            packages.append({"name": name, "installed": None, "expected": expected, "ok": False})
            missing.append(name)
            continue

        ok = expected is None or version == expected or version.startswith(f"{expected}+")
        packages.append({"name": name, "installed": version, "expected": expected, "ok": ok})
        if not ok:
            mismatched.append({"name": name, "installed": version, "expected": expected})

    return {"ok": not missing and not mismatched, "packages": packages, "missing": missing, "mismatched": mismatched}


def cuda_status() -> dict:
    try:
        import torch
    except Exception as exc:
        return {"ok": False, "available": False, "error": f"torch import failed: {exc}"}

    if not torch.cuda.is_available():
        return {
            "ok": False,
            "available": False,
            "torchCuda": getattr(torch.version, "cuda", None),
            "deviceCount": torch.cuda.device_count(),
        }

    return {
        "ok": True,
        "available": True,
        "torchCuda": getattr(torch.version, "cuda", None),
        "deviceCount": torch.cuda.device_count(),
        "deviceName": torch.cuda.get_device_name(0),
        "deviceCapability": torch.cuda.get_device_capability(0),
        "totalMemoryBytes": torch.cuda.get_device_properties(0).total_memory,
    }


def preprocessing_checkpoint_status(settings: Settings) -> dict:
    files = []
    missing = []
    for name, expected in EXPECTED_PREPROCESSING_CHECKPOINTS.items():
        path = settings.required_checkpoints[name]
        actual_size = path.stat().st_size if path.exists() else 0
        ok = path.exists() and actual_size >= int(expected["size"]) * 0.95
        item = {
            "name": name,
            "path": str(path),
            "downloadFrom": f"yisol/IDM-VTON:{expected['repo_path']}",
            "expectedSizeBytes": expected["size"],
            "actualSizeBytes": actual_size,
            "ok": ok,
        }
        files.append(item)
        if not ok:
            missing.append(item)

    return {"ok": not missing, "files": files, "missing": missing}


def model_status(settings: Settings) -> dict:
    source = Path(settings.idm_vton_model_id)
    if not source.exists():
        return {
            "ok": None,
            "source": settings.idm_vton_model_id,
            "mode": "huggingface_hub",
            "note": "Model files will be downloaded from Hugging Face cache by from_pretrained().",
        }

    files = []
    missing = []
    for relative, expected_size in EXPECTED_MODEL_FILES.items():
        path = source / relative
        actual_size = path.stat().st_size if path.exists() else 0
        ok = path.exists() and actual_size >= int(expected_size) * 0.95
        item = {
            "path": str(path),
            "relativePath": relative,
            "expectedSizeBytes": expected_size,
            "actualSizeBytes": actual_size,
            "ok": ok,
        }
        files.append(item)
        if not ok:
            missing.append(item)

    return {"ok": not missing, "source": str(source), "mode": "local_path", "files": files, "missing": missing}


def detectron2_status(settings: Settings) -> dict:
    detectron_dir = settings.idm_vton_repo_dir / "gradio_demo" / "detectron2"
    binaries = sorted(detectron_dir.glob("_C*.so")) + sorted(detectron_dir.glob("_C*.pyd"))
    expected_tag = f"cpython-{sys.version_info.major}{sys.version_info.minor}"
    binary_names = [path.name for path in binaries]
    matching = [name for name in binary_names if expected_tag in name]
    if platform.system().lower() == "windows":
        return {
            "ok": False,
            "binaries": binary_names,
            "expectedTag": expected_tag,
            "error": "The vendored Detectron2 extension is Linux-only; run the IDM-VTON service in WSL/Linux or install a compatible Detectron2 build.",
        }
    if not binaries:
        return {"ok": False, "binaries": [], "expectedTag": expected_tag, "error": "No Detectron2 extension binary found."}
    if not matching:
        return {
            "ok": False,
            "binaries": binary_names,
            "expectedTag": expected_tag,
            "error": "Detectron2 extension binary does not match the active Python ABI.",
        }
    return {"ok": True, "binaries": binary_names, "expectedTag": expected_tag}
