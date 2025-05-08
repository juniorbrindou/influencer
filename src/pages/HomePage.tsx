import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategoryManager } from '../context/useCartegoryManager';

const HomePage: React.FC = () => {
  const { categories } = useCategoryManager();
  const navigate = useNavigate();

  return (
    <div>
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

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Choisissez une catégorie</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Sélectionnez une catégorie pour voir les influenceurs et voter pour votre préféré.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {categories.map(category => (
            <div 
              key={category.id}
              onClick={() => navigate(`/category/${category.id}`)}
              className="group bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer"
            >
              <div className="h-48 overflow-hidden relative">
                <img
                  src={category.imageUrl as string}
                  alt={category.name}
                  className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">
                    {category.name}
                  </h3>
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