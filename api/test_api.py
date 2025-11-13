"""
Test script for the Stable Diffusion API
"""
import requests
import base64
import json
from pathlib import Path
from datetime import datetime

# Configuration
API_BASE_URL = "http://localhost:8000"
TEST_OUTPUT_DIR = Path(__file__).parent / "test_output"
TEST_OUTPUT_DIR.mkdir(exist_ok=True)


def test_health():
    """Test health endpoint"""
    print("\n🏥 Testing health endpoint...")
    response = requests.get(f"{API_BASE_URL}/health")

    if response.status_code == 200:
        data = response.json()
        print(f"✅ Health check passed")
        print(f"   Status: {data['status']}")
        print(f"   Device: {data['device']}")
        print(f"   Models loaded: {data['models_loaded']}")
        return True
    else:
        print(f"❌ Health check failed: {response.status_code}")
        return False


def test_generate_base64():
    """Test image generation with base64 response"""
    print("\n🎨 Testing /generate endpoint (base64 response)...")

    payload = {
        "prompt": "photo of sks person as a futuristic astronaut in space",
        "user_id": "user_123",
        "num_inference_steps": 30,
        "guidance_scale": 7.5,
        "width": 512,
        "height": 512,
        "seed": 42
    }

    print(f"   Prompt: {payload['prompt']}")
    print(f"   User ID: {payload['user_id']}")
    print(f"   Waiting for generation...")

    response = requests.post(
        f"{API_BASE_URL}/generate",
        json=payload,
        timeout=300  # 5 minutes timeout
    )

    if response.status_code == 200:
        data = response.json()
        print(f"✅ Generation successful!")
        print(f"   Model used: {data['model_id']}")
        print(f"   Generation time: {data['generation_time']:.2f}s")

        # Save the image
        if data['image_base64']:
            image_data = base64.b64decode(data['image_base64'])
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_path = TEST_OUTPUT_DIR / f"test_base64_{timestamp}.png"

            with open(output_path, "wb") as f:
                f.write(image_data)

            print(f"   Image saved to: {output_path}")
        return True
    else:
        print(f"❌ Generation failed: {response.status_code}")
        print(f"   Error: {response.text}")
        return False


def test_generate_binary():
    """Test image generation with binary response"""
    print("\n🎨 Testing /generate/image endpoint (binary response)...")

    payload = {
        "prompt": "photo of sks person as a professional photographer with camera",
        "user_id": "user_123",
        "num_inference_steps": 25,
        "guidance_scale": 7.5,
        "width": 512,
        "height": 512
    }

    print(f"   Prompt: {payload['prompt']}")
    print(f"   Waiting for generation...")

    response = requests.post(
        f"{API_BASE_URL}/generate/image",
        json=payload,
        timeout=300
    )

    if response.status_code == 200:
        print(f"✅ Generation successful!")
        print(f"   Model used: {response.headers.get('X-Model-Used', 'unknown')}")
        print(f"   Generation time: {response.headers.get('X-Generation-Time', 'unknown')}s")

        # Save the image
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = TEST_OUTPUT_DIR / f"test_binary_{timestamp}.png"

        with open(output_path, "wb") as f:
            f.write(response.content)

        print(f"   Image saved to: {output_path}")
        return True
    else:
        print(f"❌ Generation failed: {response.status_code}")
        print(f"   Error: {response.text}")
        return False


def test_multiple_prompts():
    """Test multiple prompts in sequence"""
    print("\n🎨 Testing multiple prompts...")

    prompts = [
        "photo of sks person in a professional suit",
        "photo of sks person smiling at the camera",
        "photo of sks person with artistic lighting"
    ]

    for i, prompt in enumerate(prompts, 1):
        print(f"\n   [{i}/{len(prompts)}] Generating: {prompt}")

        payload = {
            "prompt": prompt,
            "user_id": "default",
            "num_inference_steps": 20,  # Faster for testing
            "guidance_scale": 7.5
        }

        response = requests.post(
            f"{API_BASE_URL}/generate",
            json=payload,
            timeout=300
        )

        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Generated in {data['generation_time']:.2f}s")
        else:
            print(f"   ❌ Failed: {response.status_code}")


def run_all_tests():
    """Run all test functions"""
    print("=" * 60)
    print("🧪 Starting API Tests")
    print("=" * 60)

    # Test health first
    if not test_health():
        print("\n❌ Health check failed. Make sure the API is running!")
        print("   Run: cd api && python main.py")
        return

    # Run generation tests
    test_generate_base64()
    test_generate_binary()

    # Uncomment to test multiple prompts
    # test_multiple_prompts()

    print("\n" + "=" * 60)
    print("✅ Tests completed!")
    print(f"📁 Check test output in: {TEST_OUTPUT_DIR}")
    print("=" * 60)


if __name__ == "__main__":
    try:
        run_all_tests()
    except requests.exceptions.ConnectionError:
        print("\n❌ Could not connect to API. Make sure it's running!")
        print("   Run: cd api && python main.py")
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
