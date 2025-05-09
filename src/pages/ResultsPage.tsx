import React, { useState, useEffect } from 'react';
import ResultsChart from '../components/ResultsChart';
import { useVote } from '../context/useVote';

const ResultsPage: React.FC = () => {
  const { categories, isLoading } = useVote();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories]);

  if (isLoading) {
    return <div className="text-center py-8">Chargement en cours...</div>;
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
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-red-500">Aucune catégorie disponible</p>
        )}
      </div>

      {selectedCategory && (
        <div className="max-w-3xl mx-auto">
          <ResultsChart categoryId={selectedCategory} />
        </div>
      )}
    </div>
  );
};

export default ResultsPage;