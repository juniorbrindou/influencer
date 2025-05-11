import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategoryManager } from '../context/useCartegoryManager';
import { Category } from '../types';

const HomePage: React.FC = () => {
  const { categories } = useCategoryManager();
  const navigate = useNavigate();

  const gotTocategories = (category: Category) => {
    // if (category.name == 'INFLUENCEUR2LANNEE') {
    //   setOfferSecondVote(true)
    // }
    navigate(`/category/${category.id}`)
  }





  return (
    <div>
      {/* Hero Banner (inchangé) */}
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

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center animate-fadeIn">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Choisissez une catégorie</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Sélectionnez une catégorie pour voir les influenceurs et voter pour votre préféré.
          </p>
        </div>

        {/* Nouvelle grille avec cartes prenant la moitié de l'écran */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {categories.map(category => (
            <div
              key={category.id}
              onClick={() => gotTocategories(category)}
              className="group relative bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer animate-slideIn"
            >
              {/* Conteneur d'image avec ratio 4:3 */}
              <div className="pb-[75%] relative overflow-hidden"> {/* 4:3 ratio */}
                <img
                  src={category.imageUrl as string}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                  <div className="w-full">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 transition-colors group-hover:text-yellow-400">
                      {category.name}
                    </h3>
                    <div className="h-1.5 w-20 bg-yellow-400 mb-3 transform transition-all duration-500 group-hover:w-28"></div>
                    <span className="text-white/90 text-base font-medium inline-flex items-center">
                      Voter maintenant
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;