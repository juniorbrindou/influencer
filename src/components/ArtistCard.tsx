import React from 'react';
import { useVote } from '../context/VoteContext';
import { Artist } from '../types';

interface ArtistCardProps {
  artist: Artist;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  const { selectArtist } = useVote();
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="h-48 overflow-hidden">
        <img 
          src={artist.imageUrl} 
          alt={`Photo de ${artist.name}`} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{artist.name}</h3>
        
        <button
          onClick={() => selectArtist(artist)}
          className="w-full py-2 bg-[#6C63FF] text-white rounded-md hover:bg-[#5A52D5] transition-colors"
        >
          Voter
        </button>
      </div>
    </div>
  );
};

export default ArtistCard;