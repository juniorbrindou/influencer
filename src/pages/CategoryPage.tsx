import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InfluenceurCard from '../components/InfluenceurCard';
import VoteModal from '../components/VoteModal';
import { useVote } from '../context/useVote';
import { useCategoryManager } from '../context/useCartegoryManager';

const CategoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { listInfluenceur: influenceurs, selectedInfluenceur } = useVote();
  const { categories } = useCategoryManager();

  // Filtrer les influenceurs par catégorie
  const categoryInfluenceurs = influenceurs.filter(inf => inf.categoryId === id);
  const category = categories.find(cat => cat.id === id);

  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={() => navigate('/')}
        className="mb-6 flex items-center text-[#6C63FF] hover:text-[#5a52e0] transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Retour aux catégories
      </button>

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {category?.name || 'Catégorie'}
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Votez pour votre influenceur préféré dans cette catégorie.
        </p>
      </div>

      {/* Influenceur Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categoryInfluenceurs.map(influenceur => (
          <InfluenceurCard key={influenceur.id} influenceur={influenceur} />
        ))}
      </div>

      {/* Message si aucune catégorie trouvée */}
      {!category && (
        <div className="text-center py-12">
          <p className="text-gray-500">Catégorie non trouvée</p>
        </div>
      )}

      {/* Message si aucun influenceur */}
      {category && categoryInfluenceurs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucun influenceur dans cette catégorie pour le moment</p>
        </div>
      )}

      {/* Vote Modal */}
      {selectedInfluenceur && <VoteModal />}
    </div>
  );
};

export default CategoryPage;