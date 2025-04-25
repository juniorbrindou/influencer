import React from 'react';
import { Music, BarChart2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Music className="h-8 w-8 text-[#6C63FF]" />
          <h1 className="text-xl font-bold text-gray-800">ArtistVote</h1>
        </Link>
        
        <nav className="flex items-center space-x-6">
          <Link 
            to="/results" 
            className={`flex items-center space-x-1 text-gray-700 hover:text-[#6C63FF] transition-colors ${
              location.pathname === '/results' ? 'text-[#6C63FF] font-medium' : ''
            }`}
          >
            <BarChart2 className="h-5 w-5" />
            <span>Résultats</span>
          </Link>
          
          <Link 
            to="/admin" 
            className={`px-4 py-2 bg-[#6C63FF] text-white rounded-md hover:bg-[#5A52D5] transition-colors ${
              location.pathname === '/admin' ? 'bg-[#5A52D5]' : ''
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