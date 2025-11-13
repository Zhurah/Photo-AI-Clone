import axios from 'axios';

// Base URL de l'API FastAPI
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Instance axios configurée
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 600000, // 10 minutes pour la génération d'images (inclus téléchargement du modèle)
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Service API pour interagir avec le backend FastAPI
 */
export const apiService = {
  /**
   * Vérifie la santé de l'API
   * @returns {Promise<Object>} Status de l'API
   */
  checkHealth: async () => {
    try {
      const response = await apiClient.get('/health');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Génère une image à partir d'un prompt (retourne base64)
   * @param {Object} params - Paramètres de génération
   * @param {string} params.prompt - Prompt textuel
   * @param {string} params.userId - ID utilisateur
   * @param {number} params.numInferenceSteps - Nombre d'étapes
   * @param {number} params.guidanceScale - Échelle de guidance
   * @param {number} params.width - Largeur de l'image
   * @param {number} params.height - Hauteur de l'image
   * @param {number} params.seed - Seed pour reproductibilité
   * @param {Function} onProgress - Callback pour progression
   * @returns {Promise<Object>} Résultat de la génération
   */
  generateImage: async (params, onProgress = null) => {
    let progressInterval = null;

    try {
      const payload = {
        prompt: params.prompt,
        user_id: params.userId || 'default',
        num_inference_steps: params.numInferenceSteps || 30,
        guidance_scale: params.guidanceScale || 7.5,
        width: params.width || 512,
        height: params.height || 512,
        seed: params.seed || null,
      };

      // Simuler la progression pendant la génération (backend ne stream pas encore)
      let simulatedProgress = 0;

      if (onProgress) {
        // Première phase: chargement du modèle (0-30%)
        onProgress(5);
        progressInterval = setInterval(() => {
          if (simulatedProgress < 85) {
            // Progression lente jusqu'à 85%
            simulatedProgress += Math.random() * 5;
            onProgress(Math.min(85, Math.floor(simulatedProgress)));
          }
        }, 1000); // Update toutes les secondes
      }

      const config = {
        onDownloadProgress: (progressEvent) => {
          // Phase finale: téléchargement de la réponse (85-100%)
          if (progressEvent.total && onProgress) {
            const downloadProgress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            const finalProgress = 85 + (downloadProgress * 0.15); // 85% + 15% max
            onProgress(Math.floor(finalProgress));
          }
        },
      };

      const response = await apiClient.post('/generate', payload, config);

      // Nettoyer l'intervalle de progression simulée
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
        if (onProgress) onProgress(100);
      }

      return {
        success: true,
        data: {
          imageBase64: response.data.image_base64,
          imagePath: response.data.image_path,
          modelUsed: response.data.model_id,
          generationTime: response.data.generation_time,
        },
      };
    } catch (error) {
      // Nettoyer l'intervalle en cas d'erreur
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      console.error('Generation failed:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
      };
    }
  },

  /**
   * Génère une image (retourne l'image binaire)
   * @param {Object} params - Paramètres de génération
   * @returns {Promise<Object>} Blob de l'image et métadonnées
   */
  generateImageBinary: async (params) => {
    try {
      const payload = {
        prompt: params.prompt,
        user_id: params.userId || 'default',
        num_inference_steps: params.numInferenceSteps || 30,
        guidance_scale: params.guidanceScale || 7.5,
        width: params.width || 512,
        height: params.height || 512,
        seed: params.seed || null,
      };

      const response = await apiClient.post('/generate/image', payload, {
        responseType: 'blob',
      });

      // Créer une URL pour le blob
      const imageUrl = URL.createObjectURL(response.data);

      return {
        success: true,
        data: {
          imageUrl,
          blob: response.data,
          modelUsed: response.headers['x-model-used'],
          generationTime: parseFloat(response.headers['x-generation-time'] || 0),
        },
      };
    } catch (error) {
      console.error('Binary generation failed:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  },

  /**
   * Vide le cache des modèles
   * @returns {Promise<Object>} Résultat de l'opération
   */
  clearCache: async () => {
    try {
      const response = await apiClient.delete('/cache');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Clear cache failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export default apiService;
