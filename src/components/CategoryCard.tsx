import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Category } from '../types';
import { motion } from 'framer-motion';

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
      className="group bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
      onClick={() => navigate(`/category/${category.id}`)}
    >
      <div className="h-48 overflow-hidden">
        <img
          src={category.imageUrl as string}
          alt={category.name}
          className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-yellow-600 transition-colors">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-gray-600 text-sm">{category.description}</p>
        )}
      </div>
    </motion.div>
  );
};

export default CategoryCard;