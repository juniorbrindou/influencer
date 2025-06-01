// src/components/ModalVotesEnded.tsx
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const ModalVotesClosed = ({ onClose }: { onClose: () => void }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const confettiRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animation d'entrée adaptée aux mobiles
    gsap.from(modalRef.current, {
      duration: 0.6,
      y: 50,
      ease: 'power2.out',
    });

    // Animation des confettis simplifiée sur mobile
    const confettiElements = confettiRef.current?.children;
    if (confettiElements) {
      gsap.to(confettiElements, {
        y: (i) => i % 2 === 0 ? -5 : 5,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto">
      {/* Fond fixe */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Conteneur principal avec hauteur maximale et défilement */}
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-2xl bg-gray-900 rounded-2xl overflow-hidden border-2 border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.3)] my-8"
        style={{ maxHeight: '90vh' }}
      >
        {/* Bouton fermer fixe en haut à droite */}
        <button
          onClick={onClose}
          className="fixed md:absolute top-4 right-4 z-20 text-yellow-400 bg-gray-900 rounded-full p-2 hover:text-white transition-all duration-300 hover:rotate-90 shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Effet de confettis */}
        <div ref={confettiRef} className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute text-yellow-400 text-lg md:text-xl opacity-70"
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

        {/* Contenu avec défilement */}
        <div 
          ref={contentRef}
          className="relative z-10 p-6 md:p-8 text-white overflow-y-auto"
          style={{ maxHeight: 'calc(90vh - 32px)' }}
        >
          {/* En-tête responsive */}
          <div className="flex flex-col items-center mb-6 md:mb-8">
            <div className="relative mb-4 md:mb-6">
              <div className="absolute -inset-3 md:-inset-4 bg-yellow-400 rounded-full blur-md opacity-30 animate-pulse"></div>
              <div className="relative p-3 md:p-5 bg-yellow-400 rounded-full text-black">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 md:h-12 w-8 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-center">
              <span className="text-yellow-400 bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 text-transparent">
                MERCI À TOUS !
              </span>
            </h2>
          </div>

          {/* Message principal adapté */}
          <div className="mb-6 md:mb-10 p-4 md:p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg md:rounded-xl border border-yellow-400/30 shadow-lg">
            <p className="text-xl md:text-3xl font-extrabold mb-4 md:mb-6 text-center text-yellow-400">
              🎉 LES VOTES SONT TERMINÉS 🎉
            </p>

            <div className="space-y-3 md:space-y-4 text-base md:text-lg">
              <p className="flex flex-col md:flex-row items-center justify-center text-center md:text-left">
                <span className="text-yellow-400 mb-2 md:mb-0 md:mr-3 text-xl md:text-2xl">✨</span>
                <span>
                  La compétition <strong className="text-yellow-400">INFLUENCEUR2LANNEE</strong> est maintenant close !
                </span>
              </p>

              <p className="text-center pt-3 md:pt-4 text-gray-300">
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
  );
};

export default ModalVotesClosed;