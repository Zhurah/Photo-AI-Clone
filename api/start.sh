#!/bin/bash
# Script de démarrage rapide pour l'API

echo "🚀 Démarrage de l'API Stable Diffusion..."

# Vérifier que les dépendances sont installées
if ! python -c "import fastapi" 2>/dev/null; then
    echo "📦 Installation des dépendances..."
    pip install -r requirements.txt
fi

# Créer les dossiers nécessaires
mkdir -p output test_output

# Démarrer l'API
echo "✅ Lancement de l'API sur http://localhost:8000"
echo "📚 Documentation interactive: http://localhost:8000/docs"
echo ""

python main.py
