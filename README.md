# Clone Photo AI

Generate AI photos of yourself using a fine-tuned Stable Diffusion model. This full-stack application uses DreamBooth to create personalized images from text prompts.

## What This Does

This app lets you generate custom photos using AI. It consists of:
- **Backend**: FastAPI server that runs a fine-tuned Stable Diffusion model
- **Frontend**: React web interface to create images
- **Model**: Pre-trained AI model that generates photos based on your prompts

## Prerequisites

Before you start, make sure you have:
- Python 3.8 or higher
- Node.js 16 or higher
- npm (comes with Node.js)
- (Optional) NVIDIA GPU with CUDA for faster generation

## Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ClonePhotoAI
```

### 2. Set Up the Backend

```bash
cd api
pip install -r requirements.txt
```

**Note**: The first time you run the API, it will load the model from the `Aurel_diffusers/` folder. This takes 10-30 seconds.

### 3. Set Up the Frontend

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```bash
VITE_API_URL=http://localhost:8000
```

## Usage

### Starting the Application

You need two terminal windows open:

**Terminal 1 - Start the Backend:**
```bash
cd api
python main.py
```

The API will start at `http://localhost:8000`

**Terminal 2 - Start the Frontend:**
```bash
cd frontend
npm run dev
```

The web app will open at `http://localhost:3000`

### Generating Your First Image

1. Open `http://localhost:3000` in your browser
2. Enter a prompt like: `"Aurel person wearing a red jacket in Paris"`
3. Adjust settings (optional):
   - **Steps**: 20-50 (higher = better quality, slower)
   - **Guidance Scale**: 7-10 (how closely to follow the prompt)
   - **Seed**: Leave random or set a number for reproducible results
4. Click "Generate Image"
5. Wait 10-15 seconds (GPU) or 2-5 minutes (CPU)
6. Download your generated image

**Important**: Your prompts must include `"Aurel person"` or `"sks person"` to activate the fine-tuned model.

## API Endpoints

### Health Check
```http
GET /health
```

Returns API status and what models are loaded.

**Example Response:**
```json
{
  "status": "healthy",
  "device": "cuda",
  "models_loaded": 1
}
```

### Generate Image (JSON)
```http
POST /generate
```

Returns a base64-encoded image in JSON format.

**Request Body:**
```json
{
  "prompt": "Aurel person wearing sunglasses",
  "num_inference_steps": 30,
  "guidance_scale": 7.5,
  "width": 512,
  "height": 512,
  "seed": null,
  "user_id": "default"
}
```

**Response:**
```json
{
  "image": "base64_encoded_image_string",
  "model_id": "Aurel_diffusers",
  "generation_time": 12.5,
  "seed": 42
}
```

### Generate Image (Direct PNG)
```http
POST /generate/image
```

Returns the image directly as a PNG file (better for downloading).

**Request Body:** Same as `/generate`

### Clear Model Cache
```http
DELETE /cache
```

Clears loaded models from memory. Use this if you want to reload the model.

## Project Structure

```
ClonePhotoAI/
├── api/                    # Backend API
│   ├── main.py            # FastAPI routes
│   ├── model_service.py   # Model loading and generation logic
│   ├── config.py          # Configuration (model paths, defaults)
│   ├── schemas.py         # Request/response models
│   └── output/            # Generated images saved here
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   └── services/     # API communication
│   └── .env              # Environment config
└── Aurel_diffusers/      # Fine-tuned Stable Diffusion model
```

## Common Issues

### "Model not found" error
- Make sure the `Aurel_diffusers/` folder exists in the project root
- Check that `api/config.py` line 25 points to the correct path

### Frontend can't connect to API
- Make sure both backend and frontend are running
- Check that `.env` file exists in `frontend/` with the correct API URL
- Verify the backend is running on port 8000

### Out of memory errors
- Lower the image size (try 256x256 instead of 512x512)
- Reduce `num_inference_steps` to 20
- Close other programs to free up RAM

### Generation is very slow
- This is normal on CPU (2-5 minutes per image)
- For faster results, use a GPU with CUDA
- First request is always slower because it loads the model

## Testing

### Test the API Only
```bash
cd api
python test_api.py
```

### Test with curl
```bash
# Health check
curl http://localhost:8000/health

# Generate image
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Aurel person smiling", "num_inference_steps": 20}'
```

## Contributing

We welcome contributions! Here's how to get started:

### 1. Fork and Clone
```bash
git fork <repo-url>
git clone <your-fork-url>
cd ClonePhotoAI
```

### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
```

### 3. Make Your Changes

Follow these guidelines:
- Write clear commit messages
- Add comments to complex code
- Test your changes before committing
- Keep the code style consistent

### 4. Test Your Changes

Make sure everything still works:
```bash
# Test the backend
cd api
python test_api.py

# Test the frontend
cd frontend
npm run build
```

### 5. Submit a Pull Request

1. Push your branch to your fork
2. Open a Pull Request on the main repository
3. Describe what you changed and why
4. Wait for review

### Code Style

- **Python**: Follow PEP 8 style guide
- **JavaScript**: Use ES6+ features
- **React**: Functional components with hooks

### What to Contribute

Ideas for contributions:
- Bug fixes
- UI improvements
- New features (like image-to-image generation)
- Better error handling
- Documentation improvements
- Performance optimizations

## License

[Add your license here]

## Support

If you encounter issues:
1. Check the "Common Issues" section above
2. Review `CLAUDE.md` for detailed technical documentation
3. Open an issue on GitHub with details about your problem

## Credits

Built with:
- [Stable Diffusion](https://github.com/CompVis/stable-diffusion)
- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [Diffusers](https://github.com/huggingface/diffusers)
