import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVote } from '../context/useVote';
import SecondVoteOffer from './SecondVoteOffer'; // Assurez-vous d'avoir ce composant
import countryCodes from '../data/countryCodes.json'; // Importez le fichier JSON

interface VoteModalProps {
  isSpecialCategory?: boolean;
}

const VoteModal: React.FC<VoteModalProps> = ({ isSpecialCategory = false }) => {
  const {
    selectedInfluenceur,
    phoneNumber,
    setPhoneNumber,
    resetSelection,
    requestOTP,
    validateOTP,
    otpMessage,
    offerSecondVote,
    setOfferSecondVote,
    setSpecialVote,
    categories
  } = useVote();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showSpecialCategory, setShowSpecialCategory] = useState(false);

  const navigate = useNavigate();

  const { countryCode, setCountryCode } = useVote();

  useEffect(() => {
    if (otpMessage === 'Code de validation envoyé') {
      setVerificationStep(true);
      setIsSubmitting(false);
    }
  }, [otpMessage]);

  if (!selectedInfluenceur) return null;

  // Trouver la catégorie spéciale
  const specialCategory = categories.find(cat => cat.name === "Influenceur2lannee");

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!/^\d+$/.test(phoneNumber)) {
      setError('Numéro invalide (chiffres uniquement)');
      setIsSubmitting(false);
      return;
    }

    try {
      const hasVoted = await requestOTP(selectedInfluenceur, phoneNumber);
      if (hasVoted) {
        setError('Vous avez déjà voté avec ce numéro');
      }
    } catch (error) {
      setError('Erreur lors de la demande de code');
      setIsSubmitting(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
        throw new Error('Code de vérification invalide');
      }

      await validateOTP(verificationCode);
      navigate('/confirmation');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur de validation');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100 animate-slideIn">
        {/* Modal pour le second vote */}
        {offerSecondVote && (
          <SecondVoteOffer
            onAccept={() => {
              setSpecialVote(true);
              setOfferSecondVote(false);
              setShowSpecialCategory(true);
            }}
            onDecline={() => {
              setOfferSecondVote(false);
              resetSelection();
            }}
          />
        )}

        {/* Contenu principal de la modale */}
        <div className={`${offerSecondVote ? 'hidden' : 'block'}`}>
          <div className="flex justify-between items-center p-5 bg-black text-yellow-500">
            <h2 className="text-xl font-semibold">
              {showSpecialCategory && specialCategory 
                ? `Voter pour ${specialCategory.name}`
                : `Voter pour ${selectedInfluenceur.name}`}
            </h2>
            <button
              onClick={() => {
                resetSelection();
                setShowSpecialCategory(false);
                setSpecialVote(false);
              }}
              className="p-1 rounded-full hover:bg-yellow-500 hover:text-black transition-all duration-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            {!verificationStep ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Votre numéro WhatsApp
                  </label>
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
                      maxLength={10}
                      className="w-full px-4 py-2 border rounded-md"
                    />
                  </div>
                  {error && <p className="mt-2 text-sm text-red-600 animate-shake">{error}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-black text-yellow-500 rounded-md hover:bg-yellow-500 hover:text-black transition-all duration-300 transform active:scale-95"
                >
                  Recevoir un code pour voter
                </button>

                <p className="text-sm text-gray-600 mt-2">
                  Nous vous enverrons un code de vérification pour confirmer votre vote.
                </p>
              </form>
            ) : (
              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                    Code de vérification
                  </label>
                  <input
                    type="text"
                    id="code"
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 ${error ? 'border-red-500' : 'border-gray-300'}`}
                    maxLength={6}
                  />
                  {error && <p className="mt-2 text-sm text-red-600 animate-shake">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-2 bg-black text-yellow-500 rounded-md transition-all duration-300 transform active:scale-95 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:bg-yellow-500 hover:text-black'}`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Traitement en cours...
                    </span>
                  ) : "Confirmer mon vote"}
                </button>

                <p className="text-sm text-gray-600 mt-2">
                  Entrez le code à 6 chiffres que vous avez reçu sur WhatsApp.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoteModal;