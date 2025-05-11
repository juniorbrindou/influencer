import React, { useState } from 'react';
import { Influenceur } from '../types';
import { useVote } from '../context/useVote';
import { X } from 'lucide-react';

interface InfluenceurCardProps {
  influenceur: Influenceur;
  isSpecialCategory?: boolean;
}

const InfluenceurCard: React.FC<InfluenceurCardProps> = ({
  influenceur,
  isSpecialCategory = false
}) => {
  const { selectInfluenceur, setSpecialVote } = useVote();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Reset specialVote quand la modale s'ouvre
  const handlePreviewOpen = () => {
    setSpecialVote(false);
    setIsPreviewOpen(true);
  };


  const handleVoteClick = () => {
    if (isSpecialCategory) {
      setSpecialVote(true); // Force le vote spécial
    }
    selectInfluenceur(influenceur);
  };


  // Gestion propre du vote depuis la modale
  const handleVoteFromModal = () => {
    setIsPreviewOpen(false);
    if (isSpecialCategory) {
      setSpecialVote(true); // Active specialVote si nécessaire
    }
    selectInfluenceur(influenceur);
  };


  return (
    <>
      <div className={`group rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${isSpecialCategory ? 'border-2 border-yellow-500 bg-white' : 'bg-white'
        }`}>
        <div
          className="h-48 overflow-hidden cursor-pointer"
          onClick={handlePreviewOpen} // Utilisez la nouvelle fonction
        >
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
            onClick={handleVoteClick}
            className="w-full py-2 bg-black text-yellow-500 rounded-md hover:bg-yellow-500 hover:text-black transition-all duration-300 transform active:scale-95 hover:shadow-lg"
          >
            Voter
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex justify-between items-center p-4 bg-white border-b">
              <h3 className="text-xl font-bold">{influenceur.name}</h3>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1 rounded-full hover:bg-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <img
                  src={influenceur.imageUrl as string}
                  alt={`Photo de ${influenceur.name}`}
                  className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
                />
              </div>

              <button
                onClick={handleVoteFromModal}
                className="w-full py-3 bg-black text-yellow-500 rounded-md hover:bg-yellow-500 hover:text-black transition-all duration-300 font-bold"
              >
                Voter pour {influenceur.name}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InfluenceurCard;