# OpenTryOn Python AI Service

This service wraps the cloned `../opentryon` repository behind the same `/infer`
contract the NestJS backend already uses. It is intentionally lightweight: it
does not install PyTorch, Diffusers, IDM-VTON checkpoints, or local GPU models.

The practical local path is to use a cloud provider:

- `segmind`: requires `SEGMIND_API_KEY`; defaults to Segmind SegFit v1.3 Speed mode
- `kling`: requires `KLING_AI_API_KEY` and `KLING_AI_SECRET_KEY`
- `nova`: requires AWS credentials with Bedrock Nova Canvas access

## Setup

```powershell
cd D:\my-project\hichic\opentryon-service
.\scripts\setup.ps1
```

Then edit `.env` and set at least one provider. For the lowest local resource
usage, start with:

```env
OPENTRYON_PROVIDER=segmind
SEGMIND_API_KEY=your_key_here
OPENTRYON_SEGMIND_ENDPOINT=segfit-v1.3
OPENTRYON_SEGMIND_MODEL_TYPE=Speed
```

## Run

```powershell
cd D:\my-project\hichic\opentryon-service
.\scripts\run.ps1
```

The service runs on `http://localhost:8001`.

Health check:

```powershell
Invoke-RestMethod http://localhost:8001/health
```

Inference smoke test:

```powershell
curl.exe -X POST http://localhost:8001/infer `
  -F "person_image=@D:\path\to\person.jpg" `
  -F "garment_image=@D:\path\to\garment.jpg" `
  -F "category=upper_body"
```

Supported categories are `upper_body`, `lower_body`, and `dress`.
