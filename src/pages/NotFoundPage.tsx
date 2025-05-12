import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
      {/* Fond élégant avec effet de brillance */}
      <div className="absolute inset-0 bg-black bg-opacity-90 z-0">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500 rounded-full filter blur-[100px] opacity-30"></div>
          <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-yellow-400 rounded-full filter blur-[80px] opacity-20"></div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 text-center p-12 max-w-4xl mx-6 border border-yellow-600 rounded-xl bg-gradient-to-b from-black to-gray-900 shadow-2xl">
        {/* Élément décoratif haut */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center shadow-glow">
          <Sparkles className="h-6 w-6 text-black" />
        </div>

        {/* Titre avec effet métallique */}
        <h1 className="text-8xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 font-serif tracking-tight">
          404
        </h1>

        <h2 className="text-3xl font-medium text-yellow-100 mb-4 uppercase tracking-wider">
          Page Introuvable
        </h2>

        <div className="w-24 h-1 bg-gradient-to-r from-yellow-600 to-yellow-300 mx-auto my-6"></div>

        <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
          Oups! La page que vous cherchez semble s'être évanouie dans les limbes du digital.
          <br />
          Peut-être a-t-elle été déplacée ou n'existe-t-elle simplement pas.
        </p>

        {/* Bouton de retour avec effet luxueux */}
        <Link
          to="/"
          className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-medium rounded-full hover:from-yellow-500 hover:to-yellow-400 transition-all duration-300 shadow-lg hover:shadow-yellow-500/30 group"
        >
          <span className="relative z-10">Retour à l'Accueil</span>
        </Link>

        {/* Élément décoratif bas */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-yellow-500 rounded-full opacity-80"></div>
      </div>

      {/* Effets de particules (optionnel) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
              transform: `scale(${Math.random() * 2 + 1})`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default NotFoundPage;