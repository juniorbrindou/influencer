import React, { useState } from 'react';
import { Influenceur } from '../types';
import { useVote } from '../context/useVote';
import { X } from 'lucide-react';

interface InfluenceurCardProps {
  influenceur: Influenceur;
}

const InfluenceurCard: React.FC<InfluenceurCardProps> = ({ influenceur }) => {
  const { selectInfluenceur } = useVote();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <>
      <div className="group bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
        {/* Clickable image that opens preview */}
        <div 
          className="h-48 overflow-hidden cursor-pointer"
          onClick={() => setIsPreviewOpen(true)}
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
            onClick={() => selectInfluenceur(influenceur)}
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
              
                {/* <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-2">Description</h4>
                  <p className="text-gray-700">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Aut architecto eaque ratione officiis repellat facere. Quasi et, nulla veritatis maxime libero at expedita, nesciunt similique in, omnis ullam ipsam quam?</p>
                </div> */}

              <button
                onClick={() => {
                  setIsPreviewOpen(false);
                  selectInfluenceur(influenceur);
                }}
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