import React, { useEffect, useState, useContext } from 'react';
import { useVote } from '../context/useVote';
import { ClassementData, Influenceur } from '../types';

interface ResultsChartProps {
  categoryId: string;
  categoryName?: string;
}

const ResultsChart: React.FC<ResultsChartProps> = ({ categoryId, categoryName }) => {
  const { fetchResults, socket } = useVote();
  const [results, setResults] = useState<ClassementData | null>(null);
  const [displayedPercentages, setDisplayedPercentages] = useState<Record<string, number>>({});

  const getStyleLevel = () => {
    if (categoryName === "INFLUENCEUR2LANNEE") return 3;
    if (categoryName?.includes("SPECIAL") || categoryName?.includes("PREMIUM")) return 2;
    return 1;
  };

  const styleLevel = getStyleLevel();

  // Fonction optimisée pour mettre à jour uniquement un influenceur spécifique
  const updateSingleInfluenceur = (influenceurId: string, newVoteCount: number) => {
    setResults(prevResults => {
      if (!prevResults) return prevResults;

      const updatedInfluenceurs = prevResults.influenceurs.map(infl => {
        if (infl.id === influenceurId) {
          return { ...infl, voteCount: newVoteCount };
        }
        return infl;
      });

      // Recalculer seulement le total (plus efficace que de refaire une requête DB)
      const totalVotes = updatedInfluenceurs.reduce((sum, infl) => sum + infl.voteCount, 0);

      const newResults = {
        ...prevResults,
        influenceurs: updatedInfluenceurs,
        totalVotes
      };

      // Mettre à jour les pourcentages de manière optimisée
      setDisplayedPercentages(prevPercentages => {
        const newPercentages = { ...prevPercentages };
        
        // Recalculer tous les pourcentages avec le nouveau total
        updatedInfluenceurs.forEach(infl => {
          newPercentages[infl.id] = totalVotes > 0 
            ? (infl.voteCount / totalVotes) * 100 
            : 0;
        });
        
        return newPercentages;
      });

      return newResults;
    });
  };

  // Fonction pour incrémenter directement sans recalculer tout
  const incrementInfluenceurVote = (influenceurId: string) => {
    setResults(prevResults => {
      if (!prevResults) return prevResults;

      const updatedInfluenceurs = prevResults.influenceurs.map(infl => {
        if (infl.id === influenceurId) {
          return { ...infl, voteCount: infl.voteCount + 1 };
        }
        return infl;
      });

      const totalVotes = prevResults.totalVotes + 1; // Incrément direct du total

      const newResults = {
        ...prevResults,
        influenceurs: updatedInfluenceurs,
        totalVotes
      };

      // Mise à jour optimisée des pourcentages
      setDisplayedPercentages(prevPercentages => {
        const newPercentages = { ...prevPercentages };
        
        // Recalculer seulement les pourcentages nécessaires
        updatedInfluenceurs.forEach(infl => {
          newPercentages[infl.id] = totalVotes > 0 
            ? (infl.voteCount / totalVotes) * 100 
            : 0;
        });
        
        return newPercentages;
      });

      return newResults;
    });
  };

  const updateResults = (newResults: ClassementData) => {
    setResults(newResults);
    
    // Mettre à jour les pourcentages
    const newPercentages: Record<string, number> = {};
    newResults.influenceurs.forEach((infl) => {
      newPercentages[infl.id] = newResults.totalVotes > 0 
        ? (infl.voteCount / newResults.totalVotes) * 100 
        : 0;
    });
    setDisplayedPercentages(newPercentages);
  };

  // Chargement initial (une seule fois)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        if (fetchResults) {
          const data = await fetchResults(categoryId);
          updateResults(data);
        }
      } catch (error) {
        console.error("Failed to load initial results", error);
      }
    };

    loadInitialData();
  }, [categoryId, fetchResults]);

  // Écouteur WebSocket optimisé
  useEffect(() => {
    if (!socket) return;

    // Écouteur pour les mises à jour en temps réel (optimisé)
    const handleVoteUpdate = (update: { 
      influenceurId: string; 
      newVoteCount?: number;
      categoryId: string;
      increment?: boolean; // Nouveau flag pour incrément direct
    }) => {
      // Vérifier si la mise à jour concerne notre catégorie
      if (update.categoryId !== categoryId) return;

      console.log('📊 Mise à jour reçue:', update);

      // Si on a un flag increment, utiliser la méthode optimisée
      if (update.increment) {
        incrementInfluenceurVote(update.influenceurId);
      } else if (update.newVoteCount !== undefined) {
        // Sinon utiliser le nouveau nombre de votes
        updateSingleInfluenceur(update.influenceurId, update.newVoteCount);
      }
    };

    // Écouteur pour les mises à jour complètes (en cas de besoin)
    const handleFullRefresh = (data: { categoryId: string }) => {
      if (data.categoryId === categoryId) {
        console.log('🔄 Rafraîchissement complet demandé');
        // Seulement si vraiment nécessaire
        const loadData = async () => {
          try {
            if (fetchResults) {
              const newData = await fetchResults(categoryId);
              updateResults(newData);
            }
          } catch (error) {
            console.error("Failed to refresh results", error);
          }
        };
        loadData();
      }
    };

    socket.on('voteUpdate', handleVoteUpdate);
    socket.on('fullRefresh', handleFullRefresh);

    return () => {
      socket.off('voteUpdate', handleVoteUpdate);
      socket.off('fullRefresh', handleFullRefresh);
    };
  }, [socket, categoryId, fetchResults]);

  if (!results) {
    return (
      <div className={`rounded-lg shadow-md p-6 text-center ${styleLevel === 3 ? 'bg-gradient-to-br from-purple-900 to-indigo-800 text-white' :
          styleLevel === 2 ? 'bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-800' :
            'bg-white text-gray-600'
        }`}>
        <p>Chargement des résultats...</p>
      </div>
    );
  }

  if (results.influenceurs.length === 0) {
    return (
      <div className={`rounded-lg shadow-md p-6 text-center ${styleLevel === 3 ? 'bg-gradient-to-br from-purple-900 to-indigo-800 text-white' :
          styleLevel === 2 ? 'bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-800' :
            'bg-white text-gray-600'
        }`}>
        <p>Patientez le temps de charger les influenceurs...</p>
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
    <div className={`rounded-lg p-6 ${styleLevel === 3 ?
        'bg-gradient-to-br from-purple-900 to-indigo-800 text-white shadow-xl border-2 border-yellow-400' :
        styleLevel === 2 ?
          'bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-800 shadow-lg border border-indigo-200' :
          'bg-white text-gray-800 shadow-md'
      }`}>
      <h2 className={`${styleLevel === 3 ?
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
            <div key={influenceur.id} className={`space-y-2 group ${styleLevel >= 2 ? 'p-4 rounded-lg transition-all duration-300' : ''
              } ${styleLevel === 3 ? 'hover:bg-purple-800/30' :
                styleLevel === 2 ? 'hover:bg-indigo-50' : ''
              }`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <span className={`${styleLevel === 3 ? 'text-yellow-300 text-xl w-8' :
                        styleLevel === 2 ? 'text-indigo-600 font-bold w-7' :
                          'text-gray-700 w-6'
                      } text-center font-bold`}>
                      {influenceur.rank}
                    </span>
                    <div className={`h-10 w-10 rounded-full overflow-hidden ml-2 ${styleLevel === 3 ? 'ring-2 ring-yellow-300 group-hover:ring-4' :
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
                  <span className={`${styleLevel === 3 ? 'text-white text-lg' :
                      styleLevel === 2 ? 'text-indigo-700 font-medium' :
                        'font-medium'
                    }`}>
                    {influenceur.name}
                  </span>
                </div>
                <span className={`${styleLevel === 3 ? 'text-yellow-300 text-lg font-bold' :
                    styleLevel === 2 ? 'text-indigo-600 font-semibold' :
                      'text-[#6C63FF] font-semibold'
                  }`}>
                  {influenceur.voteCount} votes
                </span>
              </div>

              <div className={`h-4 rounded-full overflow-hidden ${styleLevel === 3 ? 'bg-opacity-20 bg-white' :
                  styleLevel === 2 ? 'bg-indigo-100' :
                    'bg-gray-200'
                }`}>
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${styleLevel === 3 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 shadow' :
                      styleLevel === 2 ? 'bg-gradient-to-r from-indigo-400 to-purple-500' :
                        'bg-[#6C63FF]'
                    }`}
                  style={{
                    width: `${displayedPercentage}%`,
                  }}
                ></div>
              </div>

              <p className={`${styleLevel === 3 ? 'text-yellow-300 font-bold text-sm' :
                  styleLevel === 2 ? 'text-indigo-600 font-medium text-sm' :
                    'text-gray-600 text-sm'
                } text-right`}>
                {targetPercentage.toFixed(1)}%
                {styleLevel >= 2 && (
                  <span className={`ml-2 text-xs ${styleLevel === 3 ? 'opacity-70' : 'opacity-60'
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