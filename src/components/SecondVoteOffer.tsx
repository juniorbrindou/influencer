import { X } from "lucide-react";
import { Influenceur } from "../types";

interface SecondVoteOfferProps {
  onAccept: () => void;
  onDecline: () => void;
  influenceur: Influenceur;
  isSpecialCategory?: boolean; // Ajoutez cette prop
}

const SecondVoteOffer: React.FC<SecondVoteOfferProps> = ({
  onAccept,
  onDecline,
  influenceur,
  isSpecialCategory
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100 animate-slideIn">
        {/* En-tête avec le nom de l'influenceur */}
        <div className="flex justify-between items-center p-5 bg-black text-yellow-500">
          <h2 className="text-xl font-semibold">
            {isSpecialCategory 
              ? `Vote spécial pour ${influenceur.name}` 
              : `Utiliser votre vote spécial pour ${influenceur.name}`}
          </h2>
          <button
            onClick={onDecline}
            className="p-1 rounded-full hover:bg-yellow-500 hover:text-black transition-all duration-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Corps de la modale */}
        <div className="p-6">
          {/* Photo de l'influenceur */}
          <div className="flex justify-center mb-4">
            <img
              src={influenceur.imageUrl as string}
              alt={influenceur.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-yellow-500"
            />
          </div>

          <div className="mb-6 text-center">
            <h3 className="text-lg font-medium mb-2">Utiliser votre vote spécial</h3>
            <p className="text-gray-700">
              Vous avez déjà voté dans une catégorie normale. Souhaitez-vous utiliser
              votre vote spécial pour {influenceur.name} dans la catégorie "Influenceur2lannee"?
            </p>
          </div>

          {/* Boutons avec envoi au backend */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={onDecline}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors duration-300"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                onAccept();
              }}
              className="px-6 py-2 bg-black text-yellow-500 rounded-md hover:bg-yellow-500 hover:text-black transition-colors duration-300"
            >
              Confirmer mon vote spécial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecondVoteOffer;