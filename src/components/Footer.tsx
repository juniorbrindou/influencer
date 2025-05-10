import React from 'react';
import { Heart } from 'lucide-react';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({className = ""}) => {
  return (
    <footer className={"bg-black py-6 mt-auto " + className}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-white mb-4 md:mb-0">
            © {new Date().getFullYear()} Influenceur de l'année. Tous droits réservés.
          </p>

          <div className="flex items-center space-x-2 text-white">
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