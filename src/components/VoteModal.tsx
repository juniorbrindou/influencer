import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useVote } from '../context/VoteContext';
import { useNavigate } from 'react-router-dom';

const VoteModal: React.FC = () => {
  const { selectedArtist, phoneNumber, setPhoneNumber, submitVote, resetSelection, hasVoted } = useVote();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const navigate = useNavigate();

  if (!selectedArtist) return null;

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Basic phone validation
    if (!/^\+?[0-9]{10,15}$/.test(phoneNumber)) {
      setError('Veuillez entrer un numéro WhatsApp valide');
      return;
    }

    if (hasVoted(phoneNumber)) {
      setError('Vous avez déjà voté avec ce numéro');
      return;
    }
    
    // Normally we would send a real SMS here
    // For this demo, we'll simulate the verification code step
    setVerificationStep(true);
    // Simulate a verification code (in a real app, this would be sent via WhatsApp)
    const mockCode = '123456';
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // In a real app, verify the code against what was sent
    // For demo purposes, we'll accept any 6-digit code
    if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
      // Code is valid, proceed with vote
      submitVote(phoneNumber);
      
      // Redirect to confirmation page
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-5 bg-[#6C63FF] text-white">
          <h2 className="text-xl font-semibold">Voter pour {selectedArtist.name}</h2>
          <button 
            onClick={resetSelection}
            className="p-1 rounded-full hover:bg-[#5A52D5] transition-colors"
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
                  placeholder="+33 6 12 34 56 78"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              </div>
              
              <button
                type="submit"
                className="w-full py-2 bg-[#28a745] text-white rounded-md hover:bg-[#218838] transition-colors"
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
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                  maxLength={6}
                />
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2 bg-[#28a745] text-white rounded-md transition-colors ${
                  isSubmitting ? 'bg-[#218838] cursor-not-allowed' : 'hover:bg-[#218838]'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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