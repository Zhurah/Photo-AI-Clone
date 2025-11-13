import React from 'react';

const LoadingSpinner = ({ message = 'Génération en cours...', progress = null }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      {/* Spinner animé */}
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-primary-400 rounded-full animate-spin"
             style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
      </div>

      {/* Message */}
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-gray-700">{message}</p>

        {/* Barre de progression si disponible */}
        {progress !== null && (
          <div className="w-64 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {/* Texte informatif */}
        <p className="text-sm text-gray-500">
          {progress !== null
            ? `${progress}% terminé`
            : 'Cela peut prendre quelques minutes...'}
        </p>
      </div>

      {/* Animation de points */}
      <div className="flex space-x-2">
        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
