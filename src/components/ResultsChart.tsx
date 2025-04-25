import React, { useEffect, useState } from 'react';
import { useVote } from '../context/VoteContext';

const ResultsChart: React.FC = () => {
  const { artists } = useVote();
  const [sortedArtists, setSortedArtists] = useState([...artists].sort((a, b) => b.voteCount - a.voteCount));
  const [animatedBars, setAnimatedBars] = useState<boolean>(false);

  // Calculate total votes to get percentages
  const totalVotes = artists.reduce((total, artist) => total + artist.voteCount, 0);
  
  // Sort artists by vote count
  useEffect(() => {
    const sorted = [...artists].sort((a, b) => b.voteCount - a.voteCount);
    setSortedArtists(sorted);
    
    // Trigger animation after a short delay
    setTimeout(() => {
      setAnimatedBars(true);
    }, 300);
  }, [artists]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Résultats des votes</h2>
      
      <div className="space-y-6">
        {sortedArtists.map((artist) => {
          const percentage = totalVotes > 0 ? (artist.voteCount / totalVotes) * 100 : 0;
          
          return (
            <div key={artist.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden">
                    <img 
                      src={artist.imageUrl} 
                      alt={artist.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="font-medium">{artist.name}</span>
                </div>
                <span className="font-semibold text-[#6C63FF]">{artist.voteCount} votes</span>
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