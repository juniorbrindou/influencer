import React, { useEffect, useState } from 'react';
import { useVote } from '../context/useVote';

interface ResultsChartProps {
  categoryId: string;
}

const ResultsChart: React.FC<ResultsChartProps> = ({ categoryId }) => {
  const { fetchResults } = useVote();
  const [results, setResults] = useState<{
    influenceurs: Array<{
      id: string;
      name: string;
      imageUrl: string;
      voteCount: number;
    }>;
    totalVotes: number;
    isSpecialCategory: boolean;
  } | null>(null);
  const [animatedBars, setAnimatedBars] = useState(false);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const data = await fetchResults(categoryId);
        setResults(data);
        setAnimatedBars(false);

        setTimeout(() => {
          setAnimatedBars(true);
        }, 300);
      } catch (error) {
        console.error("Failed to load results", error);
      }
    };

    loadResults();
  }, [categoryId, fetchResults]);

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
          const percentage = results.totalVotes > 0
            ? (influenceur.voteCount / results.totalVotes) * 100
            : 0;

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