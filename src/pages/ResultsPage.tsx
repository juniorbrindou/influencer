import React, { useState, useEffect } from 'react';
import ResultsChart from '../components/ResultsChart';
import { useVote } from '../context/useVote';
import { Loader } from '../components/Loader';
import { ClassementData } from '../types';

const ResultsPage: React.FC = () => {
  const { categories, fetchResults } = useVote();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentResults, setCurrentResults] = useState<ClassementData | null>(null);

  // Chargement initial des catégories
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
      setIsLoading(false);
    }
  }, [categories]);

  if (isLoading && !currentResults) {
    return <Loader />;
  }

  return (
    <div className="min-h-[80vh]  relative overflow-hidden">
      
      {/* Arrière-plan luxueux avec effets dorés subtils */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-black z-0">
        {/* Effets de lumière dorée subtils */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-3/2 left-2/6 w-64 h-64 bg-gradient-to-r from-yellow-600 to-amber-500 rounded-full filter blur-[80px] opacity-100 animate-pulse"></div>
          <div className="absolute bottom-2/3 right-1/4 w-48 h-48 bg-amber-400 rounded-full filter blur-[80px] opacity-100 animate-pulse"></div>
          <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-yellow-500 rounded-full filter blur-[100px] opacity-70 animate-pulse"></div>
        </div>

        {/* Texture subtile */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-50"></div>
      </div>

      {/* Contenu principal avec bonne visibilité */}
      <div className="container mx-auto px-4 py-8 z-10 relative">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-amber-100 mb-2">Résultats des votes</h1>
          <p className="text-amber-50/80 max-w-2xl mx-auto text-lg">
            Découvrez quels influenceurs sont en tête du classement par catégorie.
          </p>
        </div>

        {/* Sélecteur de catégorie */}
        <div className="mb-6 max-w-3xl mx-auto">
          <label htmlFor="category" className="block text-sm font-medium text-amber-100 mb-2">
            Sélectionnez une catégorie
          </label>
          {categories.length > 0 ? (
            <select
              id="category"
              className="block w-full rounded-md bg-gray-800 border-gray-700 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-2 border text-amber-50"
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={isLoading}
            >
              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                  className={`${category.name === "INFLUENCEUR2LANNEE" ? "font-bold text-amber-400 bg-gray-700" : "text-amber-50"} bg-gray-800`}
                >
                  {category.name}
                  {category.name === "INFLUENCEUR2LANNEE" && " ★"}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-amber-300">Aucune catégorie disponible</p>
          )}
        </div>

        {isLoading && currentResults ? (
          <div className="max-w-3xl mx-auto relative">
            <div className="opacity-50">
              <ResultsChart categoryId={selectedCategory as string} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader />
            </div>
          </div>
        ) : (
          selectedCategory && (
            <div className="max-w-3xl mx-auto bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 shadow-lg">
              <ResultsChart
                key={selectedCategory}
                categoryId={selectedCategory}
                categoryName={categories.find(c => c.id === selectedCategory)?.name}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
};
export default ResultsPage;