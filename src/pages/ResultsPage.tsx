import React from 'react';
import ResultsChart from '../components/ResultsChart';

const ResultsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Résultats des votes</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Découvrez quels influenceurs sont en tête du classement actuel.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <ResultsChart />
      </div>
    </div>
  );
};

export default ResultsPage;