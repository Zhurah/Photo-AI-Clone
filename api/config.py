"""
Configuration file for FastAPI SD API
"""
import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).parent.parent
OUTPUT_DIR = BASE_DIR / "api" / "output"

# Data directory structure
DATA_DIR = BASE_DIR / "data"
USERS_DIR = DATA_DIR / "users"
MODELS_DIR = DATA_DIR / "models"
TEMP_DIR = DATA_DIR / "temp"

# Ensure directories exist
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
USERS_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)
TEMP_DIR.mkdir(parents=True, exist_ok=True)

# Model settings
# Use your local fine-tuned model instead of downloading from HuggingFace
DEFAULT_MODEL_ID = str(BASE_DIR / "Aurel_diffusers")  # Local fine-tuned model
FALLBACK_MODEL_ID = "runwayml/stable-diffusion-v1-5"  # Fallback if user model not found

# Generation parameters
DEFAULT_NUM_INFERENCE_STEPS = 30
DEFAULT_GUIDANCE_SCALE = 7.5
DEFAULT_IMAGE_WIDTH = 512
DEFAULT_IMAGE_HEIGHT = 512

# Device configuration
import torch
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
TORCH_DTYPE = torch.float16 if DEVICE == "cuda" else torch.float32

# Server settings
HOST = "0.0.0.0"
PORT = 8000

# Model mapping (pour gérer plusieurs utilisateurs dans le futur)
USER_MODELS = {
    "default": DEFAULT_MODEL_ID,
    "user_123": DEFAULT_MODEL_ID,
    # Ajouter d'autres mappings utilisateur -> modèle ici
}

# Training configuration
TRAINING_CONFIG = {
    "max_images_per_user": 20,
    "min_images_per_user": 10,
    "allowed_image_formats": [".jpg", ".jpeg", ".png", ".webp"],
    "max_image_size_mb": 10,
    "max_total_size_mb": 100,
}

# Storage configuration
STORAGE_CONFIG = {
    "keep_training_images": True,  # Garder les images après training
    "keep_checkpoints": True,      # Garder les checkpoints intermédiaires
    "max_user_storage_gb": 5,      # Limite de stockage par utilisateur
}
