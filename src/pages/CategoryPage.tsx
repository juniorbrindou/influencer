import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import InfluenceurCard from '../components/InfluenceurCard';
import VoteModal from '../components/VoteModal';
import { useVote } from '../context/useVote';
import { useCategoryManager } from '../context/useCartegoryManager';

const CategoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { listInfluenceur: influenceurs, selectedInfluenceur } = useVote();
  const { categories } = useCategoryManager();
  const { setSpecialVote } = useVote();

  // Trouver la catégorie spéciale
  const specialCategory = categories.find(cat => cat.name === "INFLUENCEUR2LANNEE");

  // Si c'est la catégorie spéciale, on prend tous les influenceurs
  const influenceursToShow = id === specialCategory?.id
    ? influenceurs.filter(inf => inf.isMain)
    : influenceurs.filter(inf => inf.categoryId === id); // Filtre normal

  const category = categories.find(cat => cat.id === id);
  useEffect(() => {
    setSpecialVote(id === specialCategory?.id);
  }, [id, specialCategory?.id, setSpecialVote]);

  return (
    <>
      {/* Hero Banner */}
      <div className="w-full h-[400px] relative mb-12">
        <img
          src="/banner.jpg"
          alt="Première édition des influenceurs de l'année 2025"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
          <div className="container mx-auto px-4 py-8 text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Première Édition<br />
              Des Influenceurs de l'Année 2025
            </h1>
            <p className="text-lg md:text-xl text-yellow-500 max-w-2xl">
              Votez pour votre influenceur préféré et participez à la première édition de ce grand événement.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-2">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {category?.name || 'Catégorie'}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {id === specialCategory?.id
              ? "Votez pour l'Influenceur de l'Année (vous pouvez voter même si vous avez déjà voté dans une autre catégorie)"
              : "Votez pour votre influenceur préféré dans cette catégorie"}
          </p>
        </div>

        {/* Influenceur Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {influenceursToShow.map(influenceur => (
            <InfluenceurCard
              key={influenceur.id}
              influenceur={influenceur}
              isSpecialCategory={id === specialCategory?.id}
            />
          ))}
        </div>

        {/* Message si aucune catégorie trouvée */}
        {!category && (
          <div className="text-center py-12">
            <p className="text-gray-500">Chargement en cours ...</p>
          </div>
        )}

        {/* Message si aucun influenceur */}
        {category && influenceursToShow.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun influenceur dans cette catégorie pour le moment</p>
          </div>
        )}

        {/* Vote Modal */}
        {selectedInfluenceur && (
          <VoteModal isSpecialCategory={id === specialCategory?.id} />
        )}
      </div>
    </>
  );
};

export default CategoryPage;