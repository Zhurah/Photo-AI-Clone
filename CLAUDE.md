# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack AI photo cloning application using Stable Diffusion v1.5 fine-tuned with DreamBooth. Consists of three main components: a fine-tuned model, a FastAPI backend, and a React frontend.

## Architecture

### Three-Tier Stack

```
React Frontend (Port 3000)
    ↕ HTTP REST API
FastAPI Backend (Port 8000)
    ↕ Model Loading
Stable Diffusion Model (local or HuggingFace)
```

### Model Configuration Duality

The project has **two model sources** configured:

1. **Local Model** (`api/config.py` line 16): Uses `Aurel_diffusers/` directory (local fine-tuned model)
2. **HuggingFace Model** (README claims): Uses `Zhurah/sd15-dreambooth-photoai` from HuggingFace

**Important**: Check `api/config.py` to see which is active. The `DEFAULT_MODEL_ID` variable determines the source.

### Fine-Tuned Model Structure

If using the local model (`Aurel_diffusers/`), it contains a complete diffusers pipeline:
- `unet/` - Core generative network
- `text_encoder/` - CLIP encoder for prompts
- `vae/` - Image encoding/decoding
- `scheduler/` - PNDM scheduler config
- `safety_checker/` + `feature_extractor/` - Content filtering (disabled in code)

**Trigger Tokens**: Prompts must include `"Aurel person"` or `"sks person"` to activate the fine-tuned weights

## Common Development Commands

### Start Full Stack
```bash
# Terminal 1 - Start API
cd api
python main.py

# Terminal 2 - Start Frontend
cd frontend
npm run dev
```

### Testing
```bash
# Test API only
cd api
python test_api.py

# Test with curl
curl http://localhost:8000/health

# Full integration test guide
# See TESTING_GUIDE.md for comprehensive testing
```

### Build Production Frontend
```bash
cd frontend
npm run build  # outputs to frontend/dist/
```

## Backend Architecture (FastAPI)

### Key Files
- `api/main.py` - FastAPI app, routes, CORS middleware
- `api/model_service.py` - Model caching, loading, generation logic
- `api/schemas.py` - Pydantic request/response models
- `api/config.py` - Model paths, generation defaults, user→model mapping

### Model Service Pattern

The backend uses a singleton service (`model_service.py`) that:
1. **Lazy loads models** - Only downloads/loads when first requested
2. **Caches in memory** - Keeps models loaded across requests
3. **Maps users to models** - `USER_MODELS` dict in `config.py` allows different users to use different fine-tuned models

### Critical API Endpoints
- `POST /generate` - Returns base64-encoded image in JSON
- `POST /generate/image` - Returns PNG binary (streaming response)
- `GET /health` - Returns device, status, models_loaded count
- `DELETE /cache` - Clears model cache (forces reload)

### Model Loading Logic

When a request comes in:
1. Extract `user_id` from request
2. Look up model ID in `USER_MODELS` mapping (defaults to `DEFAULT_MODEL_ID`)
3. Check if model already cached; if not, load with `StableDiffusionPipeline.from_pretrained()`
4. Apply optimizations: attention slicing (CPU), float16 (GPU), disable safety checker
5. Generate image and return

## Frontend Architecture (React + Vite)

### Component Structure
- `ImageGenerator.jsx` - Main orchestrator: handles form, API calls, state management
- `ImageDisplay.jsx` - Displays generated image with metadata and download button
- `LoadingSpinner.jsx` - Animated loading indicator
- `services/api.js` - Axios client with 10-minute timeout, progress simulation

### Key Frontend Patterns

**API Connection Monitoring**: Health check runs on mount and every 30 seconds. Updates badge color (green/red) based on API availability.

**Progress Simulation**: Since backend doesn't stream progress, `api.js` simulates progress:
- 0-30%: Model loading phase (simulated)
- 30-85%: Generation phase (slow random increments)
- 85-100%: Download progress (real from axios)

**Environment Configuration**: API URL comes from `.env` file via Vite's `import.meta.env.VITE_API_URL`

## Model Usage Notes

1. **Prompt Format**: Always include trigger token (`"sks person"` or `"Aurel person"`) for fine-tuned results
2. **Default Parameters**: 30 steps, 7.5 guidance scale (configured in `api/config.py`)
3. **Safety Checker**: Disabled in code (`safety_checker=None`) since this is a personal model
4. **Device Auto-Selection**: Code checks `torch.cuda.is_available()` and uses CPU fallback
5. **First Request Slowness**: First generation downloads model from HuggingFace (if using remote) or loads from disk (if local), which adds 30s-5min depending on connection

## Data Flow Example

When a user generates an image:

1. **Frontend** (`ImageGenerator.jsx`):
   - User enters prompt + parameters
   - Calls `apiService.generateImage()` with payload
   - Starts simulated progress updates

2. **API Service** (`services/api.js`):
   - Sends POST to `/generate` with JSON body
   - 10-minute timeout to handle long generations
   - Transforms snake_case response to camelCase

3. **Backend Route** (`api/main.py` line 84):
   - Receives `GenerateRequest` (validated by Pydantic)
   - Calls `model_service.generate_image()`
   - Saves image to `api/output/`
   - Converts to base64, returns `GenerateResponse`

4. **Model Service** (`api/model_service.py`):
   - Checks cache for model (key: model_id)
   - If not cached, loads via `StableDiffusionPipeline.from_pretrained()`
   - Applies device-specific optimizations
   - Runs generation with provided parameters
   - Returns PIL Image + model_id

5. **Frontend Display** (`ImageDisplay.jsx`):
   - Receives base64 image
   - Displays with metadata (time, model, seed)
   - Provides download as PNG

## Performance Characteristics

**Generation Time**:
- CPU: 2-5 minutes (30 steps, 512x512)
- GPU: 10-15 seconds (30 steps, 512x512)

**First Request Penalty**:
- Local model (`Aurel_diffusers/`): +10-30s load time
- HuggingFace model: +1-5 minutes download time (varies by connection)

**Optimizations Applied**:
- GPU: `torch.float16`, xformers (if available)
- CPU: `enable_attention_slicing()` to reduce memory
- Model caching: Subsequent requests skip loading

## Important Implementation Details

### CORS Configuration
`api/main.py` line 50: `allow_origins=["*"]` for development. **In production, specify allowed origins explicitly**.

### User Model Mapping
To add support for multiple users with different fine-tuned models, edit `api/config.py`:
```python
USER_MODELS = {
    "default": str(BASE_DIR / "Aurel_diffusers"),
    "user_123": "hf_username/model_name",
    "user_456": str(BASE_DIR / "custom_model"),
}
```

### Environment Files
- **Frontend**: Requires `.env` file with `VITE_API_URL=http://localhost:8000`
- **API**: No `.env` required, configuration in `config.py`

### Output Directories
- `api/output/` - All generated images saved here (format: `{user_id}_{timestamp}.png`)
- `frontend/dist/` - Production build output (created by `npm run build`)

## Testing Resources

- `TESTING_GUIDE.md` - Comprehensive step-by-step testing guide
- `api/test_api.py` - Automated API tests
- `api/postman_collection.json` - Postman collection for manual API testing
- `test_stable_diffusion.ipynb` - Notebook for direct model testing (bypasses API)

## Notebooks

- `test_stable_diffusion.ipynb` - Local inference testing with diffusers pipeline
- `fast_stable_diffusion_ComfyUI.ipynb` - Google Colab ComfyUI setup (cloud-based, requires adaptation for local use)
