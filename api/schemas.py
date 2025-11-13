"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional


class GenerateRequest(BaseModel):
    """Request schema for image generation"""
    prompt: str = Field(..., description="Text prompt for image generation", min_length=1)
    user_id: str = Field(default="default", description="User identifier for model selection")
    num_inference_steps: Optional[int] = Field(default=30, ge=1, le=150, description="Number of denoising steps")
    guidance_scale: Optional[float] = Field(default=7.5, ge=1.0, le=20.0, description="Guidance scale for generation")
    width: Optional[int] = Field(default=512, ge=256, le=1024, description="Image width")
    height: Optional[int] = Field(default=512, ge=256, le=1024, description="Image height")
    seed: Optional[int] = Field(default=None, description="Random seed for reproducibility")

    class Config:
        json_schema_extra = {
            "example": {
                "prompt": "photo of sks person as a futuristic astronaut",
                "user_id": "user_123",
                "num_inference_steps": 30,
                "guidance_scale": 7.5,
                "width": 512,
                "height": 512
            }
        }


class GenerateResponse(BaseModel):
    """Response schema for image generation"""
    model_config = {"protected_namespaces": ()}

    success: bool = Field(..., description="Whether generation was successful")
    message: str = Field(..., description="Status message")
    image_base64: Optional[str] = Field(default=None, description="Generated image encoded in base64")
    image_path: Optional[str] = Field(default=None, description="Path to saved image (if saved locally)")
    model_id: str = Field(..., description="Model ID used for generation")
    generation_time: float = Field(..., description="Time taken for generation in seconds")


class HealthResponse(BaseModel):
    """Response schema for health check"""
    status: str
    device: str
    models_loaded: int


class TrainRequest(BaseModel):
    """Request schema for model training"""
    model_identifier: str = Field(..., description="Unique identifier for the model (e.g., aurel_person)", min_length=3, max_length=30)
    user_id: str = Field(default="default", description="User identifier")
    num_images: int = Field(..., description="Number of images uploaded", ge=10, le=20)

    # Paramètres de training (optionnels avec valeurs par défaut)
    num_train_epochs: Optional[int] = Field(default=100, ge=50, le=500, description="Number of training epochs")
    learning_rate: Optional[float] = Field(default=5e-6, ge=1e-7, le=1e-4, description="Learning rate")
    train_batch_size: Optional[int] = Field(default=1, ge=1, le=4, description="Batch size for training")

    class Config:
        json_schema_extra = {
            "example": {
                "model_identifier": "aurel_person",
                "user_id": "user_123",
                "num_images": 15,
                "num_train_epochs": 100,
                "learning_rate": 5e-6,
                "train_batch_size": 1
            }
        }


class TrainResponse(BaseModel):
    """Response schema for training request"""
    success: bool = Field(..., description="Whether training request was accepted")
    message: str = Field(..., description="Status message")
    model_identifier: str = Field(..., description="Model identifier")
    training_id: Optional[str] = Field(default=None, description="Unique training job ID")
    images_saved: int = Field(..., description="Number of images saved")
    estimated_time_minutes: Optional[int] = Field(default=None, description="Estimated training time in minutes")

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "Training started successfully",
                "model_identifier": "aurel_person",
                "training_id": "train_123456",
                "images_saved": 15,
                "estimated_time_minutes": 45
            }
        }


class TrainingStatusResponse(BaseModel):
    """Response schema for training status check"""
    training_id: str = Field(..., description="Training job ID")
    status: str = Field(..., description="Training status (pending, running, completed, failed)")
    progress: int = Field(..., description="Progress percentage (0-100)", ge=0, le=100)
    message: str = Field(..., description="Current status message")
    model_identifier: Optional[str] = Field(default=None, description="Model identifier")
    user_id: Optional[str] = Field(default=None, description="User identifier")
    started_at: Optional[str] = Field(default=None, description="Training start timestamp")
    completed_at: Optional[str] = Field(default=None, description="Training completion timestamp")
    error: Optional[str] = Field(default=None, description="Error message if failed")

    class Config:
        json_schema_extra = {
            "example": {
                "training_id": "train_123456",
                "status": "running",
                "progress": 65,
                "message": "Training in progress...",
                "model_identifier": "aurel_person",
                "user_id": "user_123",
                "started_at": "2025-01-09T10:30:00",
                "completed_at": None,
                "error": None
            }
        }
