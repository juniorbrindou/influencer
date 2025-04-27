import React from 'react';
import { useVote } from '../context/VoteContext';
import { Influenceur } from '../types';

interface InfluenceurCardProps {
   /**
   * L'objet influenceur contenant les informations à afficher (nom, image).
   * Cet objet est passé en prop par le composant parent (probablement une liste d'influenceurs).
   */
  influenceur: Influenceur;
}

/**
 * Composant InfluenceurCard : Affiche une carte individuelle pour un influenceur.
 * Inclut son image, son nom et un bouton pour voter pour lui.
 *
 * @param props Les propriétés passées au composant, contenant l'objet influenceur.
 */
const InfluenceurCard: React.FC<InfluenceurCardProps> = ({ influenceur: influenceur }) => {

  // Extrait la fonction selectInfluenceur depuis le contexte de vote
  // Cette fonction sera appelée lors du clic sur le bouton "Voter"
  const { selectInfluenceur: selectInfluenceur } = useVote();

  return (
    <div className="group bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
      <div className="h-48 overflow-hidden">
        <img
          src={influenceur.imageUrl}
          alt={`Photo de ${influenceur.name}`}
          className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"

          // Attribut pour le chargement différé (lazy loading) des images hors écran (améliore les performances)
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