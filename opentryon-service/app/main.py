from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Annotated, Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.staticfiles import StaticFiles

from .config import get_settings
from .errors import TryOnError
from .open_tryon_engine import OpenTryOnEngine


settings = get_settings()
app = FastAPI(title="OpenTryOn Compatibility Service")
app.mount("/outputs", StaticFiles(directory=settings.output_dir), name="outputs")
engine = OpenTryOnEngine(settings)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}


@app.get("/health")
def health() -> dict:
    return engine.health()


@app.post("/infer")
async def infer(
    person_image: Annotated[UploadFile, File()],
    garment_image: Annotated[UploadFile, File()],
    category: Annotated[str, Form()],
    garment_description: Annotated[Optional[str], Form()] = None,
    provider: Annotated[Optional[str], Form()] = None,
) -> dict:
    person_path: Optional[Path] = None
    garment_path: Optional[Path] = None

    try:
        person_path = await _persist_upload(person_image, "person_image")
        garment_path = await _persist_upload(garment_image, "garment_image")
        result = engine.infer(person_path, garment_path, category, garment_description, provider)
        return {"ok": True, "result": result, "metadata": result["metadata"], "error": None}
    except TryOnError as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail={
                "ok": False,
                "result": None,
                "metadata": None,
                "error": {"code": exc.code, "message": exc.message, "details": exc.details},
            },
        ) from exc
    finally:
        for path in (person_path, garment_path):
            if path and path.exists():
                path.unlink(missing_ok=True)


async def _persist_upload(upload: UploadFile, field_name: str) -> Path:
    if upload.content_type not in ALLOWED_IMAGE_TYPES:
        raise TryOnError("INVALID_IMAGE", f"{field_name} must be a JPEG, PNG, or WEBP image.", 400)

    max_bytes = settings.max_upload_mb * 1024 * 1024
    data = await upload.read()
    if len(data) == 0:
        raise TryOnError("INVALID_IMAGE", f"{field_name} is empty.", 400)
    if len(data) > max_bytes:
        raise TryOnError("INVALID_IMAGE", f"{field_name} exceeds {settings.max_upload_mb} MB.", 400)

    suffix = Path(upload.filename or "").suffix.lower()
    if suffix not in {".jpg", ".jpeg", ".png", ".webp"}:
        suffix = ".png"

    with NamedTemporaryFile(delete=False, suffix=suffix, dir=settings.temp_dir) as file:
        file.write(data)
        return Path(file.name)
