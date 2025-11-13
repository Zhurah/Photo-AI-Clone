# 🚀 Guide de Démarrage Rapide

## Installation en 3 étapes

### 1️⃣ Installer les dépendances

```bash
cd api
pip install -r requirements.txt
```

### 2️⃣ Démarrer l'API

```bash
python main.py
```

ou

```bash
./start.sh
```

### 3️⃣ Tester l'API

Ouvrez un nouveau terminal et lancez:

```bash
python test_api.py
```

## 🎯 Premier Test Manuel

### Test 1: Health Check

```bash
curl http://localhost:8000/health
```

### Test 2: Générer une Image

```bash
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "photo of sks person as a futuristic astronaut",
    "user_id": "default"
  }'
```

### Test 3: Télécharger l'Image

```bash
curl -X POST http://localhost:8000/generate/image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "photo of sks person smiling",
    "user_id": "default"
  }' \
  --output test_image.png
```

## 📚 Documentation Interactive

Une fois l'API lancée, accédez à:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🧪 Tests avec Postman

1. Ouvrez Postman
2. Importez le fichier `postman_collection.json`
3. Exécutez les requêtes de la collection

## ⚡ Options de Génération

### Génération Rapide (pour tests)

```json
{
  "prompt": "photo of sks person",
  "num_inference_steps": 20,
  "guidance_scale": 7.5
}
```

### Génération Haute Qualité

```json
{
  "prompt": "photo of sks person in professional attire, high quality, detailed",
  "num_inference_steps": 50,
  "guidance_scale": 8.5
}
```

### Génération Reproductible

```json
{
  "prompt": "photo of sks person smiling",
  "seed": 42
}
```

## 🐛 Problèmes Courants

### L'API ne démarre pas

**Erreur:** `ModuleNotFoundError: No module named 'fastapi'`

✅ Solution:
```bash
pip install -r requirements.txt
```

### Le modèle ne se télécharge pas

**Erreur:** `Connection timeout` ou `Model not found`

✅ Solution:
- Vérifiez votre connexion internet
- Attendez la fin du téléchargement (peut prendre 5-10 min pour le premier lancement)
- Le modèle HuggingFace: https://huggingface.co/Zhurah/sd15-dreambooth-photoai

### Génération très lente

✅ Solution:
- Sur CPU, la génération prend 2-5 minutes
- Réduisez `num_inference_steps` à 20 pour tester
- Utilisez un GPU pour accélérer (10-15s)

## 📊 Structure des Fichiers

```
api/
├── main.py              # 🎯 Démarrer l'API
├── test_api.py         # 🧪 Tests automatiques
├── config.py           # ⚙️  Configuration
├── schemas.py          # 📝 Modèles de données
├── model_service.py    # 🤖 Gestion des modèles
├── requirements.txt    # 📦 Dépendances
├── start.sh           # 🚀 Script de démarrage
├── output/            # 📁 Images générées
└── test_output/       # 📁 Images de test
```

## 🎨 Exemples de Prompts

```json
{"prompt": "photo of sks person as a futuristic astronaut"}
{"prompt": "photo of sks person in professional suit"}
{"prompt": "photo of sks person reading a book"}
{"prompt": "photo of sks person as a superhero"}
{"prompt": "photo of sks person with artistic lighting"}
```

## 📖 Documentation Complète

Pour plus de détails, consultez [README.md](README.md)

## 🎓 Prochaines Étapes

1. ✅ Testez les différents endpoints
2. ✅ Expérimentez avec différents prompts
3. ✅ Ajustez les paramètres de génération
4. ✅ Consultez la documentation interactive sur `/docs`
5. ✅ Intégrez avec votre frontend ou application

---

**Besoin d'aide?** Consultez le [README.md](README.md) pour plus de détails!
