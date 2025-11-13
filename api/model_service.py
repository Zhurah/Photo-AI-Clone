"""
Model loading and caching service
"""
import torch
from diffusers import StableDiffusionPipeline
from typing import Dict, Optional
import logging
from pathlib import Path

from config import (
    DEVICE, TORCH_DTYPE, USER_MODELS,
    FALLBACK_MODEL_ID, DEFAULT_MODEL_ID
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ModelService:
    """Service for managing Stable Diffusion models"""

    def __init__(self):
        """Initialize the model service with an empty cache"""
        self.model_cache: Dict[str, StableDiffusionPipeline] = {}
        self.device = DEVICE
        self.dtype = TORCH_DTYPE
        logger.info(f"ModelService initialized with device: {self.device}")

    def get_model_id(self, user_id: str) -> str:
        """
        Get the model ID for a given user

        Args:
            user_id: User identifier

        Returns:
            Model ID (HuggingFace model name or local path)
        """
        return USER_MODELS.get(user_id, DEFAULT_MODEL_ID)

    def load_model(self, model_id: str) -> StableDiffusionPipeline:
        """
        Load a Stable Diffusion model from HuggingFace or local path

        Args:
            model_id: HuggingFace model ID or local path

        Returns:
            Loaded StableDiffusionPipeline
        """
        logger.info(f"Loading model: {model_id}")

        try:
            # Try loading the model
            pipe = StableDiffusionPipeline.from_pretrained(
                model_id,
                torch_dtype=self.dtype,
                safety_checker=None,  # Disable safety checker for custom models
                requires_safety_checker=False
            )

            # Move to device
            pipe = pipe.to(self.device)

            # Enable memory optimizations if on CPU or low VRAM
            if self.device == "cpu":
                pipe.enable_attention_slicing()
            else:
                # For GPU, enable xformers if available for better performance
                try:
                    pipe.enable_xformers_memory_efficient_attention()
                    logger.info("xformers enabled for memory efficiency")
                except Exception as e:
                    logger.warning(f"xformers not available: {e}")
                    pipe.enable_attention_slicing()

            logger.info(f"Model {model_id} loaded successfully on {self.device}")
            return pipe

        except Exception as e:
            logger.error(f"Error loading model {model_id}: {e}")

            # Try fallback model if available
            if model_id != FALLBACK_MODEL_ID:
                logger.info(f"Attempting to load fallback model: {FALLBACK_MODEL_ID}")
                return self.load_model(FALLBACK_MODEL_ID)
            else:
                raise Exception(f"Failed to load model {model_id}: {e}")

    def get_or_load_model(self, user_id: str) -> tuple[StableDiffusionPipeline, str]:
        """
        Get model from cache or load it if not cached

        Args:
            user_id: User identifier

        Returns:
            Tuple of (pipeline, model_id)
        """
        model_id = self.get_model_id(user_id)

        # Check if model is already cached
        if model_id in self.model_cache:
            logger.info(f"Using cached model: {model_id}")
            return self.model_cache[model_id], model_id

        # Load and cache the model
        pipe = self.load_model(model_id)
        self.model_cache[model_id] = pipe

        return pipe, model_id

    def generate_image(
        self,
        user_id: str,
        prompt: str,
        num_inference_steps: int = 30,
        guidance_scale: float = 7.5,
        width: int = 512,
        height: int = 512,
        seed: Optional[int] = None
    ):
        """
        Generate an image using the user's model

        Args:
            user_id: User identifier
            prompt: Text prompt for generation
            num_inference_steps: Number of denoising steps
            guidance_scale: Guidance scale for generation
            width: Image width
            height: Image height
            seed: Random seed for reproducibility

        Returns:
            Generated PIL Image
        """
        # Get or load the model
        pipe, model_id = self.get_or_load_model(user_id)

        # Set seed if provided
        generator = None
        if seed is not None:
            generator = torch.Generator(device=self.device).manual_seed(seed)

        # Generate image
        logger.info(f"Generating image with prompt: {prompt[:50]}...")

        result = pipe(
            prompt=prompt,
            num_inference_steps=num_inference_steps,
            guidance_scale=guidance_scale,
            width=width,
            height=height,
            generator=generator
        )

        return result.images[0], model_id

    def clear_cache(self):
        """Clear all cached models from memory"""
        logger.info("Clearing model cache")
        self.model_cache.clear()

        # Force garbage collection
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

    def get_loaded_models_count(self) -> int:
        """Get number of models currently loaded in cache"""
        return len(self.model_cache)


# Global instance
model_service = ModelService()
