# IDM-VTON Python AI Service

This service wraps the cloned `IDM-VTON` repository as a separate Python inference service. NestJS remains the main backend.

## Setup

Create the IDM-VTON environment first:

```bash
cd ../IDM-VTON
conda env create -f environment.yaml
conda activate idm
```

Install service dependencies into the same environment:

```bash
cd ../idm-vton-service
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and adjust paths if needed.

Run diagnostics before inference:

```bash
python scripts/diagnose.py
```

## Required Checkpoints

The service validates these files before inference:

```text
../IDM-VTON/ckpt/densepose/model_final_162be9.pkl
../IDM-VTON/ckpt/humanparsing/parsing_atr.onnx
../IDM-VTON/ckpt/humanparsing/parsing_lip.onnx
../IDM-VTON/ckpt/openpose/ckpts/body_pose_model.pth
```

The current cloned repo contains placeholder files for these checkpoints. Replace them with real weights before running inference.

Download and place the required real weights:

```bash
python scripts/download_weights.py
```

This downloads preprocessing checkpoints into `../IDM-VTON/ckpt` and the main Diffusers model snapshot into `../IDM-VTON/models/yisol-IDM-VTON`. After that, set:

```env
IDM_VTON_MODEL_ID=../IDM-VTON/models/yisol-IDM-VTON
```

The main model is large, roughly 26 GB. The preprocessing checkpoints are roughly 0.93 GB.

`IDM_VTON_ENABLE_CPU_OFFLOAD=true` is enabled by default to reduce VRAM pressure. Disable it only on GPUs with enough memory for the full SDXL stack.

## Run

```bash
conda activate idm
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Health check:

```bash
curl http://localhost:8001/health
```

Inference smoke test:

```bash
curl -X POST http://localhost:8001/infer \
  -F "person_image=@/path/to/person.jpg" \
  -F "garment_image=@/path/to/garment.jpg" \
  -F "category=upper_body"
```
