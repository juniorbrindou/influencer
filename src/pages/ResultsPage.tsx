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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Résultats des votes</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Découvrez quels influenceurs sont en tête du classement par catégorie.
        </p>
      </div>

      {/* Sélecteur de catégorie */}
      <div className="mb-6 max-w-3xl mx-auto">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Sélectionnez une catégorie
        </label>
        {categories.length > 0 ? (
          <select
            id="category"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value)}
            disabled={isLoading}
          >
            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
                className={category.name === "INFLUENCEUR2LANNEE" ? "font-bold text-[#6C63FF]" : ""}
              >
                {category.name}
                {category.name === "INFLUENCEUR2LANNEE" && " ★"}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-red-500">Aucune catégorie disponible</p>
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
          <div className="max-w-3xl mx-auto">
            <ResultsChart
              key={selectedCategory}
              categoryId={selectedCategory}
              categoryName={categories.find(c => c.id === selectedCategory)?.name}
            />
          </div>
        )
      )}
    </div>
  );
};

export default ResultsPage;