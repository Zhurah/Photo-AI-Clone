import React from 'react';

const ImageDisplay = ({ imageData, onDownload, onShare }) => {
  const { imageUrl, generationTime, modelUsed } = imageData;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `clone-photo-ai-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onDownload) onDownload();
  };

  return (
    <div className="w-full space-y-4">
      {/* Image générée */}
      <div className="relative group rounded-lg overflow-hidden shadow-2xl bg-white">
        <img
          src={imageUrl}
          alt="Generated"
          className="w-full h-auto object-contain"
        />

        {/* Overlay au hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            onClick={handleDownload}
            className="bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-gray-100 transition-colors"
          >
            Télécharger l'image
          </button>
        </div>
      </div>

      {/* Informations et actions */}
      <div className="bg-white rounded-lg p-4 shadow-md space-y-3">
        {/* Métadonnées */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 font-medium">Temps de génération</p>
            <p className="text-gray-900 font-semibold">{generationTime?.toFixed(2)}s</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium">Modèle utilisé</p>
            <p className="text-gray-900 font-semibold text-xs truncate" title={modelUsed}>
              {modelUsed || 'Default'}
            </p>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Télécharger
          </button>

          {onShare && (
            <button
              onClick={onShare}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Partager
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageDisplay;
