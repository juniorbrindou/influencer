import React, { useEffect, useState } from 'react';
import { useVote } from '../context/useVote';

// Définition du composant fonctionnel ResultsChart
const ResultsChart: React.FC = () => {
  // Utilisation du hook personnalisé useVote pour accéder à la liste des influenceurs
  const { listInfluenceur: listInfluenceurs } = useVote();

  // État local pour stocker les influenceurs triés par nombre de votes
  // Initialisé avec une copie triée de la liste des influenceurs
  const [sortedInfluenceurs, setSortedInfluenceurs] = useState([...listInfluenceurs].sort((a, b) => b.voteCount - a.voteCount));

  // État local pour contrôler l'animation des barres de résultats
  const [animatedBars, setAnimatedBars] = useState<boolean>(false);

  // Calcul du total des votes pour calculer les pourcentages
  const totalVotes = listInfluenceurs.reduce((total, influenceur) => total + influenceur.voteCount, 0);

  // Effet pour trier les influenceurs et déclencher l'animation lors de la mise à jour de la liste
  useEffect(() => {
    // Crée une copie de la liste et la trie par nombre de votes décroissant
    const sorted = [...listInfluenceurs].sort((a, b) => b.voteCount - a.voteCount);
    // Met à jour l'état avec la liste triée
    setSortedInfluenceurs(sorted);

    // Déclenche l'animation des barres après un court délai (300ms)
    // Cela permet au DOM de se mettre à jour avant de lancer l'animation
    setTimeout(() => {
      setAnimatedBars(true);
    }, 300);
  }, [listInfluenceurs]); // Dépendance à listInfluenceurs : l'effet s'exécute lorsque cette liste change


  // Rendu du composant
  return (
    // Conteneur principal avec styles Tailwind CSS
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Titre du graphique */}
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Résultats des votes</h2>

      {/* Conteneur pour la liste des résultats de chaque influenceur */}
      <div className="space-y-6">
        {/* Parcours de la liste des influenceurs triés pour afficher chaque résultat */}
        {sortedInfluenceurs.map((influenceur) => {
          // Calcul du pourcentage de votes pour l'influenceur actuel
          // Évite la division par zéro si totalVotes est 0
          const percentage = totalVotes > 0 ? (influenceur.voteCount / totalVotes) * 100 : 0;

          return (
            // Conteneur pour un influenceur individuel avec une clé unique
            <div key={influenceur.id} className="space-y-2">
              {/* Ligne affichant l'image, le nom et le nombre de votes */}
              <div className="flex justify-between items-center">
                {/* Image et nom de l'influenceur */}
                <div className="flex items-center space-x-3">
                  {/* Conteneur pour l'image (arrondi et masquant le dépassement) */}
                  <div className="h-10 w-10 rounded-full overflow-hidden">
                    <img
                      src={influenceur.imageUrl} // URL de l'image
                      alt={influenceur.name} // Texte alternatif pour l'image
                      className="h-full w-full object-cover" // Styles pour l'image
                    />
                  </div>
                  {/* Nom de l'influenceur */}
                  <span className="font-medium">{influenceur.name}</span>
                </div>
                {/* Nombre de votes */}
                <span className="font-semibold text-[#6C63FF]">{influenceur.voteCount} votes</span>
              </div>

              {/* Barre de progression visuelle des votes */}
              <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#6C63FF] rounded-full transition-all duration-1000 ease-out"
                  style={{
                    // Définit la largeur de la barre en pourcentage, animée si animatedBars est vrai
                    width: animatedBars ? `${percentage}%` : '0%',
                    // Ajoute un léger délai à l'animation pour un effet de cascade
                    transitionDelay: '100ms'
                  }}
                ></div>
              </div>

              {/* Affichage du pourcentage de votes */}
              <p className="text-sm text-gray-600 text-right">{percentage.toFixed(1)}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Exportation du composant
export default ResultsChart;