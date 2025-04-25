import React from 'react';
import ArtistCard from '../components/ArtistCard';
import VoteModal from '../components/VoteModal';
import { useVote } from '../context/VoteContext';

const HomePage: React.FC = () => {
  const { artists, selectedArtist } = useVote();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Votez pour votre artiste préféré</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Soutenez vos artistes préférés en votant pour eux. C'est gratuit et sans création de compte.
        </p>
      </div>
      
      {/* Artist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {artists.map(artist => (
          <ArtistCard key={artist.id} artist={artist} />
        ))}
      </div>
      
      {/* Vote Modal */}
      {selectedArtist && <VoteModal />}
    </div>
  );
};

export default HomePage;