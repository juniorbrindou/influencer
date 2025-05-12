import React, { useEffect, useState, useRef } from 'react';
import { useVote } from '../context/useVote';
import { ClassementData } from '../types';

interface ResultsChartProps {
  categoryId: string;
  categoryName?: string; // Ajout de la prop categoryName
}

const ResultsChart: React.FC<ResultsChartProps> = ({ categoryId, categoryName }) => {
  const { fetchResults } = useVote();
  const [results, setResults] = useState<ClassementData | null>(null);
  const [displayedPercentages, setDisplayedPercentages] = useState<Record<string, number>>({});
  const prevResultsRef = useRef<ClassementData | null>(null);

  // Détermine si c'est la catégorie spéciale
  const isLuxuryMode = categoryName === "INFLUENCEUR2LANNEE";

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const data = await fetchResults(categoryId);
        if (isMounted) {
          prevResultsRef.current = results;
          setResults(data);

          // Initialize displayed percentages
          const initialPercentages: Record<string, number> = {};
          data.influenceurs.forEach(infl => {
            const percentage = data.totalVotes > 0
              ? (infl.voteCount / data.totalVotes) * 100
              : 0;
            initialPercentages[infl.id] = 0;
          });
          setDisplayedPercentages(initialPercentages);

          // Animate to actual percentages
          setTimeout(() => {
            if (isMounted) {
              const targetPercentages: Record<string, number> = {};
              data.influenceurs.forEach(infl => {
                const percentage = data.totalVotes > 0
                  ? (infl.voteCount / data.totalVotes) * 100
                  : 0;
                targetPercentages[infl.id] = percentage;
              });
              setDisplayedPercentages(targetPercentages);
            }
          }, 50);
        }
      } catch (error) {
        console.error("Failed to load results", error);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [categoryId, fetchResults]);

  // Handle WebSocket updates
  useEffect(() => {
    if (!results) return;

    // When results change (e.g., via WebSocket), animate to new percentages
    const targetPercentages: Record<string, number> = {};
    results.influenceurs.forEach(infl => {
      const percentage = results.totalVotes > 0
        ? (infl.voteCount / results.totalVotes) * 100
        : 0;
      targetPercentages[infl.id] = percentage;
    });

    // Only animate if the percentages actually changed
    let shouldAnimate = false;
    for (const [id, percentage] of Object.entries(targetPercentages)) {
      if (Math.abs(displayedPercentages[id] - percentage) > 0.1) {
        shouldAnimate = true;
        break;
      }
    }

    if (shouldAnimate) {
      setDisplayedPercentages(targetPercentages);
    }
  }, [results]);

  if (!results) {
    return (
      <div className={`rounded-lg shadow-md p-6 text-center ${isLuxuryMode ? 'bg-gradient-to-br from-purple-900 to-indigo-800 text-white' : 'bg-white text-gray-600'}`}>
        <p>Chargement des résultats...</p>
      </div>
    );
  }

  if (results.influenceurs.length === 0) {
    return (
      <div className={`rounded-lg shadow-md p-6 text-center ${isLuxuryMode ? 'bg-gradient-to-br from-purple-900 to-indigo-800 text-white' : 'bg-white text-gray-600'}`}>
        <p>Aucun influenceur dans cette catégorie pour le moment.</p>
      </div>
    );
  }

  // Trier les influenceurs par nombre de votes décroissant et ajouter un rang
  const rankedInfluenceurs = [...results.influenceurs]
    .sort((a, b) => b.voteCount - a.voteCount)
    .map((influenceur, index) => ({
      ...influenceur,
      rank: index + 1
    }));

  return (
    <div className={`rounded-lg shadow-xl p-6 ${isLuxuryMode ? 
      'bg-gradient-to-br from-purple-900 to-indigo-800 text-white border-2 border-gold-500' : 
      'bg-white text-gray-800'}`}
    >
      <h2 className={`text-xl font-semibold mb-6 ${isLuxuryMode ? 
        'text-white text-2xl font-bold text-center mb-8' : 
        'text-gray-800'}`}
      >
        {results.isSpecialCategory ? "Résultats des votes spéciaux" : "Résultats des votes"}
        {isLuxuryMode && (
          <div className="text-yellow-300 text-3xl mt-2 animate-pulse">★</div>
        )}
      </h2>

      <div className="space-y-6">
        {rankedInfluenceurs.map((influenceur) => {
          const targetPercentage = results.totalVotes > 0
            ? (influenceur.voteCount / results.totalVotes) * 100
            : 0;

          const displayedPercentage = displayedPercentages[influenceur.id] || 0;

          return (
            <div key={influenceur.id} className="space-y-2 group">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <span className={`w-6 text-center font-bold ${isLuxuryMode ? 
                      'text-yellow-300 text-xl' : 
                      'text-gray-700'}`}
                    >
                      {influenceur.rank}
                    </span>
                    <div className={`h-10 w-10 rounded-full overflow-hidden ml-2 ${isLuxuryMode ? 
                      'ring-2 ring-yellow-300 group-hover:ring-4 transition-all duration-300' : 
                      ''}`}
                    >
                      <img
                        src={influenceur.imageUrl}
                        alt={influenceur.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                  <span className={`font-medium ${isLuxuryMode ? 
                    'text-white text-lg' : 
                    ''}`}
                  >
                    {influenceur.name}
                  </span>
                </div>
                <span className={`font-semibold ${isLuxuryMode ? 
                  'text-yellow-300 text-lg' : 
                  'text-[#6C63FF]'}`}
                >
                  {influenceur.voteCount} votes
                </span>
              </div>

              <div className={`h-6 rounded-full overflow-hidden ${isLuxuryMode ? 
                'bg-opacity-20 bg-white' : 
                'bg-gray-200'}`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${isLuxuryMode ? 
                    'bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-lg' : 
                    'bg-[#6C63FF]'}`}
                  style={{
                    width: `${displayedPercentage}%`,
                  }}
                ></div>
              </div>

              <p className={`text-sm text-right ${isLuxuryMode ? 
                'text-yellow-300 font-bold' : 
                'text-gray-600'}`}
              >
                {targetPercentage.toFixed(1)}%
                {isLuxuryMode && (
                  <span className="ml-2 text-xs opacity-70">du total</span>
                )}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResultsChart;