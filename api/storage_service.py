"""
Service de gestion du stockage des données utilisateur
"""
import json
import shutil
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional
import logging

from config import USERS_DIR, MODELS_DIR, TEMP_DIR, TRAINING_CONFIG, STORAGE_CONFIG

logger = logging.getLogger(__name__)


class StorageService:
    """Service pour gérer le stockage organisé des données utilisateur"""

    def __init__(self):
        self.users_dir = USERS_DIR
        self.models_dir = MODELS_DIR
        self.temp_dir = TEMP_DIR

    def get_user_directory(self, user_id: str) -> Path:
        """
        Récupère ou crée le dossier principal d'un utilisateur

        Structure:
        data/users/<user_id>/
        ├── training_images/
        ├── models/
        ├── metadata.json
        └── logs/
        """
        user_dir = self.users_dir / user_id
        user_dir.mkdir(parents=True, exist_ok=True)

        # Créer les sous-dossiers
        (user_dir / "training_images").mkdir(exist_ok=True)
        (user_dir / "models").mkdir(exist_ok=True)
        (user_dir / "logs").mkdir(exist_ok=True)

        return user_dir

    def get_model_training_directory(self, user_id: str, model_identifier: str) -> Path:
        """
        Récupère ou crée le dossier pour un entraînement spécifique

        Structure:
        data/users/<user_id>/training_images/<model_identifier>/
        ├── images/
        ├── metadata.json
        └── training_info.json
        """
        training_dir = self.users_dir / user_id / "training_images" / model_identifier
        training_dir.mkdir(parents=True, exist_ok=True)

        # Créer sous-dossier images
        images_dir = training_dir / "images"
        images_dir.mkdir(exist_ok=True)

        return training_dir

    def save_training_images(
        self,
        user_id: str,
        model_identifier: str,
        images: List[tuple],  # [(filename, content), ...]
        metadata: Optional[Dict] = None
    ) -> Dict:
        """
        Sauvegarde les images d'entraînement avec métadonnées

        Args:
            user_id: Identifiant utilisateur
            model_identifier: Identifiant du modèle
            images: Liste de tuples (filename, content)
            metadata: Métadonnées optionnelles

        Returns:
            Dict avec les informations de sauvegarde
        """
        training_dir = self.get_model_training_directory(user_id, model_identifier)
        images_dir = training_dir / "images"

        saved_images = []
        total_size = 0

        # Sauvegarder chaque image
        for idx, (filename, content) in enumerate(images):
            # Générer nom de fichier unique
            file_extension = Path(filename).suffix
            new_filename = f"{model_identifier}_{idx:03d}{file_extension}"
            image_path = images_dir / new_filename

            # Sauvegarder
            with open(image_path, "wb") as f:
                f.write(content)

            file_size = len(content)
            total_size += file_size

            saved_images.append({
                "filename": new_filename,
                "original_filename": filename,
                "size_bytes": file_size,
                "path": str(image_path)
            })

            logger.info(f"   ✓ Saved: {new_filename} ({file_size} bytes)")

        # Créer métadonnées de training
        training_metadata = {
            "user_id": user_id,
            "model_identifier": model_identifier,
            "created_at": datetime.now().isoformat(),
            "num_images": len(saved_images),
            "total_size_bytes": total_size,
            "images": saved_images,
            "custom_metadata": metadata or {}
        }

        # Sauvegarder métadonnées
        metadata_path = training_dir / "metadata.json"
        with open(metadata_path, "w") as f:
            json.dump(training_metadata, f, indent=2)

        logger.info(f"✅ Saved {len(saved_images)} images to {training_dir}")
        logger.info(f"📊 Total size: {total_size / 1024 / 1024:.2f} MB")

        return {
            "training_dir": str(training_dir),
            "images_dir": str(images_dir),
            "num_images": len(saved_images),
            "total_size_bytes": total_size,
            "metadata_path": str(metadata_path)
        }

    def get_user_metadata(self, user_id: str) -> Dict:
        """Récupère les métadonnées d'un utilisateur"""
        user_dir = self.get_user_directory(user_id)
        metadata_path = user_dir / "metadata.json"

        if metadata_path.exists():
            with open(metadata_path, "r") as f:
                return json.load(f)

        # Créer métadonnées par défaut
        default_metadata = {
            "user_id": user_id,
            "created_at": datetime.now().isoformat(),
            "models_trained": [],
            "total_storage_bytes": 0
        }

        with open(metadata_path, "w") as f:
            json.dump(default_metadata, f, indent=2)

        return default_metadata

    def update_user_metadata(self, user_id: str, updates: Dict) -> None:
        """Met à jour les métadonnées utilisateur"""
        metadata = self.get_user_metadata(user_id)
        metadata.update(updates)
        metadata["updated_at"] = datetime.now().isoformat()

        user_dir = self.get_user_directory(user_id)
        metadata_path = user_dir / "metadata.json"

        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=2)

    def get_user_storage_size(self, user_id: str) -> int:
        """Calcule la taille totale de stockage d'un utilisateur (en bytes)"""
        user_dir = self.get_user_directory(user_id)

        if not user_dir.exists():
            return 0

        total_size = 0
        for file_path in user_dir.rglob("*"):
            if file_path.is_file():
                total_size += file_path.stat().st_size

        return total_size

    def list_user_models(self, user_id: str) -> List[Dict]:
        """Liste tous les modèles d'un utilisateur"""
        training_images_dir = self.users_dir / user_id / "training_images"

        if not training_images_dir.exists():
            return []

        models = []
        for model_dir in training_images_dir.iterdir():
            if model_dir.is_dir():
                metadata_path = model_dir / "metadata.json"

                if metadata_path.exists():
                    with open(metadata_path, "r") as f:
                        metadata = json.load(f)
                        models.append(metadata)

        return models

    def delete_model_data(self, user_id: str, model_identifier: str) -> bool:
        """Supprime toutes les données d'un modèle spécifique"""
        training_dir = self.users_dir / user_id / "training_images" / model_identifier

        if training_dir.exists():
            shutil.rmtree(training_dir)
            logger.info(f"🗑️  Deleted model data: {model_identifier} for user {user_id}")
            return True

        return False

    def cleanup_temp_files(self) -> int:
        """Nettoie les fichiers temporaires anciens (> 24h)"""
        if not self.temp_dir.exists():
            return 0

        cleaned = 0
        current_time = datetime.now()

        for file_path in self.temp_dir.rglob("*"):
            if file_path.is_file():
                # Vérifier l'âge du fichier
                file_time = datetime.fromtimestamp(file_path.stat().st_mtime)
                age_hours = (current_time - file_time).total_seconds() / 3600

                if age_hours > 24:
                    file_path.unlink()
                    cleaned += 1

        if cleaned > 0:
            logger.info(f"🧹 Cleaned {cleaned} temporary files")

        return cleaned

    def validate_storage_limits(self, user_id: str, additional_size_bytes: int) -> bool:
        """Vérifie si l'utilisateur ne dépasse pas sa limite de stockage"""
        current_size = self.get_user_storage_size(user_id)
        max_size = STORAGE_CONFIG["max_user_storage_gb"] * 1024 * 1024 * 1024

        total_after_upload = current_size + additional_size_bytes

        if total_after_upload > max_size:
            logger.warning(
                f"⚠️  Storage limit exceeded for user {user_id}: "
                f"{total_after_upload / 1024 / 1024:.2f} MB > "
                f"{max_size / 1024 / 1024:.2f} MB"
            )
            return False

        return True


# Instance globale
storage_service = StorageService()
