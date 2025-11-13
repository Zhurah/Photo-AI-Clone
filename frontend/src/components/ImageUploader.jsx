import { useState, useRef } from 'react';

const ImageUploader = ({
  onImageSelect,
  maxSizeMB = 5,
  minImages = 10,
  maxImages = 20,
  multipleImages = true
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [images, setImages] = useState([]); // Array d'images au lieu d'une seule
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Validation d'un fichier individuel
  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Format non supporté' };
    }

    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: `Fichier trop volumineux (max ${maxSizeMB}MB)` };
    }

    return { valid: true };
  };

  // Traiter les nouveaux fichiers
  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const newImages = [...images];
    const errors = [];

    // Vérifier qu'on ne dépasse pas le maximum
    if (newImages.length + fileArray.length > maxImages) {
      setError(`Maximum ${maxImages} images autorisées`);
      return;
    }

    // Traiter chaque fichier
    for (const file of fileArray) {
      const validation = validateFile(file);

      if (!validation.valid) {
        errors.push(`${file.name}: ${validation.error}`);
        continue;
      }

      // Lire le fichier et créer un aperçu
      try {
        const preview = await readFileAsDataURL(file);
        newImages.push({
          file,
          preview,
          name: file.name,
          size: file.size,
          id: Date.now() + Math.random() // ID unique
        });
      } catch (err) {
        errors.push(`${file.name}: Erreur de lecture`);
      }
    }

    setImages(newImages);
    onImageSelect(newImages);

    // Afficher les erreurs s'il y en a
    if (errors.length > 0) {
      setError(errors.join(', '));
      setTimeout(() => setError(null), 5000);
    } else {
      setError(null);
    }
  };

  // Helper pour lire un fichier
  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Supprimer une image spécifique
  const handleRemoveImage = (imageId) => {
    const newImages = images.filter(img => img.id !== imageId);
    setImages(newImages);
    onImageSelect(newImages);
    setError(null);
  };

  // Supprimer toutes les images
  const handleRemoveAll = () => {
    setImages([]);
    onImageSelect([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setError(null);
  };

  // Handlers drag & drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  // Handlers file picker
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  // Validation du nombre d'images
  const isValidCount = images.length >= minImages && images.length <= maxImages;
  const needsMore = images.length < minImages;
  const tooMany = images.length > maxImages;

  return (
    <div className="w-full">
      {/* Input file caché avec support multi-sélection */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        onChange={handleInputChange}
        className="hidden"
        multiple={multipleImages}
      />

      {/* Zone de drag & drop */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8
          cursor-pointer transition-all duration-200
          ${isDragging
            ? 'border-blue-500 bg-blue-50'
            : images.length >= maxImages
              ? 'border-gray-200 bg-gray-100 cursor-not-allowed'
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }
        `}
      >
        <div className="flex flex-col items-center justify-center text-center">
          {/* Icône upload */}
          <svg
            className="w-12 h-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          {/* Texte */}
          <p className="text-lg font-medium text-gray-700 mb-2">
            {isDragging ? 'Déposez les images ici' : 'Glissez vos photos ici'}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            ou cliquez pour parcourir
          </p>

          {/* Info formats */}
          <p className="text-xs text-gray-400">
            JPG, PNG, WEBP - Max {maxSizeMB}MB par image
          </p>
          <p className="text-xs text-gray-500 font-medium mt-2">
            {images.length}/{maxImages} photos • Minimum {minImages} requises
          </p>
        </div>
      </div>

      {/* Galerie d'aperçu des images */}
      {images.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Photos sélectionnées ({images.length})
            </h3>
            <button
              onClick={handleRemoveAll}
              className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Tout supprimer
            </button>
          </div>

          {/* Grille d'images */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-all"
              >
                <img
                  src={image.preview}
                  alt={image.name}
                  className="w-full h-full object-cover"
                />

                {/* Overlay avec bouton supprimer */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(image.id);
                    }}
                    className="
                      opacity-0 group-hover:opacity-100
                      bg-red-600 hover:bg-red-700
                      text-white p-2 rounded-full
                      transition-opacity duration-200
                    "
                    title="Supprimer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Nom du fichier (tronqué) */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                  <p className="text-xs text-white truncate">{image.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Indicateur de statut */}
      {images.length > 0 && (
        <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
          isValidCount
            ? 'bg-green-50 border border-green-200'
            : needsMore
              ? 'bg-yellow-50 border border-yellow-200'
              : 'bg-red-50 border border-red-200'
        }`}>
          <svg
            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              isValidCount ? 'text-green-600' : needsMore ? 'text-yellow-600' : 'text-red-600'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            {isValidCount ? (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            )}
          </svg>
          <div className="flex-1">
            <p className={`text-sm font-medium ${
              isValidCount ? 'text-green-800' : needsMore ? 'text-yellow-800' : 'text-red-800'
            }`}>
              {isValidCount
                ? `✓ Parfait ! ${images.length} photos sélectionnées`
                : needsMore
                  ? `Il vous manque ${minImages - images.length} photo(s) (minimum ${minImages})`
                  : `Trop de photos ! Supprimez-en ${images.length - maxImages}`
              }
            </p>
          </div>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <svg
            className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
