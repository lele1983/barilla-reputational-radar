import React from 'react';

export function Loading({ text = 'Caricamento...' }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-barilla-red/30 border-t-barilla-red rounded-full animate-spin" />
        <span className="text-sm text-gray-400">{text}</span>
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-red-400 text-4xl mb-3">!</div>
      <p className="text-gray-300 text-sm mb-4">{message || 'Errore nel caricamento dei dati'}</p>
      {onRetry && (
        <button onClick={onRetry} className="px-4 py-2 text-sm bg-barilla-red/20 text-barilla-red rounded-lg hover:bg-barilla-red/30 transition">
          Riprova
        </button>
      )}
    </div>
  );
}

export function EmptyState({ text = 'Nessun dato disponibile' }) {
  return (
    <div className="flex items-center justify-center py-12 text-gray-500 text-sm">{text}</div>
  );
}
