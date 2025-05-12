import React, { useEffect, useState, useRef } from 'react';
import { useVote } from '../context/useVote';
import { ClassementData } from '../types';

interface ResultsChartProps {
  categoryId: string;
}

const ResultsChart: React.FC<ResultsChartProps> = ({ categoryId }) => {
  const { fetchResults } = useVote();
  const [results, setResults] = useState<ClassementData | null>(null);
  const [displayedPercentages, setDisplayedPercentages] = useState<Record<string, number>>({});
  const prevResultsRef = useRef<ClassementData | null>(null);

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
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-600">Chargement des résultats...</p>
      </div>
    );
  }

  if (results.influenceurs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-600">Aucun influenceur dans cette catégorie pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        {results.isSpecialCategory ? "Résultats des votes spéciaux" : "Résultats des votes"}
      </h2>

      <div className="space-y-6">
        {results.influenceurs.map((influenceur) => {
          const targetPercentage = results.totalVotes > 0
            ? (influenceur.voteCount / results.totalVotes) * 100
            : 0;

          const displayedPercentage = displayedPercentages[influenceur.id] || 0;

          return (
            <div key={influenceur.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden">
                    <img
                      src={influenceur.imageUrl}
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
                    width: `${displayedPercentage}%`,
                  }}
                ></div>
              </div>

              <p className="text-sm text-gray-600 text-right">
                {targetPercentage.toFixed(1)}%
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResultsChart;