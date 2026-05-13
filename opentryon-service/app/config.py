import os
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv


SERVICE_ROOT = Path(__file__).resolve().parents[1]
WORKSPACE_ROOT = SERVICE_ROOT.parent


for cert_env_name in ("CURL_CA_BUNDLE", "REQUESTS_CA_BUNDLE", "SSL_CERT_FILE"):
    cert_path = os.getenv(cert_env_name)
    if cert_path and not Path(cert_path).exists():
        os.environ.pop(cert_env_name, None)

load_dotenv(SERVICE_ROOT / ".env")
load_dotenv(WORKSPACE_ROOT / ".env")


def _env(name: str, default: Optional[str] = None) -> Optional[str]:
    value = os.getenv(name)
    return value if value not in (None, "") else default


def _env_int(name: str, default: int) -> int:
    value = _env(name)
    return int(value) if value is not None else default


def _env_float(name: str, default: Optional[float] = None) -> Optional[float]:
    value = _env(name)
    return float(value) if value is not None else default


def _path_env(name: str, default: Path) -> Path:
    configured = Path(_env(name, str(default)) or str(default))
    return configured if configured.is_absolute() else (SERVICE_ROOT / configured).resolve()


@dataclass(frozen=True)
class Settings:
    service_host: str = _env("SERVICE_HOST", "0.0.0.0") or "0.0.0.0"
    service_port: int = _env_int("SERVICE_PORT", 8001)
    provider: str = (_env("OPENTRYON_PROVIDER", "segmind") or "segmind").lower()
    opentryon_repo_dir: Path = _path_env("OPENTRYON_REPO_DIR", WORKSPACE_ROOT / "opentryon")
    output_dir: Path = _path_env("OPENTRYON_OUTPUT_DIR", SERVICE_ROOT / "outputs")
    temp_dir: Path = _path_env("OPENTRYON_TEMP_DIR", SERVICE_ROOT / "tmp")
    max_upload_mb: int = _env_int("OPENTRYON_MAX_UPLOAD_MB", 12)

    segmind_api_key: Optional[str] = _env("SEGMIND_API_KEY")
    segmind_endpoint: str = _env("OPENTRYON_SEGMIND_ENDPOINT", "segfit-v1.3") or "segfit-v1.3"
    segmind_model_type: str = _env("OPENTRYON_SEGMIND_MODEL_TYPE", "Speed") or "Speed"
    segmind_cn_strength: float = _env_float("OPENTRYON_SEGMIND_CN_STRENGTH", 0.8) or 0.8
    segmind_cn_end: float = _env_float("OPENTRYON_SEGMIND_CN_END", 0.5) or 0.5
    segmind_image_format: str = _env("OPENTRYON_SEGMIND_IMAGE_FORMAT", "png") or "png"
    segmind_image_quality: int = _env_int("OPENTRYON_SEGMIND_IMAGE_QUALITY", 90)
    segmind_timeout_seconds: int = _env_int("OPENTRYON_SEGMIND_TIMEOUT_SECONDS", 600)
    segmind_steps: Optional[int] = (
        _env_int("OPENTRYON_SEGMIND_STEPS", 0) or None
    )
    segmind_guidance_scale: Optional[float] = _env_float("OPENTRYON_SEGMIND_GUIDANCE_SCALE")
    segmind_seed: Optional[int] = _env_int("OPENTRYON_SEGMIND_SEED", -1)

    kling_api_key: Optional[str] = _env("KLING_AI_API_KEY")
    kling_secret_key: Optional[str] = _env("KLING_AI_SECRET_KEY")
    kling_base_url: Optional[str] = _env("KLING_AI_BASE_URL")
    kling_model: Optional[str] = _env("OPENTRYON_KLING_MODEL")

    amazon_nova_region: Optional[str] = _env("AMAZON_NOVA_REGION")
    amazon_nova_model_id: Optional[str] = _env("AMAZON_NOVA_MODEL_ID")


def get_settings() -> Settings:
    settings = Settings()
    settings.output_dir.mkdir(parents=True, exist_ok=True)
    settings.temp_dir.mkdir(parents=True, exist_ok=True)
    return settings
