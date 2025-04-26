import React, { useEffect, useState } from 'react';
import { useVote } from '../context/VoteContext';

const ResultsChart: React.FC = () => {
  const { listInfluenceur: listInfluenceurs } = useVote();
  const [sortedInfluenceurs, setSortedInfluenceurs] = useState([...listInfluenceurs].sort((a, b) => b.voteCount - a.voteCount));
  const [animatedBars, setAnimatedBars] = useState<boolean>(false);

  // Calculate total votes to get percentages
  const totalVotes = listInfluenceurs.reduce((total, influenceur) => total + influenceur.voteCount, 0);

  // Sort Influenceurs by vote count
  useEffect(() => {
    const sorted = [...listInfluenceurs].sort((a, b) => b.voteCount - a.voteCount);
    setSortedInfluenceurs(sorted);

    // Trigger animation after a short delay
    setTimeout(() => {
      setAnimatedBars(true);
    }, 300);
  }, [listInfluenceurs]);

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
                      src={influenceur.imageUrl}
                      alt={influenceur.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="font-medium">{influenceur.name}</span>
                </div>
                <span className="font-semibold text-[#6C63FF]">{influenceur.voteCount} votes</span>
              </div>

              <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#6C63FF] rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: animatedBars ? `${percentage}%` : '0%',
                    transitionDelay: '100ms'
                  }}
                ></div>
              </div>

              <p className="text-sm text-gray-600 text-right">{percentage.toFixed(1)}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResultsChart;