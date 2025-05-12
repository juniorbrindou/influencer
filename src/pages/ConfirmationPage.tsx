import { CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useVote } from "../context/useVote";
import { useEffect } from "react";

const ConfirmationPage: React.FC = () => {
  const { votes, listInfluenceur } = useVote();
  const navigate = useNavigate();

  // Trouver le dernier influenceur voté
  const lastVoted = votes.length > 0 
    ? listInfluenceur.find(inf => inf.id === votes[votes.length - 1].influenceurId)
    : null;


  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6 flex justify-center">
          <CheckCircle className="h-16 w-16 text-[#28a745]" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-4">Merci pour votre vote !</h1>

        {lastVoted && (
          <p className="text-gray-600 mb-4">
            Vous avez voté pour <span className="font-semibold">{lastVoted.name}</span>
          </p>
        )}

        <p className="text-gray-600 mb-8">
          Votre vote a été enregistré avec succès.
        </p>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
          {/* <Link
            to="/results"
            className="px-6 py-2 bg-[#6C63FF] text-white rounded-md hover:bg-[#5A52D5] transition-colors"
          >
            Voir les résultats
          </Link> */}

          <Link
            to="/"
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;