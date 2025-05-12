import React from 'react';
import { BarChart2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();

  return (
    <header className="bg-black shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-3">
          <img
            src="/logo.jpg"
            alt="Influenceur de l'année"
            className="h-12 w-auto"
          />
          <div className="text-white hidden md:block">
            <h1 className="text-xl font-bold">Influenceur de l'année</h1>
            <p className="text-sm text-yellow-500">1ère Édition</p>
          </div>
        </Link>

        <nav className="flex items-center space-x-6">
          <div className="flex items-center space-x-1 text-gray-400 cursor-not-allowed" title="Disponible la semaine prochaine">
            <BarChart2 className="h-5 w-5" />
            <span>Résultats (bientôt disponible)</span>
          </div>
          {/* <Link
            to="/results"
            className={`flex items-center space-x-1 text-white hover:text-yellow-500 transition-colors ${location.pathname === '/results' ? 'text-yellow-500 font-medium' : ''
              }`}
          >
            <BarChart2 className="h-5 w-5" />
            <span>Résultats</span>
          </Link> */}

          <Link
            to="/admin"
            className={`px-4 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-400 transition-colors ${location.pathname === '/admin' ? 'bg-yellow-400' : ''
              }`}
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;