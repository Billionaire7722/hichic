import base64
import io
import importlib.util
import os
import time
from pathlib import Path
from typing import Optional
from uuid import uuid4

import requests
from PIL import Image, UnidentifiedImageError

from .config import Settings
from .errors import TryOnError


SUPPORTED_PROVIDERS = {"segmind", "kling", "nova"}
SUPPORTED_CATEGORIES = {
    "upper_body": {
        "segmind": "Upper body",
        "nova": "UPPER_BODY",
    },
    "lower_body": {
        "segmind": "Lower body",
        "nova": "LOWER_BODY",
    },
    "dress": {
        "segmind": "Dress",
        "nova": "FULL_BODY",
    },
}


class OpenTryOnEngine:
    def __init__(self, settings: Settings):
        self.settings = settings

    def health(self) -> dict:
        providers = self._provider_status()
        selected_provider = self._select_provider(raise_on_error=False)
        return {
            "ok": self.settings.opentryon_repo_dir.exists() and selected_provider is not None,
            "service": "opentryon",
            "provider": selected_provider,
            "configuredProvider": self.settings.provider,
            "opentryonRepoDir": str(self.settings.opentryon_repo_dir),
            "outputDir": str(self.settings.output_dir),
            "providers": providers,
        }

    def infer(
        self,
        person_image_path: Path,
        garment_image_path: Path,
        category: str,
        garment_description: Optional[str] = None,
        provider: Optional[str] = None,
    ) -> dict:
        if category not in SUPPORTED_CATEGORIES:
            raise TryOnError(
                "UNSUPPORTED_CATEGORY",
                "Supported categories are upper_body, lower_body, and dress.",
                400,
            )

        self._load_image(person_image_path, "person_image")
        self._load_image(garment_image_path, "garment_image")

        selected_provider = self._select_provider(provider)
        started = time.perf_counter()

        try:
            if selected_provider == "segmind":
                output = self._run_segmind(person_image_path, garment_image_path, category)
            elif selected_provider == "kling":
                output = self._run_kling(person_image_path, garment_image_path)
            elif selected_provider == "nova":
                output = self._run_nova(person_image_path, garment_image_path, category)
            else:
                raise TryOnError("UNSUPPORTED_PROVIDER", f"Unsupported provider: {selected_provider}", 400)
        except TryOnError:
            raise
        except ValueError as exc:
            raise TryOnError("UPSTREAM_PROVIDER_ERROR", str(exc), 502) from exc
        except Exception as exc:
            raise TryOnError("INFERENCE_FAILURE", str(exc), 500) from exc

        self.settings.output_dir.mkdir(parents=True, exist_ok=True)
        filename = f"{uuid4().hex}.png"
        output_path = self.settings.output_dir / filename
        output.save(output_path, format="PNG")

        with output_path.open("rb") as file:
            image_base64 = base64.b64encode(file.read()).decode("ascii")

        return {
            "imagePath": str(output_path),
            "imageUrl": f"/outputs/{filename}",
            "imageBase64": image_base64,
            "metadata": {
                "provider": selected_provider,
                "category": category,
                "garmentDescription": garment_description,
                "width": output.width,
                "height": output.height,
                "durationMs": round((time.perf_counter() - started) * 1000),
            },
        }

    def _run_segmind(self, person_image_path: Path, garment_image_path: Path, category: str) -> Image.Image:
        if not self.settings.segmind_api_key:
            raise TryOnError("MISSING_PROVIDER_CREDENTIALS", "SEGMIND_API_KEY is required.", 503)

        if self.settings.segmind_endpoint == "try-on-diffusion":
            return self._run_segmind_tryon_diffusion(person_image_path, garment_image_path, category)

        return self._run_segmind_segfit(person_image_path, garment_image_path)

    def _run_segmind_segfit(self, person_image_path: Path, garment_image_path: Path) -> Image.Image:
        endpoint = "https://api.segmind.com/v1/segfit-v1.3"
        payload = {
            "model_image": self._encode_file(person_image_path),
            "outfit_image": self._encode_file(garment_image_path),
            "model_type": self.settings.segmind_model_type,
            "cn_strength": self.settings.segmind_cn_strength,
            "cn_end": self.settings.segmind_cn_end,
            "image_format": self.settings.segmind_image_format,
            "image_quality": self.settings.segmind_image_quality,
            "seed": self.settings.segmind_seed if self.settings.segmind_seed is not None else -1,
            "base64": False,
        }

        response = requests.post(
            endpoint,
            headers={"x-api-key": self.settings.segmind_api_key, "Content-Type": "application/json"},
            json=payload,
            timeout=self.settings.segmind_timeout_seconds,
        )

        if response.status_code != 200:
            raise ValueError(self._format_segmind_error(response))

        try:
            return Image.open(io.BytesIO(response.content)).convert("RGB")
        except UnidentifiedImageError as exc:
            raise ValueError("Segmind returned a non-image response.") from exc

    def _run_segmind_tryon_diffusion(
        self,
        person_image_path: Path,
        garment_image_path: Path,
        category: str,
    ) -> Image.Image:
        module = self._load_adapter_module("segmind", "tryon/api/segmind.py")
        adapter = module.SegmindVTONAdapter(api_key=self.settings.segmind_api_key)
        images = adapter.generate_and_decode(
            model_image=str(person_image_path),
            cloth_image=str(garment_image_path),
            category=SUPPORTED_CATEGORIES[category]["segmind"],
            num_inference_steps=self.settings.segmind_steps,
            guidance_scale=self.settings.segmind_guidance_scale,
            seed=self.settings.segmind_seed,
        )
        return images[0].convert("RGB")

    def _format_segmind_error(self, response: requests.Response) -> str:
        try:
            payload = response.json()
            detail = payload.get("error") or payload.get("message") or payload
        except ValueError:
            detail = response.text

        status_messages = {
            401: "Segmind API authentication failed. Please check SEGMIND_API_KEY.",
            403: "Segmind API access forbidden. Please check account permissions.",
            406: "Segmind API insufficient credits. Please add credits to your account.",
            429: "Segmind API rate limit exceeded. Please wait before retrying.",
            504: "Segmind API timed out while generating the image.",
        }
        prefix = status_messages.get(response.status_code, f"Segmind API HTTP error {response.status_code}.")
        return f"{prefix} Details: {detail}"

    def _run_kling(self, person_image_path: Path, garment_image_path: Path) -> Image.Image:
        if not self.settings.kling_api_key or not self.settings.kling_secret_key:
            raise TryOnError(
                "MISSING_PROVIDER_CREDENTIALS",
                "KLING_AI_API_KEY and KLING_AI_SECRET_KEY are required.",
                503,
            )

        module = self._load_adapter_module("kling_ai", "tryon/api/kling_ai.py")
        adapter = module.KlingAIVTONAdapter(
            api_key=self.settings.kling_api_key,
            secret_key=self.settings.kling_secret_key,
            base_url=self.settings.kling_base_url,
        )
        images = adapter.generate_and_decode(
            source_image=str(person_image_path),
            reference_image=str(garment_image_path),
            model=self.settings.kling_model,
        )
        return images[0].convert("RGB")

    def _run_nova(self, person_image_path: Path, garment_image_path: Path, category: str) -> Image.Image:
        if self.settings.amazon_nova_model_id:
            os.environ["AMAZON_NOVA_MODEL_ID"] = self.settings.amazon_nova_model_id

        module = self._load_adapter_module("nova_canvas", "tryon/api/nova_canvas.py")
        adapter = module.AmazonNovaCanvasVTONAdapter(region=self.settings.amazon_nova_region)
        images = adapter.generate_and_decode(
            source_image=str(person_image_path),
            reference_image=str(garment_image_path),
            mask_type="GARMENT",
            garment_class=SUPPORTED_CATEGORIES[category]["nova"],
        )
        return images[0].convert("RGB")

    def _select_provider(self, provider: Optional[str] = None, raise_on_error: bool = True) -> Optional[str]:
        requested = (provider or self.settings.provider).lower()
        if requested == "auto":
            for candidate, configured in self._provider_status().items():
                if configured["configured"]:
                    return candidate
            if raise_on_error:
                raise TryOnError(
                    "MISSING_PROVIDER_CREDENTIALS",
                    "No OpenTryOn provider credentials are configured.",
                    503,
                )
            return None

        if requested not in SUPPORTED_PROVIDERS:
            if raise_on_error:
                raise TryOnError(
                    "UNSUPPORTED_PROVIDER",
                    f"OPENTRYON_PROVIDER must be one of: {', '.join(sorted(SUPPORTED_PROVIDERS))}, auto.",
                    400,
                )
            return None

        if not self._provider_status()[requested]["configured"]:
            if raise_on_error:
                raise TryOnError(
                    "MISSING_PROVIDER_CREDENTIALS",
                    f"Provider '{requested}' is selected but its credentials are not configured.",
                    503,
                )
            return None

        return requested

    def _provider_status(self) -> dict:
        aws_credentials_file = Path.home() / ".aws" / "credentials"
        nova_configured = bool(
            os.getenv("AWS_PROFILE")
            or (os.getenv("AWS_ACCESS_KEY_ID") and os.getenv("AWS_SECRET_ACCESS_KEY"))
            or aws_credentials_file.exists()
        )

        return {
            "segmind": {
                "configured": bool(self.settings.segmind_api_key),
                "requires": ["SEGMIND_API_KEY"],
            },
            "kling": {
                "configured": bool(self.settings.kling_api_key and self.settings.kling_secret_key),
                "requires": ["KLING_AI_API_KEY", "KLING_AI_SECRET_KEY"],
            },
            "nova": {
                "configured": nova_configured,
                "requires": ["AWS credentials or profile with Bedrock Nova Canvas access"],
            },
        }

    def _load_adapter_module(self, module_name: str, relative_path: str):
        path = self.settings.opentryon_repo_dir / Path(relative_path)
        if not path.exists():
            raise TryOnError(
                "OPENTRYON_REPO_NOT_FOUND",
                f"OpenTryOn adapter file not found: {path}",
                503,
            )

        spec = importlib.util.spec_from_file_location(f"_opentryon_{module_name}", path)
        if spec is None or spec.loader is None:
            raise TryOnError("ADAPTER_LOAD_FAILED", f"Could not load OpenTryOn adapter: {path}", 503)

        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module

    def _load_image(self, path: Path, field_name: str) -> Image.Image:
        try:
            with Image.open(path) as image:
                image.verify()
            image = Image.open(path)
            return image.convert("RGB")
        except (UnidentifiedImageError, OSError) as exc:
            raise TryOnError("INVALID_IMAGE", f"{field_name} is not a readable image.", 400) from exc

    def _encode_file(self, path: Path) -> str:
        with path.open("rb") as file:
            return base64.b64encode(file.read()).decode("utf-8")
