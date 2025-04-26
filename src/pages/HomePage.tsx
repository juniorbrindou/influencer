import React from 'react';
import InfluenceurCard from '../components/ArtistCard';
import VoteModal from '../components/VoteModal';
import { useVote } from '../context/VoteContext';

const HomePage: React.FC = () => {
  const { listInfluenceur: influenceurs, selectedInfluenceur: selectedInfluenceur } = useVote();

  return (
    <div>
      {/* Hero Banner */}
      <div className="w-full h-[400px] relative mb-12">
        <img
          src="/banner.jpg"
          alt="Première édition des influenceurs de l'année 2025"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
          <div className="container mx-auto px-4 py-8 text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Première Édition<br />
              Des Influenceurs de l'Année 2025
            </h1>
            <p className="text-lg md:text-xl text-yellow-500 max-w-2xl">
              Votez pour votre influenceur préféré et participez à la première édition de ce grand événement.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Votez pour votre influenceur préféré</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Soutenez vos influenceurs préférés en votant pour eux. C'est gratuit et sans création de compte.
          </p>
        </div>

        {/* Influenceur Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {influenceurs.map(influenceur => (
            <InfluenceurCard key={influenceur.id} influenceur={influenceur} />
          ))}
        </div>

        {/* Vote Modal */}
        {selectedInfluenceur && <VoteModal />}
      </div>
    </div>
  );
};

export default HomePage;