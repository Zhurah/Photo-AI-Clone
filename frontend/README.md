# Clone Photo AI - Frontend React

Interface utilisateur moderne et intuitive pour générer des images personnalisées avec l'IA.

## 🚀 Démarrage Rapide

### 1. Installation des dépendances

```bash
cd frontend
npm install
```

### 2. Configuration

Copiez le fichier `.env.example` en `.env` et configurez l'URL de l'API:

```bash
cp .env.example .env
```

Éditez `.env`:
```env
VITE_API_URL=http://localhost:8000
```

### 3. Démarrer le serveur de développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

### 4. Assurez-vous que l'API FastAPI est démarrée

Dans un autre terminal:
```bash
cd ../api
python main.py
```

## 📦 Technologies Utilisées

- **React 18** - Bibliothèque UI
- **Vite** - Build tool rapide et moderne
- **Tailwind CSS** - Framework CSS utilitaire
- **Axios** - Client HTTP pour les requêtes API
- **PostCSS** - Transformation CSS

## 🎨 Fonctionnalités

### Interface Principale

- ✅ **Champ de prompt** - Saisie intuitive du texte de génération
- ✅ **Paramètres avancés** - Contrôle fin de la génération (steps, guidance scale, seed)
- ✅ **Exemples de prompts** - Suggestions pré-définies
- ✅ **Identifiant utilisateur** - Support multi-utilisateurs
- ✅ **Status API** - Indicateur de connexion en temps réel

### Génération d'Images

- ✅ **Affichage en temps réel** - Loader animé pendant la génération
- ✅ **Barre de progression** - Suivi de l'avancement (si disponible)
- ✅ **Affichage haute qualité** - Rendu optimal de l'image générée
- ✅ **Métadonnées** - Affichage du temps de génération et du modèle utilisé

### Interactions

- ✅ **Téléchargement** - Sauvegarde de l'image en PNG
- ✅ **Réinitialisation** - Nouvelle génération rapide
- ✅ **Gestion d'erreurs** - Messages clairs et informatifs
- ✅ **Responsive Design** - Adapté mobile, tablette et desktop

## 🏗️ Structure du Projet

```
frontend/
├── src/
│   ├── components/
│   │   ├── ImageGenerator.jsx    # Composant principal
│   │   ├── ImageDisplay.jsx      # Affichage de l'image
│   │   └── LoadingSpinner.jsx    # Indicateur de chargement
│   ├── services/
│   │   └── api.js                # Service API (axios)
│   ├── App.jsx                   # Composant racine
│   ├── main.jsx                  # Point d'entrée
│   └── index.css                 # Styles globaux + Tailwind
├── index.html                    # Template HTML
├── vite.config.js               # Configuration Vite
├── tailwind.config.js           # Configuration Tailwind
├── postcss.config.js            # Configuration PostCSS
├── package.json                 # Dépendances
└── README.md                    # Documentation
```

## 🎯 Composants Clés

### ImageGenerator

Le composant principal qui gère toute la logique de l'application:

```jsx
import ImageGenerator from './components/ImageGenerator';

function App() {
  return <ImageGenerator />;
}
```

**États gérés:**
- Prompt utilisateur
- ID utilisateur
- Paramètres de génération (steps, guidance, seed)
- État de chargement
- Image générée
- Erreurs
- Status de l'API

**Fonctionnalités:**
- Validation du prompt
- Appel API pour génération
- Gestion des erreurs
- Affichage des résultats

### ImageDisplay

Affiche l'image générée avec les métadonnées et actions:

```jsx
<ImageDisplay
  imageData={{
    imageUrl: "data:image/png;base64,...",
    generationTime: 12.45,
    modelUsed: "Zhurah/sd15-dreambooth-photoai"
  }}
/>
```

### LoadingSpinner

Indicateur de chargement animé avec barre de progression:

```jsx
<LoadingSpinner
  message="Génération en cours..."
  progress={45}
/>
```

## 🔧 Service API

Le service `api.js` expose les méthodes suivantes:

### `checkHealth()`

Vérifie l'état de l'API FastAPI.

```javascript
const result = await apiService.checkHealth();
// { success: true, data: { status: "healthy", device: "cpu" } }
```

### `generateImage(params, onProgress)`

Génère une image avec retour base64.

```javascript
const result = await apiService.generateImage({
  prompt: "photo of sks person as astronaut",
  userId: "default",
  numInferenceSteps: 30,
  guidanceScale: 7.5,
  seed: 42
}, (progress) => {
  console.log(`Progress: ${progress}%`);
});

// {
//   success: true,
//   data: {
//     imageBase64: "iVBORw0KGgo...",
//     generationTime: 12.45,
//     modelUsed: "..."
//   }
// }
```

### `generateImageBinary(params)`

Génère une image avec retour binaire (blob).

```javascript
const result = await apiService.generateImageBinary({
  prompt: "photo of sks person smiling",
  userId: "default"
});

// {
//   success: true,
//   data: {
//     imageUrl: "blob:http://...",
//     blob: Blob,
//     generationTime: 12.45
//   }
// }
```

### `clearCache()`

Vide le cache des modèles.

```javascript
const result = await apiService.clearCache();
// { success: true, data: { message: "Cache cleared" } }
```

## 🎨 Personnalisation

### Modifier les Couleurs

Éditez `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#0ea5e9',
        600: '#0284c7',
        // ...
      }
    }
  }
}
```

### Ajouter des Exemples de Prompts

Dans `ImageGenerator.jsx`:

```javascript
const examplePrompts = [
  'photo of sks person as astronaut',
  'photo of sks person in business suit',
  // Ajoutez vos exemples ici
];
```

### Modifier les Paramètres par Défaut

```javascript
const [numSteps, setNumSteps] = useState(30);
const [guidanceScale, setGuidanceScale] = useState(7.5);
```

## 🧪 Tests Manuels

### 1. Test de Connexion API

1. Démarrez l'API FastAPI
2. Lancez le frontend
3. Vérifiez le badge "API connectée" (vert)

### 2. Test de Génération Simple

1. Entrez un prompt: "photo of sks person"
2. Cliquez sur "Générer l'image"
3. Attendez la génération (loader animé)
4. Vérifiez l'affichage de l'image

### 3. Test des Paramètres Avancés

1. Cliquez sur "Paramètres avancés"
2. Modifiez les sliders (steps, guidance)
3. Entrez un seed (ex: 42)
4. Générez une image
5. Régénérez avec le même seed (résultat identique)

### 4. Test de Téléchargement

1. Après génération, cliquez sur "Télécharger"
2. Vérifiez le fichier PNG téléchargé

### 5. Test de Gestion d'Erreurs

1. Arrêtez l'API
2. Tentez une génération
3. Vérifiez le message d'erreur
4. Redémarrez l'API
5. Badge redevient vert automatiquement

## 📱 Responsive Design

L'interface s'adapte automatiquement:

- **Mobile (< 768px)**: Layout vertical, une colonne
- **Tablet (768px - 1024px)**: Layout hybride
- **Desktop (> 1024px)**: Layout deux colonnes côte à côte

## ⚡ Optimisations

### Performance

- **Lazy loading** des composants
- **Memoization** pour éviter les re-renders
- **Debouncing** sur les inputs
- **Optimisation des images** avec compression

### UX

- **Feedback visuel** immédiat sur toutes les actions
- **Messages d'erreur** clairs et actionnables
- **États de chargement** informatifs
- **Animations fluides** pour une meilleure expérience

## 🐛 Dépannage

### L'API n'est pas détectée

✅ **Solutions:**
1. Vérifiez que l'API tourne sur `http://localhost:8000`
2. Vérifiez le fichier `.env`
3. Regardez la console du navigateur pour les erreurs CORS
4. Assurez-vous que CORS est activé dans l'API (déjà fait)

### L'image ne s'affiche pas

✅ **Solutions:**
1. Vérifiez la console pour les erreurs
2. Testez l'API directement avec curl
3. Vérifiez le format de la réponse (base64 valide)

### Le téléchargement ne fonctionne pas

✅ **Solutions:**
1. Vérifiez les permissions du navigateur
2. Essayez un autre navigateur
3. Vérifiez que l'URL de l'image est valide

### Génération très lente

✅ **Solutions:**
1. C'est normal sur CPU (2-5 min)
2. Réduisez `num_inference_steps` à 20 pour tester
3. Utilisez un GPU côté API pour accélérer

## 🚀 Build pour Production

### Créer le build

```bash
npm run build
```

Les fichiers optimisés seront dans `dist/`.

### Prévisualiser le build

```bash
npm run preview
```

### Déployer

Le dossier `dist/` peut être déployé sur:
- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy`
- **GitHub Pages**: Via GitHub Actions
- **Serveur custom**: Copier `dist/` et servir avec nginx/apache

## 📝 Variables d'Environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `VITE_API_URL` | URL de l'API FastAPI | `http://localhost:8000` |

## 🎓 Prochaines Étapes

### Fonctionnalités à Ajouter

- [ ] **Historique** - Sauvegarder les images générées
- [ ] **Galerie** - Afficher toutes les images créées
- [ ] **Partage social** - Partager sur Twitter, Facebook, etc.
- [ ] **Authentification** - Login utilisateur avec JWT
- [ ] **Favoris** - Marquer des images favorites
- [ ] **Collections** - Organiser les images par thème
- [ ] **Variations** - Générer des variations d'une image
- [ ] **Upscaling** - Améliorer la résolution
- [ ] **Editing** - Inpainting, outpainting

### Améliorations Techniques

- [ ] **Tests unitaires** - Jest + React Testing Library
- [ ] **Tests E2E** - Playwright ou Cypress
- [ ] **PWA** - Application installable
- [ ] **WebSocket** - Updates en temps réel
- [ ] **Service Worker** - Mode offline
- [ ] **Internationalisation** - Support multi-langues

## 📄 Licence

Projet éducatif - Clone Photo AI

---

**Pour plus d'informations sur l'API:** Consultez `../api/README.md`
