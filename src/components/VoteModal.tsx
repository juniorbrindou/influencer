import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useVote } from '../context/VoteContext';
import { useNavigate } from 'react-router-dom';

const VoteModal: React.FC = () => {
  const { selectedInfluenceur: selectedInfluenceur, phoneNumber, setPhoneNumber, submitVote, resetSelection, hasVoted } = useVote();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const navigate = useNavigate();

  if (!selectedInfluenceur) return null;

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!/^\+?[0-9]{10,15}$/.test(phoneNumber)) {
      setError('Veuillez entrer un numéro WhatsApp valide');
      return;
    }

    if (hasVoted(phoneNumber)) {
      setError('Vous avez déjà voté avec ce numéro');
      return;
    }

    setVerificationStep(true);
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
      submitVote(phoneNumber);

      setTimeout(() => {
        navigate('/confirmation');
        resetSelection();
      }, 1000);
    } else {
      setError('Code de vérification invalide');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100 animate-slideIn">
        <div className="flex justify-between items-center p-5 bg-black text-yellow-500">
          <h2 className="text-xl font-semibold">Voter pour {selectedInfluenceur.name}</h2>
          <button
            onClick={resetSelection}
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
                <input
                  type="tel"
                  id="phone"
                  placeholder="+225 9999999999"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 ${error ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
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
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 ${error ? 'border-red-500' : 'border-gray-300'
                    }`}
                  maxLength={6}
                />
                {error && <p className="mt-2 text-sm text-red-600 animate-shake">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2 bg-black text-yellow-500 rounded-md transition-all duration-300 transform active:scale-95 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:bg-yellow-500 hover:text-black'
                  }`}
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
  );
};

export default VoteModal;