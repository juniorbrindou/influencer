import React, { useEffect, useState, useRef } from 'react';
import { useVote } from '../context/useVote';
import { ClassementData } from '../types';

interface ResultsChartProps {
  categoryId: string;
  categoryName?: string;
}

const ResultsChart: React.FC<ResultsChartProps> = ({ categoryId, categoryName }) => {
  const { fetchResults } = useVote();
  const [results, setResults] = useState<ClassementData | null>(null);
  const [displayedPercentages, setDisplayedPercentages] = useState<Record<string, number>>({});
  const prevResultsRef = useRef<ClassementData | null>(null);

  const getStyleLevel = () => {
    if (categoryName === "INFLUENCEUR2LANNEE") return 3; // Niveau maximum
    if (categoryName?.includes("SPECIAL") || categoryName?.includes("PREMIUM")) return 2;
    return 1; // Niveau de base
  };

  useEffect(() => {
  const interval = setInterval(() => {
    fetchResults(categoryId);
  }, 1000 * 30); // Toutes les 30 secondes

  return () => clearInterval(interval);
}, [categoryId, fetchResults]);

  const styleLevel = getStyleLevel();

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const data = await fetchResults(categoryId);
        if (isMounted) {
          prevResultsRef.current = results;
          setResults(data);

          const initialPercentages: Record<string, number> = {};
          data.influenceurs.forEach(infl => {
            const percentage = data.totalVotes > 0
              ? (infl.voteCount / data.totalVotes) * 100
              : 0;
            initialPercentages[infl.id] = 0;
          });
          setDisplayedPercentages(initialPercentages);

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

  useEffect(() => {
    if (!results) return;

    const targetPercentages: Record<string, number> = {};
    results.influenceurs.forEach(infl => {
      const percentage = results.totalVotes > 0
        ? (infl.voteCount / results.totalVotes) * 100
        : 0;
      targetPercentages[infl.id] = percentage;
    });

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
      <div className={`rounded-lg shadow-md p-6 text-center ${
        styleLevel === 3 ? 'bg-gradient-to-br from-purple-900 to-indigo-800 text-white' :
        styleLevel === 2 ? 'bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-800' :
        'bg-white text-gray-600'
      }`}>
        <p>Chargement des résultats...</p>
      </div>
    );
  }

  if (results.influenceurs.length === 0) {
    return (
      <div className={`rounded-lg shadow-md p-6 text-center ${
        styleLevel === 3 ? 'bg-gradient-to-br from-purple-900 to-indigo-800 text-white' :
        styleLevel === 2 ? 'bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-800' :
        'bg-white text-gray-600'
      }`}>
        <p>Aucun influenceur dans cette catégorie pour le moment.</p>
      </div>
    );
  }

  const rankedInfluenceurs = [...results.influenceurs]
    .sort((a, b) => b.voteCount - a.voteCount)
    .map((influenceur, index) => ({
      ...influenceur,
      rank: index + 1
    }));

  return (
    <div className={`rounded-lg p-6 ${
      styleLevel === 3 ? 
        'bg-gradient-to-br from-purple-900 to-indigo-800 text-white shadow-xl border-2 border-yellow-400' :
      styleLevel === 2 ? 
        'bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-800 shadow-lg border border-indigo-200' :
        'bg-white text-gray-800 shadow-md'
    }`}>
      <h2 className={`${
        styleLevel === 3 ? 
          'text-2xl font-bold text-center mb-8 text-white' :
        styleLevel === 2 ? 
          'text-xl font-semibold mb-6 text-indigo-800 text-center' :
          'text-xl font-semibold mb-6 text-gray-800'
      }`}>
        {results.isSpecialCategory ? "INFLUENCEUR DE LANNEE 2025" : "Résultats des votes"}
        {styleLevel === 3 && (
          <div className="text-yellow-300 text-3xl mt-2 animate-pulse">★</div>
        )}
        {styleLevel === 2 && (
          <div className="text-indigo-500 text-xl mt-2">✦</div>
        )}
      </h2>

      <div className="space-y-6">
        {rankedInfluenceurs.map((influenceur) => {
          const targetPercentage = results.totalVotes > 0
            ? (influenceur.voteCount / results.totalVotes) * 100
            : 0;

          const displayedPercentage = displayedPercentages[influenceur.id] || 0;

          return (
            <div key={influenceur.id} className={`space-y-2 group ${
              styleLevel >= 2 ? 'p-4 rounded-lg transition-all duration-300' : ''
            } ${
              styleLevel === 3 ? 'hover:bg-purple-800/30' :
              styleLevel === 2 ? 'hover:bg-indigo-50' : ''
            }`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <span className={`${
                      styleLevel === 3 ? 'text-yellow-300 text-xl w-8' :
                      styleLevel === 2 ? 'text-indigo-600 font-bold w-7' :
                      'text-gray-700 w-6'
                    } text-center font-bold`}>
                      {influenceur.rank}
                    </span>
                    <div className={`h-10 w-10 rounded-full overflow-hidden ml-2 ${
                      styleLevel === 3 ? 'ring-2 ring-yellow-300 group-hover:ring-4' :
                      styleLevel === 2 ? 'ring-1 ring-indigo-300 group-hover:ring-2' :
                      ''
                    } transition-all duration-300`}>
                      <img
                        src={influenceur.imageUrl}
                        alt={influenceur.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                  <span className={`${
                    styleLevel === 3 ? 'text-white text-lg' :
                    styleLevel === 2 ? 'text-indigo-700 font-medium' :
                    'font-medium'
                  }`}>
                    {influenceur.name}
                  </span>
                </div>
                <span className={`${
                  styleLevel === 3 ? 'text-yellow-300 text-lg font-bold' :
                  styleLevel === 2 ? 'text-indigo-600 font-semibold' :
                  'text-[#6C63FF] font-semibold'
                }`}>
                  {influenceur.voteCount} votes
                </span>
              </div>

              <div className={`h-4 rounded-full overflow-hidden ${
                styleLevel === 3 ? 'bg-opacity-20 bg-white' :
                styleLevel === 2 ? 'bg-indigo-100' :
                'bg-gray-200'
              }`}>
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    styleLevel === 3 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 shadow' :
                    styleLevel === 2 ? 'bg-gradient-to-r from-indigo-400 to-purple-500' :
                    'bg-[#6C63FF]'
                  }`}
                  style={{
                    width: `${displayedPercentage}%`,
                  }}
                ></div>
              </div>

              <p className={`${
                styleLevel === 3 ? 'text-yellow-300 font-bold text-sm' :
                styleLevel === 2 ? 'text-indigo-600 font-medium text-sm' :
                'text-gray-600 text-sm'
              } text-right`}>
                {targetPercentage.toFixed(1)}%
                {styleLevel >= 2 && (
                  <span className={`ml-2 text-xs ${
                    styleLevel === 3 ? 'opacity-70' : 'opacity-60'
                  }`}>du total</span>
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