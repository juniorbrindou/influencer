import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 mb-4 md:mb-0">
            © {new Date().getFullYear()} Influenceur de l'année. Tous droits réservés.
          </p>

          <div className="flex items-center space-x-2 text-gray-600">
            <span>Créé avec</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>pour soutenir les influenceurs</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;