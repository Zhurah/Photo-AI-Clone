# 🚀 Guide de Démarrage Rapide - Frontend

## Installation en 3 étapes

### 1️⃣ Installer les dépendances

```bash
cd frontend
npm install
```

### 2️⃣ Configurer l'API

```bash
cp .env.example .env
```

Le fichier `.env` contient:
```env
VITE_API_URL=http://localhost:8000
```

### 3️⃣ Démarrer l'application

```bash
npm run dev
```

Ouvrez `http://localhost:3000` dans votre navigateur.

## ⚠️ Pré-requis Important

**L'API FastAPI doit être démarrée !**

Dans un autre terminal:
```bash
cd ../api
python main.py
```

L'API doit tourner sur `http://localhost:8000`.

## 🎯 Premier Test

### 1. Vérifier la connexion

Le badge en haut de la page doit afficher "API connectée" avec un point vert.

### 2. Générer une image

1. Entrez un prompt: `photo of sks person as a futuristic astronaut`
2. Cliquez sur "Générer l'image"
3. Attendez la génération (2-5 minutes sur CPU, 10-15s sur GPU)
4. L'image s'affiche automatiquement

### 3. Télécharger l'image

Cliquez sur le bouton "Télécharger" pour sauvegarder l'image.

## 🎨 Essayer les Exemples

Utilisez les exemples pré-définis en bas à gauche:
- `photo of sks person as a futuristic astronaut in space`
- `photo of sks person in professional business attire`
- `photo of sks person reading a book in cozy library`
- `photo of sks person as a superhero with cape`

## ⚙️ Paramètres Avancés

Cliquez sur "Paramètres avancés" pour ajuster:

- **Étapes d'inférence** (10-100): Plus = meilleure qualité, plus lent
- **Échelle de guidance** (1-20): Plus = plus fidèle au prompt
- **Seed**: Pour reproduire exactement la même image

## 🐛 Problèmes Courants

### "API déconnectée"

✅ **Solution**: Démarrez l'API FastAPI:
```bash
cd api
python main.py
```

### Erreur lors de l'installation

✅ **Solution**: Vérifiez que Node.js est installé:
```bash
node --version  # Devrait afficher v18+ ou v20+
npm --version
```

Si non installé, téléchargez depuis: https://nodejs.org/

### L'image ne s'affiche pas

✅ **Solution**:
1. Ouvrez la console du navigateur (F12)
2. Cherchez les erreurs
3. Vérifiez que l'API retourne bien l'image

## 📊 Structure Rapide

```
frontend/
├── src/
│   ├── components/       # Composants React
│   ├── services/         # API service
│   └── App.jsx          # Composant principal
├── index.html           # Template HTML
└── package.json         # Dépendances
```

## 🎓 Next Steps

1. ✅ Testez différents prompts
2. ✅ Expérimentez avec les paramètres avancés
3. ✅ Essayez avec différents user_id
4. ✅ Consultez le README.md complet pour plus de détails

## 🚀 Build pour Production

```bash
npm run build
```

Les fichiers seront dans `dist/` et prêts à être déployés.

---

**Besoin d'aide?** Consultez le [README.md](README.md) complet!
