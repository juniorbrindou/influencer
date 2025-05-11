import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useVote } from '../context/useVote';
import SecondVoteOffer from './SecondVoteOffer';
import countryCodes from '../data/countryCodes.json';
import { Influenceur } from '../types';

interface VoteModalProps {
  isSpecialCategory?: boolean;
}

export interface VoteContextType {
  selectedInfluenceur: Influenceur | null;
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  resetSelection: () => void;
  submitVote: (influenceur: Influenceur, phone: string) => Promise<void>;
  offerSecondVote: boolean;
  setOfferSecondVote: (offer: boolean) => void;
  setSpecialVote: (special: boolean) => void;
  countryCode: string;
  setCountryCode: (code: string) => void;
  error: string | null;
  setError: (error: string | null) => void; // Added setError
  isLoading: boolean;
}

const VoteModal: React.FC<VoteModalProps> = ({ isSpecialCategory = false }) => {
  const {
    selectedInfluenceur,
    phoneNumber,
    setPhoneNumber,
    resetSelection,
    submitVote,
    offerSecondVote,
    setOfferSecondVote,
    setSpecialVote,
    countryCode,
    setCountryCode,
    error,
    // setError,
    isLoading
  } = useVote();

  const handleAcceptSpecialVote = async () => {
    setSpecialVote(true);
    setOfferSecondVote(false);
    await submitVote(selectedInfluenceur!, phoneNumber);
  };

  const handleDeclineSpecialVote = () => {
    setSpecialVote(false);
    setOfferSecondVote(false);
    resetSelection();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setError(null);

    // if (!phoneNumber || phoneNumber.length < 8) {
    //   setError('Numéro invalide');
    //   return;
    // }

    await submitVote(selectedInfluenceur!, phoneNumber);
  };

  if (!selectedInfluenceur) return null;

  return (
    <>
      {offerSecondVote ? (
        <SecondVoteOffer
          onAccept={handleAcceptSpecialVote}
          onDecline={handleDeclineSpecialVote}
          influenceur={selectedInfluenceur}
          isSpecialCategory={isSpecialCategory}
        />
      ) : (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn"
             onClick={resetSelection}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100 animate-slideIn"
               onClick={(e) => e.stopPropagation()}>

            <div className="flex justify-between items-center p-5 bg-black text-yellow-500">
              <h2 className="text-xl font-semibold">
                Voter pour {selectedInfluenceur.name}
              </h2>
              <button onClick={resetSelection} className="p-1 rounded-full hover:bg-yellow-500 hover:text-black transition-all duration-300">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Votre numéro WhatsApp
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
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
                      required
                    />
                  </div>
                  {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-2 bg-black text-yellow-500 rounded-md transition-all duration-300 ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-yellow-500 hover:text-black'}`}
                >
                  {isLoading ? 'Enregistrement...' : 'Confirmer mon vote'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VoteModal;