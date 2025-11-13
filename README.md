# Clone Photo AI

> A full-stack AI photo cloning application using Stable Diffusion and DreamBooth

Generate personalized images of yourself using a fine-tuned Stable Diffusion model. This project combines a FastAPI backend with a React frontend to create a seamless AI image generation experience.

---

## What This Does

This app lets you generate custom images using AI. Think of it as "Stable Diffusion, but trained on specific photos." You can create images like:

- "photo of Aurel person as an astronaut in space"
- "photo of Aurel person reading in a cozy library"
- "photo of Aurel person as a superhero with cape"

The AI model has been fine-tuned using DreamBooth to recognize specific trigger words (`Aurel person` or `sks person`).

---

## Quick Start

### Prerequisites

Before you begin, make sure you have:

- **Python 3.8+** (check with `python --version`)
- **Node.js 18+** (check with `node --version`)
- **4GB+ RAM** (8GB recommended)
- **GPU optional** (speeds up generation from 3 minutes to 15 seconds)

### Installation (5 Minutes)

#### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd ClonePhotoAI
```

#### Step 2: Install Backend Dependencies

```bash
cd api
pip install -r requirements.txt
```

**What this does**: Installs Python packages like FastAPI, PyTorch, and Diffusers.

#### Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

**What this does**: Installs React, Vite, Tailwind CSS, and other frontend tools.

#### Step 4: Configure Frontend

Create a `.env` file in the `frontend/` directory:

```bash
echo "VITE_API_URL=http://localhost:8000" > .env
```

**What this does**: Tells the frontend where to find the API.

#### Step 5: Start the Backend

```bash
cd ../api
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Keep this terminal open!** The API needs to run in the background.

#### Step 6: Start the Frontend

Open a **new terminal** window:

```bash
cd frontend
npm run dev
```

You should see:
```
  Local:   http://localhost:3000/
```

#### Step 7: Open Your Browser

Visit **http://localhost:3000**

You should see the image generator interface!

---

## Usage Examples

### Using the Web Interface (Easiest)

1. Open http://localhost:3000 in your browser
2. Type a prompt: `"photo of Aurel person as a superhero"`
3. (Optional) Adjust advanced settings:
   - **Steps**: More steps = better quality (but slower)
   - **Guidance Scale**: Higher = closer to prompt (7.5 is good default)
   - **Seed**: Use same number to reproduce images
4. Click **"Generate Image"**
5. Wait 2-5 minutes (CPU) or 10-15 seconds (GPU)
6. Download your image!

### Using the API Directly

#### Generate Image (Returns Base64)

```bash
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "photo of Aurel person as a futuristic astronaut",
    "user_id": "default",
    "num_inference_steps": 30,
    "guidance_scale": 7.5
  }'
```

#### Generate Image (Returns PNG File)

```bash
curl -X POST http://localhost:8000/generate/image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "photo of Aurel person in professional attire",
    "num_inference_steps": 30
  }' \
  --output image.png
```

#### Check API Health

```bash
curl http://localhost:8000/health
```

**Response:**
```json
{
  "status": "healthy",
  "device": "cpu",
  "models_loaded": 1
}
```

---

## API Endpoints

### 📍 `POST /generate`

Generate an image and return it as base64-encoded JSON.

**Request Body:**
```json
{
  "prompt": "photo of sks person as a superhero",
  "user_id": "default",
  "num_inference_steps": 30,
  "guidance_scale": 7.5,
  "seed": null
}
```

**Response:**
```json
{
  "image": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "metadata": {
    "prompt": "photo of sks person as a superhero",
    "model_id": "Aurel_diffusers",
    "seed": 42,
    "generation_time": 145.2
  }
}
```

### 📍 `POST /generate/image`

Generate an image and return it as a PNG file (binary).

**Request Body:** Same as `/generate`

**Response:** PNG image binary data

### 📍 `GET /health`

Check if the API is running and which device it's using.

**Response:**
```json
{
  "status": "healthy",
  "device": "cpu",
  "models_loaded": 1
}
```

### 📍 `DELETE /cache`

Clear the model cache (forces reload on next generation).

**Response:**
```json
{
  "status": "success",
  "message": "Model cache cleared"
}
```

### 📍 `GET /docs`

Interactive API documentation (Swagger UI).

Visit: http://localhost:8000/docs

---

## Project Structure

```
ClonePhotoAI/
├── api/                          # Backend (FastAPI + AI Model)
│   ├── main.py                   # FastAPI app and routes
│   ├── model_service.py          # Loads and manages AI models
│   ├── schemas.py                # Data validation (Pydantic)
│   ├── config.py                 # Configuration settings
│   ├── requirements.txt          # Python dependencies
│   └── output/                   # Generated images saved here
│
├── frontend/                     # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImageGenerator.jsx   # Main UI component
│   │   │   ├── ImageDisplay.jsx     # Shows generated images
│   │   │   └── LoadingSpinner.jsx   # Loading animation
│   │   ├── services/
│   │   │   └── api.js               # API client (axios)
│   │   ├── App.jsx                  # Root component
│   │   └── main.jsx                 # Entry point
│   ├── package.json              # Node dependencies
│   └── .env                      # Environment variables
│
├── Aurel_diffusers/              # Fine-tuned Stable Diffusion model
├── Photos/                       # Training photos used for fine-tuning
├── TESTING_GUIDE.md              # Comprehensive testing guide
└── README.md                     # You are here!
```

---

## Understanding the Code

### Backend Flow (api/main.py)

1. **User sends request** to `/generate` with a prompt
2. **FastAPI receives** and validates the request using Pydantic schemas
3. **Model Service** checks if the model is cached:
   - If yes → use cached model
   - If no → load from `Aurel_diffusers/` or download from HuggingFace
4. **Generate image** using Stable Diffusion pipeline
5. **Save to disk** in `api/output/`
6. **Convert to base64** and return to user

### Frontend Flow (ImageGenerator.jsx)

1. **User enters prompt** and clicks "Generate"
2. **API service** sends POST request to backend
3. **Progress simulation** starts (since backend doesn't stream progress)
4. **Wait for response** (can take 2-5 minutes)
5. **Display image** using ImageDisplay component
6. **Allow download** as PNG file

### Model Service Pattern (api/model_service.py)

```python
# Simplified version
class ModelService:
    def __init__(self):
        self.models = {}  # Cache models here

    def load_model(self, model_id):
        if model_id not in self.models:
            # Load from disk or HuggingFace
            self.models[model_id] = StableDiffusionPipeline.from_pretrained(model_id)
        return self.models[model_id]

    def generate_image(self, prompt, model_id):
        model = self.load_model(model_id)
        return model(prompt).images[0]
```

**Why cache?** Loading a model takes 30+ seconds. Caching means subsequent generations are instant.

---

## Troubleshooting

### Problem: API won't start

**Error:** `ModuleNotFoundError: No module named 'fastapi'`

**Solution:**
```bash
cd api
pip install -r requirements.txt
```

---

### Problem: Frontend shows "API Disconnected"

**Check 1:** Is the API running?
```bash
curl http://localhost:8000/health
```

**Check 2:** Is `.env` configured correctly?
```bash
cat frontend/.env
# Should show: VITE_API_URL=http://localhost:8000
```

**Check 3:** CORS issues? Check `api/main.py` line 50:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Should allow localhost:3000
)
```

---

### Problem: Image generation is very slow

**On CPU:** This is normal! Expect 2-5 minutes per image.

**To speed up:**
- Reduce `num_inference_steps` from 30 to 20
- Use a GPU with CUDA (reduces to 10-15 seconds)
- Lower resolution (not currently configurable in UI)

---

### Problem: "Model not found" error

**What's happening:** First generation downloads the model (~2GB) from HuggingFace or loads from disk.

**Solution:** Wait 5-10 minutes for the download to complete. Check logs in the API terminal.

---

### Problem: Out of memory

**Error:** `RuntimeError: CUDA out of memory`

**Solution:**
```python
# In api/config.py, reduce batch size or use CPU
DEVICE = "cpu"  # Force CPU usage
```

---

## Configuration

### Backend Configuration (api/config.py)

```python
# Model to use (local or HuggingFace)
DEFAULT_MODEL_ID = str(BASE_DIR / "Aurel_diffusers")  # Local model
# DEFAULT_MODEL_ID = "Zhurah/sd15-dreambooth-photoai"  # Remote model

# Generation defaults
DEFAULT_NUM_INFERENCE_STEPS = 30  # More = better quality
DEFAULT_GUIDANCE_SCALE = 7.5      # How closely to follow prompt
DEFAULT_IMAGE_WIDTH = 512         # Output width
DEFAULT_IMAGE_HEIGHT = 512        # Output height

# Device selection
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
```

### Frontend Configuration (frontend/.env)

```env
VITE_API_URL=http://localhost:8000
```

**For production:**
```env
VITE_API_URL=https://your-api-domain.com
```

---

## Testing

### Test API Only

```bash
cd api
python test_api.py
```

**What this tests:**
- API health endpoint
- Image generation
- Response format validation

### Test Frontend Only

```bash
cd frontend
npm run dev
```

Open http://localhost:3000 and check:
- Green badge = "API Connected"
- Red badge = "API Disconnected" (start the backend!)

### Full Integration Test

Follow the comprehensive guide: **[TESTING_GUIDE.md](TESTING_GUIDE.md)**

---

## Performance

### Generation Times

| Hardware | Steps | Resolution | Time |
|----------|-------|------------|------|
| CPU | 20 | 512x512 | ~2-3 min |
| CPU | 30 | 512x512 | ~3-5 min |
| GPU (RTX 3060) | 20 | 512x512 | ~8-10s |
| GPU (RTX 3060) | 30 | 512x512 | ~12-15s |

### Optimizations Applied

- **Model caching**: Keeps model in memory (no reload)
- **Attention slicing**: Reduces memory on CPU
- **torch.float16**: Faster on GPU
- **xformers**: Advanced attention mechanism (GPU)
- **Safety checker disabled**: Faster generation (personal use)

---

## Contributing

This is an educational project. Contributions are welcome!

### How to Contribute

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/ClonePhotoAI.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-new-feature
   ```

3. **Make your changes**
   - Write clear, commented code
   - Follow existing code style
   - Test your changes locally

4. **Commit your changes**
   ```bash
   git commit -m "Add amazing new feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/amazing-new-feature
   ```

6. **Open a Pull Request**
   - Describe what you changed
   - Explain why it's useful
   - Include screenshots if relevant

### Code Style Guidelines

**Python (Backend):**
- Follow PEP 8
- Use type hints: `def generate(prompt: str) -> dict:`
- Add docstrings to functions
- Keep functions small and focused

**JavaScript (Frontend):**
- Use functional components (not classes)
- Use descriptive variable names: `isLoading` not `loading`
- Add comments for complex logic
- Keep components under 200 lines

### Areas to Contribute

- 🐛 **Bug fixes**: Fix issues in the issue tracker
- 📝 **Documentation**: Improve README or add tutorials
- ✨ **Features**: Add negative prompts, image-to-image, etc.
- 🎨 **UI/UX**: Improve the frontend design
- ⚡ **Performance**: Optimize generation speed
- 🧪 **Tests**: Add more test coverage

---

## Technologies Used

### Backend
- **FastAPI**: Modern Python web framework
- **Diffusers**: HuggingFace's Stable Diffusion library
- **PyTorch**: Deep learning framework
- **Pydantic**: Data validation
- **Uvicorn**: ASGI server

### Frontend
- **React 18**: UI library
- **Vite**: Fast build tool
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client

### AI/ML
- **Stable Diffusion v1.5**: Image generation model
- **DreamBooth**: Fine-tuning technique
- **HuggingFace Hub**: Model hosting

---

## License

This is an educational project. Use for learning purposes.

---

## Acknowledgments

- **HuggingFace** for the Diffusers library
- **Stability AI** for Stable Diffusion
- **FastAPI** for the amazing framework
- **React** and **Vite** teams for frontend tools

---

## Support

Need help?

1. Check the **[TESTING_GUIDE.md](TESTING_GUIDE.md)** for detailed troubleshooting
2. Read the API docs: http://localhost:8000/docs
3. Open an issue on GitHub with:
   - Error message
   - Steps to reproduce
   - Your OS and Python/Node versions

---

**Built for learning AI and full-stack development** 🚀
