import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import ImageDisplay from './ImageDisplay';
import ImageUploader from './ImageUploader';

const ImageGenerator = () => {
  // États
  const [prompt, setPrompt] = useState('');
  const [userId, setUserId] = useState('default');
  const [modelIdentifier, setModelIdentifier] = useState(''); // Identifiant du modèle (token)
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');
  const [progress, setProgress] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null); // Image uploadée

  // États spécifiques au fine-tuning
  const [isFineTuning, setIsFineTuning] = useState(false);
  const [fineTuningProgress, setFineTuningProgress] = useState(0);
  const [fineTuningStatus, setFineTuningStatus] = useState(null); // 'training', 'completed', 'failed'

  // Paramètres avancés
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [numSteps, setNumSteps] = useState(30);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [seed, setSeed] = useState('');

  // Exemples de prompts (dynamiques selon l'identifiant)
  const getExamplePrompts = () => {
    const identifier = modelIdentifier || 'your_name';
    return [
      `photo of ${identifier} as a futuristic astronaut in space`,
      `photo of ${identifier} in professional business attire`,
      `photo of ${identifier} reading a book in cozy library`,
      `photo of ${identifier} as a superhero with cape`,
    ];
  };

  // Vérifier la santé de l'API au chargement
  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    const result = await apiService.checkHealth();
    if (result.success) {
      setApiStatus('healthy');
    } else {
      setApiStatus('error');
      setError("L'API n'est pas accessible. Assurez-vous qu'elle est démarrée.");
    }
  };

  // Valider toutes les données nécessaires au fine-tuning
  const validateFineTuningData = () => {
    // 1. Valider l'identifiant
    const identifierValidation = validateModelIdentifier(modelIdentifier);
    if (!identifierValidation.valid) {
      return { valid: false, error: identifierValidation.error };
    }

    // 2. Valider les images uploadées
    if (!uploadedImage || uploadedImage.length === 0) {
      return { valid: false, error: 'Veuillez uploader au moins 10 photos de votre visage' };
    }

    if (uploadedImage.length < 10) {
      return {
        valid: false,
        error: `Vous avez uploadé ${uploadedImage.length} photo(s). Minimum 10 requis pour le fine-tuning.`
      };
    }

    if (uploadedImage.length > 20) {
      return {
        valid: false,
        error: `Vous avez uploadé ${uploadedImage.length} photo(s). Maximum 20 autorisé.`
      };
    }

    // 3. Valider l'API
    if (apiStatus !== 'healthy') {
      return { valid: false, error: "L'API n'est pas disponible" };
    }

    return { valid: true };
  };

  // Valider l'identifiant du modèle
  const validateModelIdentifier = (identifier) => {
    // Règles de validation :
    // 1. Minimum 3 caractères, maximum 30
    // 2. Seulement lettres minuscules, chiffres, underscore
    // 3. Doit commencer par une lettre
    // 4. Pas d'espaces ou caractères spéciaux

    if (!identifier || identifier.trim() === '') {
      return { valid: false, error: 'L\'identifiant est requis' };
    }

    if (identifier.length < 3) {
      return { valid: false, error: 'Minimum 3 caractères requis' };
    }

    if (identifier.length > 30) {
      return { valid: false, error: 'Maximum 30 caractères autorisés' };
    }

    // Vérifier le format : doit commencer par une lettre, puis lettres/chiffres/underscore
    const validFormat = /^[a-z][a-z0-9_]*$/;
    if (!validFormat.test(identifier)) {
      return {
        valid: false,
        error: 'Format invalide. Utilisez seulement lettres minuscules, chiffres et underscore (_). Doit commencer par une lettre.'
      };
    }

    // Mots réservés à éviter
    const reservedWords = ['default', 'admin', 'user', 'test', 'null', 'undefined'];
    if (reservedWords.includes(identifier.toLowerCase())) {
      return { valid: false, error: 'Ce nom est réservé. Choisissez-en un autre.' };
    }

    return { valid: true };
  };

  const handleGenerate = async (e) => {
    e.preventDefault();

    // Validation du prompt
    if (!prompt.trim()) {
      setError('Veuillez entrer un prompt');
      return;
    }

    // Validation de l'identifiant du modèle
    const identifierValidation = validateModelIdentifier(modelIdentifier);
    if (!identifierValidation.valid) {
      setError(identifierValidation.error);
      return;
    }

    // Validation du nombre d'images (optionnel pour la génération, obligatoire pour l'entraînement)
    if (uploadedImage && uploadedImage.length > 0) {
      if (uploadedImage.length < 10) {
        setError(`Vous avez uploadé ${uploadedImage.length} photo(s). Minimum 10 requis pour l'entraînement.`);
        return;
      }
      if (uploadedImage.length > 20) {
        setError(`Vous avez uploadé ${uploadedImage.length} photo(s). Maximum 20 autorisé.`);
        return;
      }
    }

    if (apiStatus !== 'healthy') {
      setError("L'API n'est pas disponible");
      return;
    }

    // Reset
    setError(null);
    setIsLoading(true);
    setProgress(0);
    setGeneratedImage(null);

    try {
      // Préparer les paramètres
      const params = {
        prompt: prompt.trim(),
        userId: userId,
        numInferenceSteps: numSteps,
        guidanceScale: guidanceScale,
        seed: seed ? parseInt(seed) : null,
      };

      // Générer l'image
      const result = await apiService.generateImage(params, (p) => {
        setProgress(p);
      });

      if (result.success) {
        // Créer une URL pour l'image base64
        const imageUrl = `data:image/png;base64,${result.data.imageBase64}`;

        setGeneratedImage({
          imageUrl,
          generationTime: result.data.generationTime,
          modelUsed: result.data.modelUsed,
        });
      } else {
        setError(result.error || 'Erreur lors de la génération');
      }
    } catch (err) {
      setError('Une erreur inattendue est survenue');
      console.error(err);
    } finally {
      setIsLoading(false);
      setProgress(null);
    }
  };

  const handleUseExample = (examplePrompt) => {
    setPrompt(examplePrompt);
  };

  const handleReset = () => {
    setPrompt('');
    setModelIdentifier('');
    setGeneratedImage(null);
    setError(null);
    setUploadedImage(null);
  };

  const handleImageSelect = (imagesArray) => {
    setUploadedImage(imagesArray);
    setError(null);
  };

  // Polling du statut du training
  const pollTrainingStatus = async (trainingId) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const maxPolls = 1000; // Maximum 1000 checks (environ 16 minutes avec intervalle de 1s)
    let pollCount = 0;

    const poll = async () => {
      try {
        const response = await fetch(`${API_URL}/train/${trainingId}/status`);
        if (!response.ok) {
          throw new Error('Erreur lors de la vérification du statut');
        }

        const statusData = await response.json();
        console.log('📊 Statut du training:', statusData);

        // Mettre à jour le statut et la progression
        setFineTuningProgress(statusData.progress);
        setFineTuningStatus(statusData.status);

        // Si le training est terminé (succès ou échec)
        if (statusData.status === 'completed') {
          setIsFineTuning(false);
          alert(`✅ Fine-tuning complété avec succès !\n\nModèle: ${modelIdentifier}\nVous pouvez maintenant utiliser "${modelIdentifier} person" dans vos prompts.`);
          return;
        } else if (statusData.status === 'failed') {
          setIsFineTuning(false);
          setError(`Erreur lors du fine-tuning: ${statusData.error || 'Erreur inconnue'}`);
          return;
        }

        // Si toujours en cours, continuer le polling
        if (statusData.status === 'running' || statusData.status === 'pending') {
          pollCount++;
          if (pollCount < maxPolls) {
            setTimeout(poll, 1000); // Vérifier toutes les secondes
          } else {
            setError('Timeout: le training prend trop de temps');
            setIsFineTuning(false);
          }
        }

      } catch (err) {
        console.error('❌ Erreur polling:', err);
        setError('Erreur lors du suivi du training: ' + err.message);
        setIsFineTuning(false);
      }
    };

    // Démarrer le polling
    poll();
  };

  // Lancer le fine-tuning
  const handleFineTuning = async (e) => {
    e.preventDefault();

    // Validation complète
    const validation = validateFineTuningData();
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    // Reset des états
    setError(null);
    setIsFineTuning(true);
    setFineTuningProgress(0);
    setFineTuningStatus('pending');

    try {
      // Préparer les données
      const formData = new FormData();

      // Ajouter les métadonnées
      formData.append('model_identifier', modelIdentifier);
      formData.append('user_id', userId);

      // Ajouter chaque image (l'API attend un array nommé "images")
      uploadedImage.forEach((imageData) => {
        formData.append('images', imageData.file);
      });

      console.log('📤 Envoi des données au backend...');
      console.log(`   - Identifiant: ${modelIdentifier}`);
      console.log(`   - Nombre d'images: ${uploadedImage.length}`);
      console.log(`   - User ID: ${userId}`);

      // Appel API réel vers /train
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/train`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de l\'envoi des données');
      }

      const result = await response.json();
      console.log('✅ Réponse du serveur:', result);

      // Démarrer le polling du statut
      if (result.training_id) {
        console.log(`🔄 Démarrage du suivi du training (ID: ${result.training_id})`);
        pollTrainingStatus(result.training_id);
      } else {
        throw new Error('Aucun training_id reçu du serveur');
      }

    } catch (err) {
      console.error('❌ Erreur fine-tuning:', err);
      setError('Erreur lors du fine-tuning: ' + err.message);
      setFineTuningStatus('failed');
      setIsFineTuning(false);
    }
  };

  // Fonction de simulation (sera remplacée par l'API réelle)
  const simulateFineTuning = () => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setFineTuningProgress(progress);

        if (progress >= 100) {
          clearInterval(interval);
          resolve();
        }
      }, 500); // Simulation: 5 secondes au total
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Clone Photo AI
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Générez des images personnalisées avec l'intelligence artificielle
          </p>

          {/* Status de l'API */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white shadow-sm">
            <div className={`w-2 h-2 rounded-full ${
              apiStatus === 'healthy' ? 'bg-green-500' :
              apiStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
            <span className="text-gray-700">
              {apiStatus === 'healthy' ? 'API connectée' :
               apiStatus === 'error' ? 'API déconnectée' : 'Vérification...'}
            </span>
          </div>
        </header>

        {/* Contenu principal */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Colonne gauche : Formulaire */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Créez votre image
              </h2>

              {/* Formulaire */}
              <form onSubmit={handleGenerate} className="space-y-4">
                {/* Prompt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prompt
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Décrivez l'image que vous souhaitez générer..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    rows="4"
                    disabled={isLoading}
                  />
                </div>

                {/* Image Uploader */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photos de votre visage
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Uploadez entre 10 et 20 photos claires de votre visage pour un meilleur entraînement
                  </p>
                  <ImageUploader
                    onImageSelect={handleImageSelect}
                    maxSizeMB={5}
                    minImages={10}
                    maxImages={20}
                  />
                </div>

                {/* Identifiant du modèle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Identifiant du modèle *
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Choisissez un nom unique pour votre modèle (ex: aurel_person, mon_visage_2024)
                  </p>
                  <input
                    type="text"
                    value={modelIdentifier}
                    onChange={(e) => setModelIdentifier(e.target.value.toLowerCase())}
                    placeholder="ex: mon_nom_person"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      modelIdentifier && !validateModelIdentifier(modelIdentifier).valid
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                    required
                  />
                  {/* Aide en temps réel */}
                  {modelIdentifier && (
                    <div className="mt-2">
                      {validateModelIdentifier(modelIdentifier).valid ? (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          ✓ Identifiant valide ! Vous pourrez utiliser "{modelIdentifier}" dans vos prompts
                        </p>
                      ) : (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          {validateModelIdentifier(modelIdentifier).error}
                        </p>
                      )}
                    </div>
                  )}
                  {/* Exemples */}
                  {!modelIdentifier && (
                    <div className="mt-2 text-xs text-gray-400">
                      Exemples valides : <span className="font-mono">aurel_person</span>, <span className="font-mono">marie_2024</span>, <span className="font-mono">john_ai</span>
                    </div>
                  )}
                </div>

                {/* User ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Identifiant utilisateur
                  </label>
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="default"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                </div>

                {/* Paramètres avancés */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                  >
                    <svg className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Paramètres avancés
                  </button>

                  {showAdvanced && (
                    <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                      {/* Steps */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Étapes d'inférence: {numSteps}
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={numSteps}
                          onChange={(e) => setNumSteps(parseInt(e.target.value))}
                          className="w-full"
                          disabled={isLoading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Plus d'étapes = meilleure qualité mais plus lent
                        </p>
                      </div>

                      {/* Guidance Scale */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Échelle de guidance: {guidanceScale}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          step="0.5"
                          value={guidanceScale}
                          onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                          className="w-full"
                          disabled={isLoading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Plus élevé = plus fidèle au prompt
                        </p>
                      </div>

                      {/* Seed */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Seed (optionnel)
                        </label>
                        <input
                          type="number"
                          value={seed}
                          onChange={(e) => setSeed(e.target.value)}
                          placeholder="Laissez vide pour aléatoire"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Bouton Fine-Tuning (section séparée et proéminente) */}
                <div className="border-t-2 border-gray-200 pt-6 mt-6">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border-2 border-purple-200">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          Entraîner votre modèle personnalisé
                        </h3>
                        <p className="text-sm text-gray-600">
                          Lancez le fine-tuning avec vos {uploadedImage?.length || 0} photo(s).
                          Durée estimée: 30 min - 2h selon votre GPU.
                        </p>
                      </div>
                    </div>

                    {/* Checklist de validation */}
                    <div className="space-y-2 mb-4">
                      <div className={`flex items-center gap-2 text-sm ${
                        uploadedImage && uploadedImage.length >= 10 && uploadedImage.length <= 20
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`}>
                        {uploadedImage && uploadedImage.length >= 10 && uploadedImage.length <= 20 ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span className="font-medium">
                          {uploadedImage && uploadedImage.length >= 10 && uploadedImage.length <= 20
                            ? `✓ ${uploadedImage.length} photos uploadées`
                            : `${uploadedImage?.length || 0}/10 photos (minimum requis)`
                          }
                        </span>
                      </div>

                      <div className={`flex items-center gap-2 text-sm ${
                        validateModelIdentifier(modelIdentifier).valid
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`}>
                        {validateModelIdentifier(modelIdentifier).valid ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span className="font-medium">
                          {validateModelIdentifier(modelIdentifier).valid
                            ? `✓ Identifiant valide: "${modelIdentifier}"`
                            : 'Identifiant du modèle requis'
                          }
                        </span>
                      </div>
                    </div>

                    {/* Bouton de lancement */}
                    <button
                      type="button"
                      onClick={handleFineTuning}
                      disabled={!validateFineTuningData().valid || isFineTuning || isLoading}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-3"
                    >
                      {isFineTuning ? (
                        <>
                          <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Entraînement en cours... {fineTuningProgress}%</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>Lancer le Fine-Tuning</span>
                        </>
                      )}
                    </button>

                    {/* Barre de progression pendant le fine-tuning */}
                    {isFineTuning && (
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 transition-all duration-500 ease-out"
                            style={{ width: `${fineTuningProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Entraînement du modèle "{modelIdentifier}"... Veuillez patienter.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Séparateur */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">ou</span>
                  </div>
                </div>

                {/* Boutons de génération */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isLoading || apiStatus !== 'healthy'}
                    className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Génération...' : 'Générer l\'image'}
                  </button>

                  {generatedImage && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Réinitialiser
                    </button>
                  )}
                </div>
              </form>

              {/* Messages d'erreur */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Exemples de prompts */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Exemples de prompts
              </h3>
              {!modelIdentifier && (
                <p className="text-xs text-yellow-600 mb-3 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Définissez d'abord un identifiant de modèle ci-dessus
                </p>
              )}
              <div className="space-y-2">
                {getExamplePrompts().map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleUseExample(example)}
                    disabled={isLoading || !modelIdentifier}
                    className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-primary-50 rounded-lg text-sm text-gray-700 hover:text-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Colonne droite : Résultat */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl p-6 min-h-[600px] flex items-center justify-center">
              {isLoading ? (
                <LoadingSpinner
                  message="Génération de votre image..."
                  progress={progress}
                />
              ) : generatedImage ? (
                <ImageDisplay imageData={generatedImage} />
              ) : (
                <div className="text-center text-gray-400">
                  <svg className="w-32 h-32 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg font-medium">Aucune image générée</p>
                  <p className="text-sm mt-2">Entrez un prompt et cliquez sur "Générer"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
