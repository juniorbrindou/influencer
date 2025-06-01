// src/components/ModalVotesEnded.tsx
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const ModalVotesClosed = ({ onClose }: { onClose: () => void }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const confettiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animation d'entrée dynamique
    gsap.from(modalRef.current, {
      duration: 0.8,
      y: 80,
      ease: 'back.out(1.2)',
    });

    // Animation des confettis
    const confettiElements = confettiRef.current?.children;
    if (confettiElements) {
      gsap.to(confettiElements, {
        y: (i) => i % 2 === 0 ? -10 : 10,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fond avec effet de flou */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Conteneur principal - Style néon moderne */}
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-2xl bg-gray-900 rounded-2xl overflow-hidden border-2 border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.3)]"
      >
        {/* Effet de confettis */}
        <div ref={confettiRef} className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-yellow-400 text-xl opacity-70"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            >
              {['✦', '✧', '★', '✹', '❈'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>

        {/* Contenu */}
        <div className="relative z-10 p-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-yellow-400 hover:text-white transition-all duration-300 hover:rotate-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* En-tête stylisé */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-6">
              <div className="absolute -inset-4 bg-yellow-400 rounded-full blur-md opacity-30 animate-pulse"></div>
              <div className="relative p-5 bg-yellow-400 rounded-full text-black">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-center">
              <span className="text-yellow-400 bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 text-transparent">
                MERCI À TOUS !
              </span>
            </h2>
          </div>

          {/* Message principal avec effet 3D */}
          <div className="mb-10 p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-yellow-400/30 shadow-lg transform perspective-1000">
            <div className="transform rotate-x-1">
              <p className="text-3xl font-extrabold mb-6 text-center text-yellow-400">
                🎉 LES VOTES SONT TERMINÉS 🎉
              </p>

              <div className="space-y-4 text-lg">
                <p className="flex items-center justify-center">
                  <span className="text-yellow-400 mr-3 text-2xl">✨</span>
                  <span>
                    La compétition <strong className="text-yellow-400">INFLUENCEUR2LANNEE</strong> est maintenant close !
                  </span>
                </p>

                <p className="text-center pt-4 text-gray-300">
                  Un immense merci pour votre participation et votre enthousiasme !
                </p>

                <p className="text-center text-yellow-300 font-medium">
                  Restez connectés pour découvrir les résultats très bientôt !
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ModalVotesClosed;