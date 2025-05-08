import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Hook pour la navigation
import { useVote } from '../context/useVote';

const VoteModal: React.FC = () => {
  // Utilisation du hook useVote pour accéder aux états et fonctions partagés
  const {
    selectedInfluenceur: selectedInfluenceur, // L'influenceur sélectionné pour le vote
    phoneNumber, // L'état du numéro de téléphone depuis le contexte
    setPhoneNumber, // La fonction pour mettre à jour le numéro de téléphone dans le contexte
    resetSelection, // La fonction pour fermer la modale et réinitialiser la sélection
    requestOTP, // La fonction pour demander un code OTP (One Time Password)
    validateOTP, // Ajoutez cette ligne
  } = useVote();

  // États locaux pour gérer le formulaire
  const [isSubmitting, setIsSubmitting] = useState(false); // Indique si le formulaire est en cours de soumission
  const [error, setError] = useState<string | null>(null); // Stocke les messages d'erreur
  const [verificationStep, setVerificationStep] = useState(false); // Contrôle quelle étape du formulaire est affichée (téléphone vs code)
  const [verificationCode, setVerificationCode] = useState(''); // Stocke le code de vérification entré par l'utilisateur

  // Hook pour la navigation programmatique
  const navigate = useNavigate();

  const countryCodes = [
    { code: '+225', name: 'Côte d\'Ivoire' },
    { code: '+33', name: 'France' },
    // Ajoutez d'autres pays au besoin
  ];
  const [selectedCountryCode] = useState('+225');
  const { countryCode, setCountryCode } = useVote();

  // Si aucun influenceur n'est sélectionné, la modale n'est pas affichée
  if (!selectedInfluenceur) return null;

  // Gère la soumission du formulaire de numéro de téléphone
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation du numéro (uniquement des chiffres)
    if (!/^\d+$/.test(phoneNumber)) {
      setError('Numéro invalide (chiffres uniquement)');
      return;
    }

    // Vérification du vote existant
    if (await requestOTP(selectedInfluenceur, phoneNumber)) {
      setError('Vous avez déjà voté avec ce numéro');
      return;
    }

    setVerificationStep(true);
  };

  // Gère la soumission du formulaire de code de vérification
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validation du code
      if (verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
        throw new Error('Code de vérification invalide');
      }

      // Valider l'OTP avec le backend
      await validateOTP(verificationCode);

      // La redirection sera gérée par les écouteurs socket dans VoteContext
      navigate('/confirmation'); // Redirige vers la page de confirmation
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur de validation');
      setIsSubmitting(false);
    }
  };

  // Rendu de la modale
  return (
    // Conteneur principal de la modale (fond semi-transparent et positionnement fixe)
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      {/* Contenu de la modale (fond blanc, coins arrondis, ombre, dimensions) */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100 animate-slideIn">
        {/* En-tête de la modale */}
        <div className="flex justify-between items-center p-5 bg-black text-yellow-500">
          {/* Titre dynamique basé sur l'influenceur sélectionné */}
          <h2 className="text-xl font-semibold">Voter pour {selectedInfluenceur.name}</h2>
          {/* Bouton de fermeture de la modale */}
          <button
            onClick={resetSelection} // Appelle resetSelection au clic pour fermer la modale
            className="p-1 rounded-full hover:bg-yellow-500 hover:text-black transition-all duration-300"
          >
            <X className="h-6 w-6" /> {/* Icône de croix */}
          </button>
        </div>

        {/* Corps de la modale contenant les formulaires */}
        <div className="p-6">
          {/* Affichage conditionnel basé sur l'étape de vérification */}
          {!verificationStep ? (
            // Formulaire pour entrer le numéro de téléphone
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                {/* Label pour le champ du numéro */}
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Votre numéro WhatsApp
                </label>
                {/* Champ de saisie du numéro de téléphone */}
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="px-2 py-2 border rounded-md"
                  >
                    {countryCodes.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.code} ({country.name})
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="00 00 00 00"
                    maxLength={10} // Limite la saisie à 10 chiffres
                    className="w-full px-4 py-2 border rounded-md"
                  />
                </div>
                {/* Affichage de l'erreur si elle existe */}
                {error && <p className="mt-2 text-sm text-red-600 animate-shake">{error}</p>}
              </div>

              {/* Bouton pour demander le code de vérification */}
              <button
                type="submit"
                className="w-full py-2 bg-black text-yellow-500 rounded-md hover:bg-yellow-500 hover:text-black transition-all duration-300 transform active:scale-95"
              >
                Recevoir un code pour voter
              </button>

              {/* Texte explicatif */}
              <p className="text-sm text-gray-600 mt-2">
                Nous vous enverrons un code de vérification pour confirmer votre vote.
              </p>
            </form>
          ) : (
            // Formulaire pour entrer le code de vérification
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div>
                {/* Label pour le champ du code */}
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  Code de vérification
                </label>
                {/* Champ de saisie du code de vérification */}
                <input
                  type="text" // Type "text" car il peut contenir des caractères non numériques (bien que validé plus tard)
                  id="code"
                  placeholder="123456"
                  value={verificationCode} // Lié à l'état local verificationCode
                  onChange={(e) => setVerificationCode(e.target.value)} // Met à jour l'état local verificationCode
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 ${error ? 'border-red-500' : 'border-gray-300'
                    }`} // Styles conditionnels pour la bordure en cas d'erreur
                  maxLength={6} // Limite la saisie à 6 caractères
                />
                {/* Affichage de l'erreur si elle existe */}
                {error && <p className="mt-2 text-sm text-red-600 animate-shake">{error}</p>}
              </div>

              {/* Bouton pour confirmer le vote */}
              <button
                type="submit"
                disabled={isSubmitting} // Désactive le bouton pendant la soumission
                className={`w-full py-2 bg-black text-yellow-500 rounded-md transition-all duration-300 transform active:scale-95 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:bg-yellow-500 hover:text-black'
                  }`} // Styles conditionnels pour l'état désactivé
              >
                {/* Affichage conditionnel du texte du bouton (soumission en cours vs Confirmer) */}
                {isSubmitting ? (
                  // Indicateur de chargement (spinner SVG)
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Traitement en cours...
                  </span>
                ) : "Confirmer mon vote"} {/* Texte par défaut du bouton */}
              </button>

              {/* Texte explicatif */}
              <p className="text-sm text-gray-600 mt-2">
                Entrez le code à 6 chiffres que vous avez reçu sur WhatsApp.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// Exportation du composant
export default VoteModal;
