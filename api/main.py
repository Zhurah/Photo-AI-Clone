"""
FastAPI application for Stable Diffusion image generation
"""
import base64
import io
import time
import logging
import uuid
from datetime import datetime
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import Response, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from schemas import GenerateRequest, GenerateResponse, HealthResponse, TrainRequest, TrainResponse, TrainingStatusResponse
from model_service import model_service
from storage_service import storage_service
from training_service import training_service
from config import OUTPUT_DIR, HOST, PORT, TRAINING_CONFIG

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    # Startup
    logger.info("🚀 Starting Stable Diffusion API")
    logger.info(f"📱 Device: {model_service.device}")
    logger.info(f"🎨 Default model: {model_service.get_model_id('default')}")

    yield

    # Shutdown
    logger.info("🛑 Shutting down Stable Diffusion API")
    model_service.clear_cache()


# Initialize FastAPI app
app = FastAPI(
    title="Stable Diffusion API",
    description="API for generating personalized images with fine-tuned Stable Diffusion models",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, spécifier les origins autorisées
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "Stable Diffusion API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "generate": "/generate",
            "generate_image": "/generate/image",
            "docs": "/docs"
        }
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        device=model_service.device,
        models_loaded=model_service.get_loaded_models_count()
    )


@app.post("/generate", response_model=GenerateResponse, tags=["Generation"])
async def generate_image_base64(request: GenerateRequest):
    """
    Generate an image and return it as base64-encoded JSON response

    Args:
        request: Generation request parameters

    Returns:
        JSON response with base64-encoded image
    """
    try:
        start_time = time.time()

        logger.info(f"📝 Generation request from user: {request.user_id}")
        logger.info(f"💬 Prompt: {request.prompt}")

        # Generate image
        image, model_id = model_service.generate_image(
            user_id=request.user_id,
            prompt=request.prompt,
            num_inference_steps=request.num_inference_steps,
            guidance_scale=request.guidance_scale,
            width=request.width,
            height=request.height,
            seed=request.seed
        )

        # Save image locally (optional, for debugging)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        image_filename = f"{request.user_id}_{timestamp}.png"
        image_path = OUTPUT_DIR / image_filename
        image.save(image_path)

        # Convert image to base64
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode()

        generation_time = time.time() - start_time

        logger.info(f"✅ Image generated in {generation_time:.2f}s")
        logger.info(f"💾 Saved to: {image_path}")

        return GenerateResponse(
            success=True,
            message="Image generated successfully",
            image_base64=img_base64,
            image_path=str(image_path),
            model_id=model_id,
            generation_time=generation_time
        )

    except Exception as e:
        logger.error(f"❌ Error generating image: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate/image", tags=["Generation"])
async def generate_image_binary(request: GenerateRequest):
    """
    Generate an image and return it as binary PNG response

    Args:
        request: Generation request parameters

    Returns:
        PNG image as binary response
    """
    try:
        start_time = time.time()

        logger.info(f"📝 Image generation request from user: {request.user_id}")
        logger.info(f"💬 Prompt: {request.prompt}")

        # Generate image
        image, model_id = model_service.generate_image(
            user_id=request.user_id,
            prompt=request.prompt,
            num_inference_steps=request.num_inference_steps,
            guidance_scale=request.guidance_scale,
            width=request.width,
            height=request.height,
            seed=request.seed
        )

        # Convert image to bytes
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        buffered.seek(0)

        generation_time = time.time() - start_time
        logger.info(f"✅ Image generated in {generation_time:.2f}s")

        # Return image as streaming response
        return StreamingResponse(
            buffered,
            media_type="image/png",
            headers={
                "X-Model-Used": model_id,
                "X-Generation-Time": str(generation_time)
            }
        )

    except Exception as e:
        logger.error(f"❌ Error generating image: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/cache", tags=["Management"])
async def clear_cache():
    """Clear model cache"""
    try:
        model_service.clear_cache()
        return {"success": True, "message": "Cache cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/train", response_model=TrainResponse, tags=["Training"], status_code=202)
async def train_model(
    background_tasks: BackgroundTasks,
    model_identifier: str = Form(..., description="Unique model identifier"),
    user_id: str = Form(default="default", description="User identifier"),
    num_train_epochs: int = Form(default=100, description="Number of training epochs"),
    learning_rate: float = Form(default=5e-6, description="Learning rate"),
    train_batch_size: int = Form(default=1, description="Batch size"),
    images: List[UploadFile] = File(..., description="Training images (10-20 images)")
):
    """
    Train a new personalized Stable Diffusion model with uploaded images

    Args:
        model_identifier: Unique name for the model (e.g., aurel_person)
        user_id: User identifier
        num_train_epochs: Number of training epochs (50-500)
        learning_rate: Learning rate (1e-7 to 1e-4)
        train_batch_size: Batch size (1-4)
        images: List of training images (10-20 required)

    Returns:
        TrainResponse with training job details
    """
    try:
        start_time = time.time()

        # Validation
        num_images = len(images)
        logger.info(f"🎯 Training request received")
        logger.info(f"   - Model identifier: {model_identifier}")
        logger.info(f"   - User ID: {user_id}")
        logger.info(f"   - Number of images: {num_images}")
        logger.info(f"   - Epochs: {num_train_epochs}")
        logger.info(f"   - Learning rate: {learning_rate}")

        # Valider le nombre d'images
        if num_images < 10:
            raise HTTPException(
                status_code=400,
                detail=f"Minimum 10 images required. Received: {num_images}"
            )
        if num_images > 20:
            raise HTTPException(
                status_code=400,
                detail=f"Maximum 20 images allowed. Received: {num_images}"
            )

        # Valider l'identifiant du modèle
        if not model_identifier or len(model_identifier) < 3:
            raise HTTPException(
                status_code=400,
                detail="Model identifier must be at least 3 characters"
            )

        # Créer un ID unique pour ce job de training
        training_id = f"train_{uuid.uuid4().hex[:8]}"

        # Lire et préparer les images
        images_data = []
        total_size = 0

        for image in images:
            # Vérifier que c'est bien une image
            if not image.content_type.startswith('image/'):
                logger.warning(f"⚠️  Skipping non-image file: {image.filename}")
                continue

            # Lire le contenu
            contents = await image.read()
            total_size += len(contents)

            # Vérifier la taille de l'image
            max_size = TRAINING_CONFIG["max_image_size_mb"] * 1024 * 1024
            if len(contents) > max_size:
                raise HTTPException(
                    status_code=400,
                    detail=f"Image {image.filename} is too large: {len(contents) / 1024 / 1024:.2f} MB > {TRAINING_CONFIG['max_image_size_mb']} MB"
                )

            images_data.append((image.filename, contents))

        # Vérifier la taille totale
        max_total = TRAINING_CONFIG["max_total_size_mb"] * 1024 * 1024
        if total_size > max_total:
            raise HTTPException(
                status_code=400,
                detail=f"Total size too large: {total_size / 1024 / 1024:.2f} MB > {TRAINING_CONFIG['max_total_size_mb']} MB"
            )

        # Vérifier les limites de stockage de l'utilisateur
        if not storage_service.validate_storage_limits(user_id, total_size):
            raise HTTPException(
                status_code=400,
                detail=f"Storage limit exceeded for user {user_id}"
            )

        # Sauvegarder les images via le storage service
        training_metadata = {
            "training_id": training_id,
            "num_train_epochs": num_train_epochs,
            "learning_rate": learning_rate,
            "train_batch_size": train_batch_size,
            "status": "pending"
        }

        storage_result = storage_service.save_training_images(
            user_id=user_id,
            model_identifier=model_identifier,
            images=images_data,
            metadata=training_metadata
        )

        saved_count = storage_result["num_images"]
        logger.info(f"✅ Saved {saved_count}/{num_images} images successfully")

        # Estimer le temps de training (très approximatif)
        # En réalité, ça dépend énormément du GPU/CPU
        estimated_time = num_train_epochs * 0.5  # ~0.5 min par epoch (très optimiste)

        processing_time = time.time() - start_time

        logger.info(f"📦 Training data prepared in {processing_time:.2f}s")
        logger.info(f"🚀 Training job created: {training_id}")
        logger.info(f"⏱️  Estimated training time: {int(estimated_time)} minutes")

        # Launch DreamBooth training in background
        background_tasks.add_task(
            training_service.start_training,
            user_id=user_id,
            model_identifier=model_identifier,
            training_id=training_id,
            num_train_epochs=num_train_epochs,
            learning_rate=learning_rate,
            train_batch_size=train_batch_size,
            resolution=512,
            use_lora=False  # Use full DreamBooth fine-tuning
        )

        logger.info(f"✅ DreamBooth training job queued in background")

        return TrainResponse(
            success=True,
            message=f"DreamBooth training started for model '{model_identifier}'. Use GET /train/{training_id}/status to track progress.",
            model_identifier=model_identifier,
            training_id=training_id,
            images_saved=saved_count,
            estimated_time_minutes=int(estimated_time)
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error in training endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/train/{training_id}/status", response_model=TrainingStatusResponse, tags=["Training"])
async def get_training_status(training_id: str):
    """
    Get the status of a training job

    Args:
        training_id: Unique training job identifier

    Returns:
        TrainingStatusResponse with current training status
    """
    try:
        logger.info(f"📊 Status check for training: {training_id}")

        status_info = training_service.get_training_status(training_id)

        if not status_info:
            raise HTTPException(
                status_code=404,
                detail=f"Training job not found: {training_id}"
            )

        return TrainingStatusResponse(
            training_id=status_info.get("training_id"),
            status=status_info.get("status", "unknown"),
            progress=status_info.get("progress", 0),
            message=status_info.get("message", ""),
            model_identifier=status_info.get("model_identifier"),
            user_id=status_info.get("user_id"),
            started_at=status_info.get("started_at"),
            completed_at=status_info.get("completed_at"),
            error=status_info.get("error")
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error checking training status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=HOST, port=PORT, log_level="info")
