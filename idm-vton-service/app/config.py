from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    service_host: str = "0.0.0.0"
    service_port: int = 8001

    idm_vton_repo_dir: Path = Path(__file__).resolve().parents[2] / "IDM-VTON"
    idm_vton_model_id: str = "yisol/IDM-VTON"
    idm_vton_output_dir: Path = Path(__file__).resolve().parents[1] / "outputs"
    idm_vton_temp_dir: Path = Path(__file__).resolve().parents[1] / "tmp"

    idm_vton_device: str = "cuda:0"
    idm_vton_steps: int = 30
    idm_vton_seed: int = 42
    idm_vton_guidance_scale: float = 2.0
    idm_vton_max_upload_mb: int = 12
    idm_vton_enable_cpu_offload: bool = True

    @property
    def checkpoint_dir(self) -> Path:
        return self.idm_vton_repo_dir / "ckpt"

    @property
    def required_checkpoints(self) -> dict[str, Path]:
        # Upstream preprocessing modules hardcode paths under IDM-VTON/ckpt,
        # so real checkpoint files must be placed there.
        ckpt = self.checkpoint_dir
        return {
            "densepose": ckpt / "densepose" / "model_final_162be9.pkl",
            "parsing_atr": ckpt / "humanparsing" / "parsing_atr.onnx",
            "parsing_lip": ckpt / "humanparsing" / "parsing_lip.onnx",
            "openpose": ckpt / "openpose" / "ckpts" / "body_pose_model.pth",
        }


@lru_cache
def get_settings() -> Settings:
    return Settings()
