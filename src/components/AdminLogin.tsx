import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { adminCredentials } from '../data/artists';

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoggingIn(true);

    // Simple authentication check
    setTimeout(() => {
      if (username === adminCredentials.username && password === adminCredentials.password) {
        onLogin();
      } else {
        setError('Identifiants invalides');
        setIsLoggingIn(false);
      }
    }, 800); // Simulate network delay
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-[#6C63FF] p-3 rounded-full mb-4">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Espace Admin</h1>
          <p className="text-gray-600 mt-1">Connectez-vous pour gérer la plateforme</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoggingIn}
            className={`w-full py-2 bg-[#6C63FF] text-white rounded-md transition-colors ${
              isLoggingIn ? 'bg-[#5A52D5] cursor-not-allowed' : 'hover:bg-[#5A52D5]'
            }`}
          >
            {isLoggingIn ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connexion...
              </span>
            ) : "Se connecter"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Utilisez admin / password123 pour tester l'interface administrateur
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;