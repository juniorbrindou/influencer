import React, { useEffect, useState } from 'react';
import { useVote } from '../context/useVote';

interface ResultsChartProps {
  categoryId: string;
}

const ResultsChart: React.FC<ResultsChartProps> = ({ categoryId }) => {
  const { listInfluenceur: listInfluenceurs, categories } = useVote();

  // Filtrer les influenceurs par catégorie
  const influenceursByCategory = listInfluenceurs.filter(
    (influenceur) => influenceur.categoryId === categoryId
  );

  // Trouver la catégorie spéciale
  const specialCategory = categories.find(cat => cat.name === "Influenceur2lannee");

  // Si c'est la catégorie spéciale, on prend tous les influenceurs
  const influenceursToShow = categoryId === specialCategory?.id
    ? [...listInfluenceurs] // Tous les influenceurs
    : listInfluenceurs.filter(inf => inf.categoryId === categoryId); // Filtre normal


  // État local pour stocker les influenceurs triés par nombre de votes
  const [sortedInfluenceurs, setSortedInfluenceurs] = useState(
    [...influenceursByCategory].sort((a, b) => b.voteCount - a.voteCount)
  );

  const [animatedBars, setAnimatedBars] = useState<boolean>(false);

  // Calcul du total des votes pour la catégorie
  const totalVotes = influenceursToShow.reduce(
    (total, influenceur) => total + influenceur.voteCount,
    0
  );

  useEffect(() => {
    const sorted = [...influenceursByCategory].sort((a, b) => b.voteCount - a.voteCount);
    setSortedInfluenceurs(sorted);
    setAnimatedBars(false);

    setTimeout(() => {
      setAnimatedBars(true);
    }, 300);
  }, [listInfluenceurs, categoryId]); // Ajout de categoryId comme dépendance

  if (influenceursByCategory.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-600">Aucun influenceur dans cette catégorie pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Résultats des votes</h2>

      <div className="space-y-6">
        {sortedInfluenceurs.map((influenceur) => {
          const percentage = totalVotes > 0 ? (influenceur.voteCount / totalVotes) * 100 : 0;

          return (
            <div key={influenceur.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden">
                    <img
                      src={influenceur.imageUrl as string}
                      alt={influenceur.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="font-medium">{influenceur.name}</span>
                </div>
                <span className="font-semibold text-[#6C63FF]">
                  {influenceur.voteCount} votes
                </span>
              </div>

              <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#6C63FF] rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: animatedBars ? `${percentage}%` : '0%',
                    transitionDelay: '100ms',
                  }}
                ></div>
              </div>

              <p className="text-sm text-gray-600 text-right">
                {percentage.toFixed(1)}%
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResultsChart;