// src/components/ModalImpact.tsx
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const ModalImpact = ({ onClose }: { onClose: () => void }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animation d'entrée
    gsap.from(modalRef.current, {
      duration: 0.8,
      y: 80,
      ease: 'power3.out'
    });

    // Effet de brillance
    gsap.to(shineRef.current, {
      x: '100%',
      duration: 3,
      repeat: -1,
      ease: 'none'
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fond moins transparent */}
      <div
        className="absolute inset-0 bg-black/90"
        onClick={onClose}
      />

      {/* Conteneur principal - plus opaque */}
      <div
        className="relative z-10 w-full max-w-2xl bg-gray-900 rounded-xl overflow-hidden border-2 border-yellow-400 shadow-2xl"
      >
        {/* Effet de brillance */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            ref={shineRef}
            className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent"
            style={{ transform: 'skewX(-20deg)' }}
          />
        </div>

        {/* Contenu */}
        <div className="relative z-10 p-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-yellow-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* En-tête visible */}
          <div className="flex items-center mb-6">
            <div className="mr-4 p-3 bg-yellow-400 rounded-lg animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-yellow-400">INFLUENCEUR2LANNEE</h2>
            </div>
          </div>

          {/* Message principal - version améliorée */}
          <div className="mb-8 p-5 bg-black/80 rounded-lg border-2 border-yellow-400/60 shadow-lg">
            <p className="text-2xl font-bold mb-4 text-center text-yellow-400 animate-pulse">
              🚨 VOTEZ MAINTENANT !
            </p>

            <div className="space-y-3">
              <p className="flex items-start">
                <span className="text-yellow-400 mr-2">⏳</span>
                <span>
                  <strong className="underline">DERNIERE LIGNE DROITE</strong> ! Les votes prennent fin le
                  <strong className="text-yellow-400"> 31 MAI À 23H59</strong>
                </span>
              </p>

            </div>

          </div>

          {/* Bouton d'action plus visible */}
          <div className="text-center">
            <button
              onClick={onClose}
              className="w-full max-w-md py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold text-lg rounded-lg transition-all duration-300 shadow-lg hover:shadow-yellow-400/40 hover:scale-105"
            >
              JE VOTE MAINTENANT ➔
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalImpact;