import React from 'react';
import { Influenceur } from '../types';
import { useVote } from '../context/useVote';

interface InfluenceurCardProps {
  influenceur: Influenceur;
}

const InfluenceurCard: React.FC<InfluenceurCardProps> = ({ influenceur }) => {
  const { selectInfluenceur } = useVote();

  return (
    <div className="group bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
      <div className="h-48 overflow-hidden">
        <img
          src={influenceur.imageUrl as string}
          alt={`Photo de ${influenceur.name}`}
          className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-yellow-600 transition-colors">
          {influenceur.name}
        </h3>

        <button
          onClick={() => selectInfluenceur(influenceur)}
          className="w-full py-2 bg-black text-yellow-500 rounded-md hover:bg-yellow-500 hover:text-black transition-all duration-300 transform active:scale-95 hover:shadow-lg"
        >
          Voter
        </button>
      </div>
    </div>
  );
};

export default InfluenceurCard;