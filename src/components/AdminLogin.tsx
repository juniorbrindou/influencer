// Importe React et le hook useState pour gérer l'état local du composant
import React, { useState } from 'react';
// Importe l'icône Lock depuis la bibliothèque lucide-react
import { Lock } from 'lucide-react';

/**
 * Interface définissant les props attendues par le composant AdminLogin.
 */
interface AdminLoginProps {
  /**
   * Fonction callback à exécuter lorsque la connexion réussit.
   * Cette fonction est fournie par le composant parent.
   */
  onLogin: () => void;
}

const adminCredentials = {
  username: 'admin',
  password: 'password123'
};

/**
 * Composant AdminLogin : Affiche un formulaire de connexion pour l'espace administrateur.
 * Gère la saisie des identifiants, la validation (simulée) et l'affichage des erreurs.
 *
 * @param props Les propriétés passées au composant, incluant la fonction onLogin.
 */
const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  // État pour stocker le nom d'utilisateur saisi
  const [username, setUsername] = useState('');
  // État pour stocker le mot de passe saisi
  const [password, setPassword] = useState('');
  // État pour stocker un éventuel message d'erreur
  const [error, setError] = useState<string | null>(null);
  // État pour indiquer si une tentative de connexion est en cours (pour afficher un spinner et désactiver le bouton)
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  /**
   * Gère la soumission du formulaire de connexion.
   * @param e L'événement de soumission du formulaire.
   */
  const handleSubmit = (e: React.FormEvent) => {
    // Empêche le rechargement de la page par défaut lors de la soumission du formulaire
    e.preventDefault();
    // Réinitialise les erreurs précédentes
    setError(null);
    // Indique que la connexion est en cours
    setIsLoggingIn(true);

    // Simulation d'une vérification d'authentification asynchrone (ex: appel API)
    // setTimeout est utilisé ici pour simuler un délai réseau.
    setTimeout(() => {
      // Vérifie si les identifiants saisis correspondent aux identifiants attendus
      if (username === adminCredentials.username && password === adminCredentials.password) {
        // Si les identifiants sont corrects, appelle la fonction onLogin fournie par le parent
        onLogin();
        // Note: setIsLoggingIn(false) n'est pas nécessaire ici car le composant sera probablement démonté ou remplacé après onLogin()
      } else {
        // Si les identifiants sont incorrects, affiche un message d'erreur
        setError('Identifiants invalides. Veuillez réessayer.');
        // Indique que la tentative de connexion est terminée (échec)
        setIsLoggingIn(false);
      }
    }, 800); // Délai de 800 millisecondes pour la simulation
  };

  // Rendu JSX du composant
  return (
    // Conteneur principal qui centre le formulaire verticalement et horizontalement
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-50"> {/* Fond légèrement gris */}
      {/* Carte contenant le formulaire */}
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md"> {/* Ombre plus prononcée */}
        {/* En-tête du formulaire avec icône et titre */}
        <div className="flex flex-col items-center mb-6">
          {/* Cercle coloré contenant l'icône */}
          <div className="bg-[#6C63FF] p-3 rounded-full mb-4 shadow-md"> {/* Ombre sur l'icône */}
            <Lock className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Espace Administrateur</h1>
          <p className="text-gray-600 mt-1 text-center">Connectez-vous pour accéder au tableau de bord.</p> {/* Texte légèrement modifié */}
        </div>

        {/* Formulaire de connexion */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Champ pour le nom d'utilisateur */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              id="username"
              value={username}
              // Met à jour l'état 'username' à chaque changement dans le champ
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent shadow-sm" // Style amélioré
              required // Champ obligatoire
              disabled={isLoggingIn} // Désactive le champ pendant la connexion
            />
          </div>

          {/* Champ pour le mot de passe */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              // Met à jour l'état 'password' à chaque changement dans le champ
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent shadow-sm" // Style amélioré
              required // Champ obligatoire
              disabled={isLoggingIn} // Désactive le champ pendant la connexion
            />
          </div>

          {/* Affichage conditionnel du message d'erreur */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 p-3 rounded-r-md"> {/* Style amélioré pour l'erreur */}
              <p className="text-red-700 text-sm">{error}</p> {/* Taille de texte ajustée */}
            </div>
          )}

          {/* Bouton de soumission */}
          <button
            type="submit"
            // Désactive le bouton si la connexion est en cours
            disabled={isLoggingIn}
            // Classes CSS conditionnelles pour le style et l'état désactivé/chargement
            className={`w-full py-2.5 bg-[#6C63FF] text-white font-semibold rounded-md transition-all duration-300 ease-in-out ${ // Padding et font weight ajustés
              isLoggingIn
                ? 'bg-[#5A52D5] opacity-75 cursor-not-allowed' // Style pendant le chargement
                : 'hover:bg-[#5A52D5] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6C63FF]' // Style normal et au survol/focus
            }`}
          >
            {/* Affiche un spinner et "Connexion..." si la connexion est en cours, sinon "Se connecter" */}
            {isLoggingIn ? (
              <span className="flex items-center justify-center">
                {/* Icône SVG pour le spinner */}
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connexion...
              </span>
            ) : "Se connecter"}
          </button>
        </form>

      </div>
    </div>
  );
};

// Exporte le composant pour pouvoir l'utiliser ailleurs dans l'application
export default AdminLogin;