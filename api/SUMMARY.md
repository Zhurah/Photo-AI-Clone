# 📦 API Stable Diffusion - Résumé du Projet

## ✅ Fonctionnalités Implémentées

### 1. Endpoints API
- ✅ `POST /generate` - Génération avec réponse JSON base64
- ✅ `POST /generate/image` - Génération avec réponse binaire PNG
- ✅ `GET /health` - Vérification de l'état de l'API
- ✅ `GET /` - Endpoint racine avec informations
- ✅ `DELETE /cache` - Nettoyage du cache

### 2. Fonctionnalités Techniques
- ✅ **Chargement de modèle HuggingFace**: `Zhurah/sd15-dreambooth-photoai`
- ✅ **Mise en cache intelligente**: Les modèles sont chargés une fois et mis en cache
- ✅ **Support multi-utilisateurs**: Mapping `user_id` → `model_id`
- ✅ **Détection GPU/CPU automatique**: Optimisation selon le matériel
- ✅ **Validation des entrées**: Avec Pydantic schemas
- ✅ **CORS configuré**: Pour intégration frontend
- ✅ **Gestion d'erreurs**: Logging et messages d'erreur clairs
- ✅ **Sauvegarde locale**: Images sauvées dans `output/`
- ✅ **Seeds reproductibles**: Pour générer les mêmes images

### 3. Documentation et Tests
- ✅ **Documentation interactive**: Swagger UI à `/docs`
- ✅ **Tests automatisés**: Script `test_api.py`
- ✅ **Collection Postman**: `postman_collection.json`
- ✅ **Guide de démarrage**: `QUICKSTART.md`
- ✅ **Documentation complète**: `README.md`
- ✅ **Script de démarrage**: `start.sh`

## 📁 Structure des Fichiers Créés

```
api/
├── main.py                    # 🎯 Application FastAPI principale
├── model_service.py           # 🤖 Service de gestion des modèles (chargement, cache, génération)
├── schemas.py                 # 📝 Modèles Pydantic (validation requête/réponse)
├── config.py                  # ⚙️  Configuration (modèles, device, paramètres)
├── requirements.txt           # 📦 Dépendances Python
├── test_api.py               # 🧪 Tests automatisés
├── start.sh                  # 🚀 Script de démarrage rapide
├── .gitignore                # 🚫 Fichiers à ignorer
├── README.md                 # 📖 Documentation complète
├── QUICKSTART.md             # ⚡ Guide de démarrage rapide
├── SUMMARY.md                # 📋 Ce fichier
├── postman_collection.json   # 📮 Collection Postman
├── models/                   # 📂 Dossier pour modèles locaux (optionnel)
├── output/                   # 🖼️  Images générées (créé automatiquement)
└── test_output/              # 🧪 Images de test (créé automatiquement)
```

## 🎯 Architecture Technique

### Séparation des Responsabilités

```
┌─────────────────────────────────────────────────────────────┐
│                         main.py                             │
│  - Routes FastAPI                                           │
│  - Gestion des requêtes HTTP                                │
│  - Validation avec schemas.py                               │
│  - CORS et middleware                                       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ appelle
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    model_service.py                         │
│  - Chargement des modèles HuggingFace                       │
│  - Cache des modèles (Dict[model_id, pipeline])            │
│  - Génération d'images                                      │
│  - Gestion GPU/CPU                                          │
│  - Optimisations mémoire                                    │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ utilise
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              HuggingFace Diffusers                          │
│  - StableDiffusionPipeline                                  │
│  - Modèle: Zhurah/sd15-dreambooth-photoai                  │
└─────────────────────────────────────────────────────────────┘
```

### Flux de Requête

```
1. Client envoie POST /generate avec:
   {
     "prompt": "photo of sks person as astronaut",
     "user_id": "user_123",
     "num_inference_steps": 30
   }

2. FastAPI valide avec GenerateRequest (schemas.py)

3. model_service.get_or_load_model(user_id)
   - Vérifie le cache
   - Si absent: télécharge et charge depuis HuggingFace
   - Sinon: utilise le modèle en cache

4. model_service.generate_image(prompt, params)
   - Génère l'image avec Stable Diffusion
   - Sauvegarde dans output/

5. API retourne GenerateResponse avec:
   - image_base64
   - model_id
   - generation_time
   - image_path
```

## 🚀 Commandes Essentielles

### Démarrage
```bash
cd api
python main.py
```

### Tests
```bash
python test_api.py
```

### Test Manuel
```bash
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "photo of sks person", "user_id": "default"}'
```

### Télécharger Image
```bash
curl -X POST http://localhost:8000/generate/image \
  -H "Content-Type: application/json" \
  -d '{"prompt": "photo of sks person smiling"}' \
  --output image.png
```

## 📊 Paramètres de Génération

| Paramètre | Type | Défaut | Range | Description |
|-----------|------|--------|-------|-------------|
| `prompt` | string | - | - | Texte de génération (requis) |
| `user_id` | string | "default" | - | ID utilisateur pour sélection modèle |
| `num_inference_steps` | int | 30 | 1-150 | Nombre d'étapes (↑ = meilleure qualité, ↓ = plus rapide) |
| `guidance_scale` | float | 7.5 | 1.0-20.0 | Fidélité au prompt (↑ = plus fidèle) |
| `width` | int | 512 | 256-1024 | Largeur image |
| `height` | int | 512 | 256-1024 | Hauteur image |
| `seed` | int | null | - | Pour reproductibilité |

## 🔧 Configuration Personnalisée

### Ajouter un Utilisateur avec Modèle Custom

Dans `config.py`:

```python
USER_MODELS = {
    "default": "Zhurah/sd15-dreambooth-photoai",
    "alice": "alice/custom-model",
    "bob": "/path/to/local/model",
}
```

### Changer les Paramètres par Défaut

Dans `config.py`:

```python
DEFAULT_NUM_INFERENCE_STEPS = 25  # Plus rapide
DEFAULT_GUIDANCE_SCALE = 8.0      # Plus fidèle au prompt
DEFAULT_IMAGE_WIDTH = 768         # Plus grande résolution
```

## 🎨 Exemples de Prompts

```python
# Portrait professionnel
"photo of sks person in professional business attire, studio lighting, high quality"

# Style artistique
"photo of sks person with dramatic lighting, cinematic, artistic"

# Contexte spécifique
"photo of sks person as a futuristic astronaut in space station"

# Action
"photo of sks person reading a book in cozy library"

# Style
"photo of sks person, fashion photography, editorial style"
```

## 📈 Performance

### Temps de Génération

| Device | Steps | Résolution | Temps Estimé |
|--------|-------|------------|--------------|
| CPU | 20 | 512x512 | 2-3 min |
| CPU | 30 | 512x512 | 3-5 min |
| GPU (CUDA) | 20 | 512x512 | 8-10s |
| GPU (CUDA) | 30 | 512x512 | 12-15s |

### Optimisations Implémentées

1. ✅ **Cache de modèles**: Évite le rechargement
2. ✅ **Attention slicing**: Réduit l'utilisation mémoire (CPU)
3. ✅ **xformers**: Optimisation GPU si disponible
4. ✅ **torch.float16**: Sur GPU pour accélérer
5. ✅ **Safety checker désactivé**: Pour modèles personnels

## 🔜 Prochaines Étapes Suggérées

### Phase 2: Stockage Cloud
- [ ] Intégration AWS S3 pour images
- [ ] URLs temporaires signées
- [ ] Suppression automatique après X jours

### Phase 3: Base de Données
- [ ] PostgreSQL/MongoDB pour tracking
- [ ] Historique des générations
- [ ] Analytics utilisateur

### Phase 4: Queue System
- [ ] Redis + Celery pour requêtes asynchrones
- [ ] Status polling pour génération longue
- [ ] Webhooks de notification

### Phase 5: Production
- [ ] Docker containerization
- [ ] Load balancing
- [ ] Monitoring (Prometheus/Grafana)
- [ ] Rate limiting par utilisateur
- [ ] Authentification JWT
- [ ] CI/CD pipeline

### Phase 6: Features
- [ ] Image-to-image
- [ ] Inpainting/Outpainting
- [ ] Multiple images par requête
- [ ] Negative prompts
- [ ] Style presets

## 🎓 Documentation

- **Guide rapide**: `QUICKSTART.md`
- **Documentation complète**: `README.md`
- **API interactive**: http://localhost:8000/docs
- **Tests**: `test_api.py`
- **Postman**: `postman_collection.json`

## ✨ Points Forts de l'Implémentation

1. **Architecture propre**: Séparation claire des responsabilités
2. **Type safety**: Pydantic pour validation
3. **Caching intelligent**: Performance optimale
4. **Flexibilité**: Support multi-modèles et multi-utilisateurs
5. **Documentation**: Complète avec exemples
6. **Tests**: Scripts automatisés et collection Postman
7. **Production-ready**: Gestion d'erreurs, logging, CORS
8. **Extensible**: Facile d'ajouter nouvelles features

## 🎉 Résultat Final

Une API REST complète, performante et bien documentée pour servir votre modèle Stable Diffusion fine-tuné. Prête pour l'intégration avec un frontend React ou une API Express.js.

---

**Projet**: Clone Photo AI - FastAPI Stable Diffusion API
**Status**: ✅ Complété et fonctionnel
**Documentation**: 📚 Complète
