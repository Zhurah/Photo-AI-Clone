# 🧪 Guide de Test Complet - Clone Photo AI

Ce guide vous accompagne pour tester l'ensemble du système API + Frontend.

## 📋 Pré-requis

Avant de commencer, assurez-vous d'avoir:

- ✅ Python 3.8+ installé
- ✅ Node.js 18+ installé
- ✅ Les dépendances Python installées (`cd api && pip install -r requirements.txt`)
- ✅ Les dépendances Node installées (`cd frontend && npm install`)

## 🚀 Démarrage du Stack Complet

### Terminal 1: API FastAPI

```bash
cd api
python main.py
```

**Attendez le message:**
```
🚀 Starting Stable Diffusion API
📱 Device: cpu
🎨 Default model: Zhurah/sd15-dreambooth-photoai
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Terminal 2: Frontend React

```bash
cd frontend
npm run dev
```

**Attendez le message:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

## ✅ Tests Étape par Étape

### Test 1: Vérifier l'API (Terminal)

#### 1.1 Health Check

```bash
curl http://localhost:8000/health
```

**Résultat attendu:**
```json
{
  "status": "healthy",
  "device": "cpu",
  "models_loaded": 0
}
```

#### 1.2 Documentation Interactive

Ouvrez dans un navigateur: `http://localhost:8000/docs`

Vous devriez voir l'interface Swagger avec tous les endpoints.

### Test 2: Vérifier le Frontend

#### 2.1 Ouvrir l'Application

Ouvrez `http://localhost:3000` dans votre navigateur.

**Vérifications visuelles:**
- ✅ Le titre "Clone Photo AI" est affiché
- ✅ Un badge vert "API connectée" est visible en haut
- ✅ Le formulaire de prompt est présent
- ✅ Les exemples de prompts sont visibles en bas

#### 2.2 Inspecter la Console

Ouvrez la console du navigateur (F12).

**Vérifications:**
- ✅ Pas d'erreurs rouges
- ✅ Vous devriez voir un log de health check réussi

### Test 3: Génération Simple (Frontend)

#### 3.1 Utiliser un Exemple

1. Cliquez sur un des exemples de prompts en bas à gauche
2. Le prompt se remplit automatiquement
3. Cliquez sur "Générer l'image"

**Comportement attendu:**
- ✅ Le bouton devient gris et affiche "Génération..."
- ✅ Un spinner animé apparaît à droite
- ✅ Le message "Génération de votre image..." s'affiche
- ✅ Des points animés bougent

#### 3.2 Attendre la Génération

**Sur CPU:** 2-5 minutes
**Sur GPU:** 10-15 secondes

**Pendant ce temps:**
- ✅ Le spinner continue de tourner
- ✅ La barre de progression peut s'afficher (si disponible)

#### 3.3 Vérifier le Résultat

Une fois terminé:
- ✅ L'image apparaît à droite
- ✅ Le temps de génération est affiché (ex: "12.45s")
- ✅ Le modèle utilisé est affiché
- ✅ Les boutons "Télécharger" et "Réinitialiser" apparaissent

### Test 4: Téléchargement d'Image

#### 4.1 Télécharger

Cliquez sur le bouton "Télécharger".

**Vérifications:**
- ✅ Une image PNG est téléchargée
- ✅ Le nom du fichier est `clone-photo-ai-[timestamp].png`
- ✅ L'image s'ouvre correctement dans un viewer

#### 4.2 Vérifier l'Image Localement

Les images sont aussi sauvegardées dans `api/output/`:

```bash
ls -la api/output/
```

Vous devriez voir des fichiers `.png` avec des noms comme `default_20250107_143022.png`.

### Test 5: Paramètres Avancés

#### 5.1 Ouvrir les Paramètres

1. Cliquez sur "Paramètres avancés"
2. Les sliders apparaissent

#### 5.2 Tester Différentes Configurations

**Configuration rapide (test):**
```
Étapes d'inférence: 20
Échelle de guidance: 7.5
Seed: 42
```

**Configuration haute qualité:**
```
Étapes d'inférence: 50
Échelle de guidance: 8.5
Seed: (vide)
```

#### 5.3 Tester la Reproductibilité

1. Générez une image avec seed `42`
2. Notez le résultat
3. Réinitialisez
4. Régénérez avec le même prompt et seed `42`
5. **Vérification:** Les deux images doivent être identiques

### Test 6: Gestion d'Erreurs

#### 6.1 Tester Prompt Vide

1. Effacez le prompt
2. Cliquez sur "Générer l'image"

**Résultat attendu:**
- ✅ Message d'erreur rouge: "Veuillez entrer un prompt"
- ✅ Pas d'appel API

#### 6.2 Tester API Déconnectée

1. Arrêtez l'API (Ctrl+C dans le terminal 1)
2. Attendez quelques secondes
3. Le badge devrait devenir rouge "API déconnectée"
4. Tentez de générer une image

**Résultat attendu:**
- ✅ Message d'erreur: "L'API n'est pas disponible"
- ✅ Bouton "Générer" désactivé

#### 6.3 Reconnecter l'API

1. Redémarrez l'API dans le terminal 1
2. Attendez quelques secondes
3. Le badge redevient vert automatiquement
4. Vous pouvez à nouveau générer

### Test 7: Tests API Directs (Sans Frontend)

#### 7.1 Avec curl

**Génération base64:**
```bash
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "photo of sks person smiling",
    "user_id": "default",
    "num_inference_steps": 25
  }'
```

**Télécharger l'image:**
```bash
curl -X POST http://localhost:8000/generate/image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "photo of sks person",
    "user_id": "default"
  }' \
  --output test_curl.png
```

#### 7.2 Avec le Script Python

```bash
cd api
python test_api.py
```

**Résultat attendu:**
- ✅ Tous les tests passent
- ✅ Des images sont créées dans `api/test_output/`

#### 7.3 Avec Postman

1. Importez `api/postman_collection.json`
2. Exécutez "Health Check"
3. Exécutez "Generate Image (Base64)"
4. Vérifiez la réponse

### Test 8: Différents Prompts

Testez ces variations pour voir la qualité:

#### Prompts de Base

```
photo of sks person
photo of sks person smiling
photo of sks person looking at camera
```

#### Prompts avec Contexte

```
photo of sks person in professional business attire
photo of sks person reading a book in cozy library
photo of sks person at the beach during sunset
```

#### Prompts Créatifs

```
photo of sks person as a futuristic astronaut in space
photo of sks person as a superhero with cape
photo of sks person in cyberpunk style
```

#### Prompts avec Style

```
photo of sks person, professional photography, studio lighting
photo of sks person, cinematic lighting, dramatic
photo of sks person, portrait photography, high quality
```

### Test 9: Performance et Monitoring

#### 9.1 Vérifier les Logs API

Dans le terminal 1 (API), vous devriez voir:

```
📝 Generation request from user: default
💬 Prompt: photo of sks person...
✅ Image generated in 12.45s
💾 Saved to: /path/to/output/...
```

#### 9.2 Vérifier la Console Frontend

Dans la console du navigateur (F12), vous devriez voir:

```
Health check passed
Generation request sent
Image received successfully
```

#### 9.3 Monitorer l'Utilisation Mémoire

**Sur Mac/Linux:**
```bash
# Dans un nouveau terminal
top -pid $(pgrep -f "python main.py")
```

**Sur Windows:**
Utilisez le Gestionnaire des tâches.

### Test 10: Responsive Design

#### 10.1 Mode Desktop

Redimensionnez le navigateur en plein écran.

**Vérifications:**
- ✅ Layout en 2 colonnes (formulaire | résultat)
- ✅ Tous les éléments sont visibles
- ✅ L'image prend toute la largeur disponible

#### 10.2 Mode Tablet

Redimensionnez la fenêtre à ~800px de largeur.

**Vérifications:**
- ✅ Layout s'adapte
- ✅ Pas de défilement horizontal
- ✅ Boutons toujours accessibles

#### 10.3 Mode Mobile

Ouvrez les outils de développement (F12) et activez le mode mobile.

**Vérifications:**
- ✅ Layout vertical (formulaire en haut, résultat en bas)
- ✅ Tous les contrôles sont accessibles
- ✅ Texte lisible sans zoom

## 📊 Checklist Complète

### API Backend

- [ ] API démarre sans erreur
- [ ] Health check retourne "healthy"
- [ ] Documentation accessible sur /docs
- [ ] Génération d'image fonctionne (curl)
- [ ] Images sauvegardées dans output/
- [ ] Logs affichent les bonnes informations

### Frontend

- [ ] Application se charge sans erreur
- [ ] Badge API affiche "connectée"
- [ ] Prompt peut être saisi
- [ ] Exemples sont cliquables
- [ ] Paramètres avancés s'ouvrent
- [ ] Génération lance le loader
- [ ] Image s'affiche correctement
- [ ] Téléchargement fonctionne
- [ ] Réinitialisation fonctionne
- [ ] Gestion d'erreurs claire

### Intégration

- [ ] Frontend communique avec l'API
- [ ] Pas d'erreurs CORS
- [ ] Timeouts gérés correctement
- [ ] Reproductibilité (seed) fonctionne
- [ ] Différents prompts donnent résultats variés

### UX/Design

- [ ] Interface intuitive
- [ ] Animations fluides
- [ ] Messages clairs
- [ ] Responsive sur tous devices
- [ ] Aucun texte tronqué

## 🐛 Problèmes Courants et Solutions

### API ne démarre pas

**Symptôme:** Erreur au lancement de `python main.py`

**Solutions:**
1. Vérifiez les dépendances: `pip install -r requirements.txt`
2. Vérifiez Python version: `python --version` (3.8+)
3. Regardez l'erreur spécifique dans les logs

### Frontend ne se connecte pas

**Symptôme:** Badge rouge "API déconnectée"

**Solutions:**
1. Vérifiez que l'API tourne: `curl http://localhost:8000/health`
2. Vérifiez le fichier `.env`: `VITE_API_URL=http://localhost:8000`
3. Vérifiez les CORS dans la console (F12)

### Génération très lente

**Symptôme:** Plus de 5 minutes de génération

**Solutions:**
1. C'est normal sur CPU (2-5 min)
2. Réduisez `num_inference_steps` à 20 pour tester
3. Utilisez un GPU si disponible

### Image ne s'affiche pas

**Symptôme:** Génération réussit mais pas d'image

**Solutions:**
1. Vérifiez la console (F12) pour erreurs
2. Vérifiez que l'API retourne bien du base64
3. Testez l'API directement avec curl

### Erreur CORS

**Symptôme:** Erreur CORS dans la console

**Solutions:**
1. Vérifiez que CORS est activé dans `api/main.py`
2. L'API doit avoir `allow_origins=["*"]` en dev
3. Redémarrez l'API

## 📈 Métriques de Succès

Un test complet est réussi si:

1. ✅ L'API démarre en < 10 secondes
2. ✅ Le frontend se charge en < 2 secondes
3. ✅ Le health check répond en < 100ms
4. ✅ La génération complète en < 5 minutes (CPU)
5. ✅ L'image s'affiche immédiatement après génération
6. ✅ Le téléchargement fonctionne du premier coup
7. ✅ Aucune erreur dans les consoles (API et Frontend)
8. ✅ L'interface est responsive sur mobile

## 🎉 Félicitations !

Si tous les tests passent, vous avez un stack complet et fonctionnel:

```
Frontend React (Port 3000)
         ↓
    HTTP Request
         ↓
API FastAPI (Port 8000)
         ↓
  Stable Diffusion Model
         ↓
   Image générée
```

Vous êtes prêt pour la prochaine étape ! 🚀

---

**Besoin d'aide?**
- API: Consultez `api/README.md`
- Frontend: Consultez `frontend/README.md`
- Architecture: Consultez `CLAUDE.md`
