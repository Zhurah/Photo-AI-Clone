# API Stable Diffusion - Documentation

API FastAPI pour la génération d'images personnalisées avec Stable Diffusion fine-tuné.

## 🚀 Installation

### 1. Installer les dépendances

```bash
cd api
pip install -r requirements.txt
```

### 2. Configuration (Optionnel)

Modifiez `config.py` pour ajuster:
- Les modèles par utilisateur
- Les paramètres de génération par défaut
- Le device (CPU/GPU)

## 🏃 Démarrage de l'API

### Méthode 1: Python direct

```bash
cd api
python main.py
```

### Méthode 2: Uvicorn

```bash
cd api
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

L'API sera accessible sur `http://localhost:8000`

## 📚 Endpoints

### 1. Health Check

**GET** `/health`

Vérifie l'état de l'API.

```bash
curl http://localhost:8000/health
```

Réponse:
```json
{
  "status": "healthy",
  "device": "cpu",
  "models_loaded": 1
}
```

### 2. Génération d'Image (Base64)

**POST** `/generate`

Génère une image et la retourne encodée en base64 dans un JSON.

**Requête:**

```bash
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "photo of sks person as a futuristic astronaut",
    "user_id": "user_123",
    "num_inference_steps": 30,
    "guidance_scale": 7.5,
    "width": 512,
    "height": 512,
    "seed": 42
  }'
```

**Paramètres:**

| Paramètre | Type | Requis | Défaut | Description |
|-----------|------|---------|---------|-------------|
| prompt | string | ✅ | - | Prompt textuel pour la génération |
| user_id | string | ❌ | "default" | Identifiant utilisateur pour sélectionner le modèle |
| num_inference_steps | int | ❌ | 30 | Nombre d'étapes de débruitage (1-150) |
| guidance_scale | float | ❌ | 7.5 | Échelle de guidance (1.0-20.0) |
| width | int | ❌ | 512 | Largeur de l'image (256-1024) |
| height | int | ❌ | 512 | Hauteur de l'image (256-1024) |
| seed | int | ❌ | null | Seed pour la reproductibilité |

**Réponse:**

```json
{
  "success": true,
  "message": "Image generated successfully",
  "image_base64": "iVBORw0KGgoAAAANSUhEUgA...",
  "image_path": "/path/to/output/user_123_20250107_143022.png",
  "model_id": "Zhurah/sd15-dreambooth-photoai",
  "generation_time": 12.45
}
```

### 3. Génération d'Image (Binaire)

**POST** `/generate/image`

Génère une image et la retourne directement en PNG binaire.

**Requête:**

```bash
curl -X POST http://localhost:8000/generate/image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "photo of sks person in a professional suit",
    "user_id": "default",
    "num_inference_steps": 30,
    "guidance_scale": 7.5
  }' \
  --output generated_image.png
```

**Réponse:**

- Type: `image/png`
- Headers:
  - `X-Model-Used`: Modèle utilisé
  - `X-Generation-Time`: Temps de génération en secondes

### 4. Vider le Cache

**DELETE** `/cache`

Vide le cache des modèles pour libérer la mémoire.

```bash
curl -X DELETE http://localhost:8000/cache
```

## 🧪 Tests

### Script de Test Python

```bash
cd api
python test_api.py
```

Ce script teste automatiquement tous les endpoints et sauvegarde les images générées dans `api/test_output/`.

### Test Manuel avec curl

#### 1. Test Health

```bash
curl http://localhost:8000/health
```

#### 2. Génération Simple

```bash
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "photo of sks person as an astronaut",
    "user_id": "default"
  }' | jq '.message, .generation_time'
```

#### 3. Télécharger l'Image Générée

```bash
curl -X POST http://localhost:8000/generate/image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "photo of sks person smiling",
    "user_id": "default",
    "seed": 123
  }' \
  --output my_image.png
```

## 🎨 Exemples de Prompts

Voici des exemples de prompts qui fonctionnent bien avec le modèle fine-tuné:

```json
{
  "prompt": "photo of sks person as a futuristic astronaut in space"
}
```

```json
{
  "prompt": "photo of sks person in professional business attire, studio lighting"
}
```

```json
{
  "prompt": "photo of sks person as a superhero, cinematic lighting"
}
```

```json
{
  "prompt": "photo of sks person reading a book in a cozy library"
}
```

**Note:** Le token `sks person` est important pour activer le modèle fine-tuné. Vous pouvez aussi utiliser `Aurel person` selon votre configuration.

## 🔧 Configuration Avancée

### Ajouter des Modèles Personnalisés par Utilisateur

Éditez `config.py`:

```python
USER_MODELS = {
    "default": "Zhurah/sd15-dreambooth-photoai",
    "user_123": "Zhurah/sd15-dreambooth-photoai",
    "user_456": "path/to/another/model",
    # Ajoutez d'autres mappings ici
}
```

### Optimisation des Performances

#### GPU (CUDA)

Pour utiliser le GPU, assurez-vous d'avoir PyTorch avec support CUDA:

```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

L'API détectera automatiquement le GPU et l'utilisera.

#### CPU

Sur CPU, l'API active automatiquement l'attention slicing pour réduire l'utilisation mémoire.

### Variables d'Environnement

Créez un fichier `.env` (optionnel):

```env
USE_GPU=true
HOST=0.0.0.0
PORT=8000
```

## 📊 Structure du Projet

```
api/
├── main.py              # Application FastAPI principale
├── config.py            # Configuration
├── schemas.py           # Schémas Pydantic
├── model_service.py     # Service de gestion des modèles
├── requirements.txt     # Dépendances
├── test_api.py         # Script de test
├── README.md           # Documentation
├── output/             # Images générées
└── test_output/        # Images de test
```

## 🐛 Dépannage

### Erreur: "Could not connect to API"

✅ **Solution:** Assurez-vous que l'API est démarrée avec `python main.py`

### Erreur: "CUDA out of memory"

✅ **Solution:**
- Réduisez `width` et `height` (ex: 256 ou 384)
- Réduisez `num_inference_steps` (ex: 20)
- Utilisez CPU en désactivant CUDA

### Génération très lente

✅ **Solution:**
- Utilisez un GPU si disponible
- Réduisez `num_inference_steps` pour des tests rapides
- Le premier appel est plus lent (chargement du modèle), les suivants sont plus rapides (cache)

### Modèle HuggingFace ne se télécharge pas

✅ **Solution:**
- Vérifiez votre connexion internet
- Assurez-vous que le modèle est public: https://huggingface.co/Zhurah/sd15-dreambooth-photoai
- Vérifiez les credentials HuggingFace si nécessaire

## 📝 Notes

- Les images générées sont sauvegardées dans `api/output/`
- Le modèle est mis en cache après le premier chargement
- Les temps de génération dépendent du device (GPU ~10-15s, CPU ~2-5min)
- L'endpoint `/generate` retourne le JSON avec base64
- L'endpoint `/generate/image` retourne directement le PNG

## 🚀 Prochaines Étapes

1. **Intégration S3:** Sauvegarder les images sur AWS S3 et retourner des URLs
2. **Base de données:** Tracker les générations et les utilisateurs
3. **Queue system:** Utiliser Celery/Redis pour gérer les requêtes longues
4. **Authentification:** Ajouter JWT ou API keys
5. **Rate limiting:** Limiter le nombre de requêtes par utilisateur
6. **Monitoring:** Ajouter Prometheus/Grafana pour le monitoring

## 📄 Licence

Projet éducatif - Clone Photo AI
