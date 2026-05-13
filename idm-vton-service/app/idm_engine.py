import base64
import os
import sys
import threading
import time
from pathlib import Path
from typing import Optional
from uuid import uuid4

from PIL import Image, UnidentifiedImageError

from .config import Settings
from .diagnostics import build_diagnostics
from .errors import TryOnError


SUPPORTED_CATEGORIES = {"upper_body"}


class IDMVtonEngine:
    def __init__(self, settings: Settings):
        self.settings = settings
        self._loaded = False
        self._load_lock = threading.Lock()
        self._infer_lock = threading.Lock()

    def health(self) -> dict:
        diagnostics = build_diagnostics(self.settings)
        missing = diagnostics["checkpoints"]["missing"]
        cuda = diagnostics["cuda"]["available"]
        return {
            "ok": len(missing) == 0 and cuda and diagnostics["dependencies"]["ok"] and diagnostics["detectron2"]["ok"],
            "cudaAvailable": cuda,
            "modelLoaded": self._loaded,
            "repoDir": str(self.settings.idm_vton_repo_dir),
            "checkpointDir": str(self.settings.checkpoint_dir),
            "outputDir": str(self.settings.idm_vton_output_dir),
            "missingCheckpoints": missing,
            "diagnostics": diagnostics,
        }

    def missing_checkpoints(self) -> list[dict]:
        missing = []
        for name, path in self.settings.required_checkpoints.items():
            if not path.exists() or path.stat().st_size < 1024:
                missing.append({"name": name, "path": str(path)})
        return missing

    def infer(
        self,
        person_image_path: Path,
        garment_image_path: Path,
        category: str,
        garment_description: Optional[str] = None,
    ) -> dict:
        if category not in SUPPORTED_CATEGORIES:
            raise TryOnError(
                "UNSUPPORTED_CATEGORY",
                "Only upper_body garments are supported for IDM-VTON inference.",
                400,
            )

        person_image = self._load_image(person_image_path, "person_image")
        garment_image = self._load_image(garment_image_path, "garment_image")

        self._ensure_ready()

        with self._infer_lock:
            started = time.perf_counter()
            try:
                output = self._run_inference(
                    person_image,
                    garment_image,
                    category,
                    garment_description or "upper body garment",
                )
            except TryOnError:
                raise
            except Exception as exc:
                raise TryOnError("INFERENCE_FAILURE", str(exc), 500) from exc

            self.settings.idm_vton_output_dir.mkdir(parents=True, exist_ok=True)
            filename = f"{uuid4().hex}.png"
            output_path = self.settings.idm_vton_output_dir / filename
            output.save(output_path, format="PNG")

            with output_path.open("rb") as file:
                image_base64 = base64.b64encode(file.read()).decode("ascii")

            return {
                "imagePath": str(output_path),
                "imageUrl": f"/outputs/{filename}",
                "imageBase64": image_base64,
                "metadata": {
                    "category": category,
                    "width": output.width,
                    "height": output.height,
                    "steps": self.settings.idm_vton_steps,
                    "seed": self.settings.idm_vton_seed,
                    "durationMs": round((time.perf_counter() - started) * 1000),
                },
            }

    def _ensure_ready(self) -> None:
        if self._loaded:
            return

        with self._load_lock:
            if self._loaded:
                return

            if not self.settings.idm_vton_repo_dir.exists():
                raise TryOnError(
                    "IDM_VTON_REPO_NOT_FOUND",
                    f"IDM-VTON repo not found at {self.settings.idm_vton_repo_dir}",
                    503,
                )

            missing = self.missing_checkpoints()
            if missing:
                raise TryOnError(
                    "MISSING_CHECKPOINT",
                    "Required IDM-VTON preprocessing checkpoint files are missing or placeholders.",
                    503,
                    details=missing,
                )

            if not self._cuda_available():
                raise TryOnError(
                    "CUDA_UNAVAILABLE",
                    "CUDA is required for IDM-VTON inference.",
                    503,
                    details=build_diagnostics(self.settings)["cuda"],
                )

            try:
                self._load_model()
            except ModuleNotFoundError as exc:
                raise TryOnError(
                    "DEPENDENCY_MISMATCH",
                    f"Missing Python dependency: {exc.name}",
                    503,
                    details=build_diagnostics(self.settings),
                ) from exc
            except (ImportError, OSError) as exc:
                raise TryOnError(
                    "DEPENDENCY_MISMATCH",
                    f"IDM-VTON dependency import failed: {exc}",
                    503,
                    details=build_diagnostics(self.settings),
                ) from exc
            except RuntimeError as exc:
                message = str(exc)
                code = "CUDA_UNAVAILABLE" if "cuda" in message.lower() else "MODEL_LOAD_FAILURE"
                raise TryOnError(code, message, 503, details=build_diagnostics(self.settings)) from exc
            except Exception as exc:
                raise TryOnError(
                    "MODEL_LOAD_FAILURE",
                    f"IDM-VTON model load failed: {exc}",
                    503,
                    details=build_diagnostics(self.settings),
                ) from exc
            self._loaded = True

    def _load_model(self) -> None:
        repo_dir = self.settings.idm_vton_repo_dir
        gradio_dir = repo_dir / "gradio_demo"
        sys.path.insert(0, str(repo_dir))
        sys.path.insert(0, str(gradio_dir))
        os.chdir(repo_dir)

        import torch
        from diffusers import AutoencoderKL, DDPMScheduler
        from gradio_demo.utils_mask import get_mask_location
        from src.tryon_pipeline import StableDiffusionXLInpaintPipeline as TryonPipeline
        from src.unet_hacked_garmnet import UNet2DConditionModel as UNet2DConditionModelRef
        from src.unet_hacked_tryon import UNet2DConditionModel
        from torchvision import transforms
        from torchvision.transforms.functional import to_pil_image
        from transformers import (
            AutoTokenizer,
            CLIPImageProcessor,
            CLIPTextModel,
            CLIPTextModelWithProjection,
            CLIPVisionModelWithProjection,
        )
        import apply_net
        from detectron2.data.detection_utils import _apply_exif_orientation, convert_PIL_to_numpy
        from preprocess.humanparsing.run_parsing import Parsing
        from preprocess.openpose.run_openpose import OpenPose

        self.torch = torch
        self.transforms = transforms
        self.to_pil_image = to_pil_image
        self.get_mask_location = get_mask_location
        self.apply_net = apply_net
        self.apply_exif_orientation = _apply_exif_orientation
        self.convert_pil_to_numpy = convert_PIL_to_numpy
        self.device = self.settings.idm_vton_device

        base_path = self.settings.idm_vton_model_id
        dtype = torch.float16

        self.unet = UNet2DConditionModel.from_pretrained(base_path, subfolder="unet", torch_dtype=dtype)
        self.unet.requires_grad_(False)
        self.tokenizer_one = AutoTokenizer.from_pretrained(base_path, subfolder="tokenizer", use_fast=False)
        self.tokenizer_two = AutoTokenizer.from_pretrained(base_path, subfolder="tokenizer_2", use_fast=False)
        self.noise_scheduler = DDPMScheduler.from_pretrained(base_path, subfolder="scheduler")
        self.text_encoder_one = CLIPTextModel.from_pretrained(base_path, subfolder="text_encoder", torch_dtype=dtype)
        self.text_encoder_two = CLIPTextModelWithProjection.from_pretrained(
            base_path, subfolder="text_encoder_2", torch_dtype=dtype
        )
        self.image_encoder = CLIPVisionModelWithProjection.from_pretrained(
            base_path, subfolder="image_encoder", torch_dtype=dtype
        )
        self.vae = AutoencoderKL.from_pretrained(base_path, subfolder="vae", torch_dtype=dtype)
        self.unet_encoder = UNet2DConditionModelRef.from_pretrained(
            base_path, subfolder="unet_encoder", torch_dtype=dtype
        )

        self.parsing_model = Parsing(0)
        self.openpose_model = OpenPose(0)

        for model in (
            self.unet_encoder,
            self.image_encoder,
            self.vae,
            self.unet,
            self.text_encoder_one,
            self.text_encoder_two,
        ):
            model.requires_grad_(False)

        self.tensor_transform = transforms.Compose(
            [transforms.ToTensor(), transforms.Normalize([0.5], [0.5])]
        )

        self.pipe = TryonPipeline.from_pretrained(
            base_path,
            unet=self.unet,
            vae=self.vae,
            feature_extractor=CLIPImageProcessor(),
            text_encoder=self.text_encoder_one,
            text_encoder_2=self.text_encoder_two,
            tokenizer=self.tokenizer_one,
            tokenizer_2=self.tokenizer_two,
            scheduler=self.noise_scheduler,
            image_encoder=self.image_encoder,
            torch_dtype=dtype,
        )
        self.pipe.unet_encoder = self.unet_encoder
        self._patch_ip_adapter_projection_for_offload()

        if self.settings.idm_vton_enable_cpu_offload:
            self.pipe.model_cpu_offload_seq = "text_encoder->text_encoder_2->image_encoder->unet_encoder->unet->vae"
            self.pipe.enable_model_cpu_offload(gpu_id=0)
            self.pipe.enable_attention_slicing()
            self.pipe.enable_vae_slicing()
            self.cpu_offload_enabled = True
        else:
            self.pipe.to(self.device)
            self.pipe.unet_encoder.to(self.device)
            self.cpu_offload_enabled = False

    def _patch_ip_adapter_projection_for_offload(self) -> None:
        projection = getattr(getattr(self.pipe, "unet", None), "encoder_hid_proj", None)
        if projection is None or getattr(projection, "_idm_vton_device_patch", False):
            return

        original_forward = projection.forward
        output_device = self.device

        def forward_with_device(input_tensor, *args, **kwargs):
            try:
                parameter = next(projection.parameters())
                target_device = parameter.device
                target_dtype = parameter.dtype
            except StopIteration:
                target_device = input_tensor.device
                target_dtype = input_tensor.dtype

            if str(output_device).startswith("cuda") and target_device.type == "cpu":
                projection.to(output_device)
                try:
                    parameter = next(projection.parameters())
                    target_device = parameter.device
                    target_dtype = parameter.dtype
                except StopIteration:
                    target_device = input_tensor.device
                    target_dtype = input_tensor.dtype

            output = original_forward(input_tensor.to(device=target_device, dtype=target_dtype), *args, **kwargs)
            return output.to(output_device)

        projection.forward = forward_with_device
        projection._idm_vton_device_patch = True

    def _run_inference(
        self,
        person_image: Image.Image,
        garment_image: Image.Image,
        category: str,
        garment_description: str,
    ) -> Image.Image:
        torch = self.torch

        self.openpose_model.preprocessor.body_estimation.model.to(self.device)
        if not self.cpu_offload_enabled:
            self.pipe.to(self.device)
            self.pipe.unet_encoder.to(self.device)

        garment_image = garment_image.convert("RGB").resize((768, 1024))
        human_image = person_image.convert("RGB").resize((768, 1024))

        keypoints = self.openpose_model(human_image.resize((384, 512)))
        model_parse, _ = self.parsing_model(human_image.resize((384, 512)))
        mask, _ = self.get_mask_location("hd", category, model_parse, keypoints)
        mask = mask.resize((768, 1024))

        human_img_arg = self.apply_exif_orientation(human_image.resize((384, 512)))
        human_img_arg = self.convert_pil_to_numpy(human_img_arg, format="BGR")
        densepose_config = str(self.settings.idm_vton_repo_dir / "configs" / "densepose_rcnn_R_50_FPN_s1x.yaml")
        densepose_ckpt = str(self.settings.required_checkpoints["densepose"])
        densepose_args = self.apply_net.create_argument_parser().parse_args(
            ("show", densepose_config, densepose_ckpt, "dp_segm", "-v", "--opts", "MODEL.DEVICE", "cuda")
        )
        pose_img = densepose_args.func(densepose_args, human_img_arg)
        pose_img = Image.fromarray(pose_img[:, :, ::-1]).resize((768, 1024))

        prompt = f"model is wearing {garment_description}"
        cloth_prompt = f"a photo of {garment_description}"
        negative_prompt = "monochrome, lowres, bad anatomy, worst quality, low quality"

        with torch.no_grad(), torch.cuda.amp.autocast():
            (
                prompt_embeds,
                negative_prompt_embeds,
                pooled_prompt_embeds,
                negative_pooled_prompt_embeds,
            ) = self.pipe.encode_prompt(
                prompt,
                num_images_per_prompt=1,
                do_classifier_free_guidance=True,
                negative_prompt=negative_prompt,
            )
            (prompt_embeds_c, _, _, _) = self.pipe.encode_prompt(
                [cloth_prompt],
                num_images_per_prompt=1,
                do_classifier_free_guidance=False,
                negative_prompt=[negative_prompt],
            )

            pose_tensor = self.tensor_transform(pose_img).unsqueeze(0).to(self.device, torch.float16)
            garment_tensor = self.tensor_transform(garment_image).unsqueeze(0).to(self.device, torch.float16)
            generator = torch.Generator(self.device).manual_seed(self.settings.idm_vton_seed)

            images = self.pipe(
                prompt_embeds=prompt_embeds.to(self.device, torch.float16),
                negative_prompt_embeds=negative_prompt_embeds.to(self.device, torch.float16),
                pooled_prompt_embeds=pooled_prompt_embeds.to(self.device, torch.float16),
                negative_pooled_prompt_embeds=negative_pooled_prompt_embeds.to(self.device, torch.float16),
                num_inference_steps=self.settings.idm_vton_steps,
                generator=generator,
                strength=1.0,
                pose_img=pose_tensor,
                text_embeds_cloth=prompt_embeds_c.to(self.device, torch.float16),
                cloth=garment_tensor,
                mask_image=mask,
                image=human_image,
                height=1024,
                width=768,
                ip_adapter_image=garment_image.resize((768, 1024)),
                guidance_scale=self.settings.idm_vton_guidance_scale,
            )[0]

        return images[0]

    def _load_image(self, path: Path, field_name: str) -> Image.Image:
        try:
            image = Image.open(path)
            image.verify()
            image = Image.open(path)
            return image.convert("RGB")
        except (UnidentifiedImageError, OSError) as exc:
            raise TryOnError("INVALID_IMAGE", f"{field_name} is not a valid image.", 400) from exc

    def _cuda_available(self) -> bool:
        try:
            import torch

            return torch.cuda.is_available()
        except Exception:
            return False
