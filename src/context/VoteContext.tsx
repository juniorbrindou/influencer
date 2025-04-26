import React, { createContext, useState, useContext, useEffect } from 'react';
import { Influenceur, Vote } from '../types';
import { initialInfluenceurs } from '../data/artists';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface VoteContextType {
  listInfluenceur: Influenceur[];
  votes: Vote[];
  selectedInfluenceur: Influenceur | null;
  phoneNumber: string;
  setPhoneNumber: (number: string) => void;
  selectInfluenceur: (influenceur: Influenceur) => void;
  submitVote: (phone: string) => void;
  hasVoted: (phone: string) => boolean;
  resetSelection: () => void;
  addInfluenceur: (influenceur: Influenceur) => void;
  removeInfluenceur: (id: string) => void;
  updateInfluenceur: (influenceur: Influenceur) => void;
}

const VoteContext = createContext<VoteContextType | undefined>(undefined);

export const VoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [influenceurs, setInfluenceurs] = useLocalStorage<Influenceur[]>('Influenceurs', initialInfluenceurs);
  const [votes, setVotes] = useLocalStorage<Vote[]>('votes', []);
  const [selectedInfluenceur, setSelectedInfluenceur] = useState<Influenceur | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  const selectInfluenceur = (influenceur: Influenceur) => {
    setSelectedInfluenceur(influenceur);
  };

  const resetSelection = () => {
    setSelectedInfluenceur(null);
    setPhoneNumber('');
  };

  const hasVoted = (phone: string): boolean => {
    return votes.some(vote => vote.phoneNumber === phone);
  };

  const submitVote = (phone: string) => {
    if (!selectedInfluenceur || hasVoted(phone)) return;
    
    // Add the vote to the votes array
    const newVote: Vote = {
      influenceurId: selectedInfluenceur.id,
      phoneNumber: phone,
      timestamp: Date.now()
    };
    setVotes([...votes, newVote]);
    
    // Update the Influenceur's vote count
    setInfluenceurs(prevInfluenceurs =>
      prevInfluenceurs.map(influenceur =>
        influenceur.id === selectedInfluenceur.id
          ? { ...influenceur, voteCount: influenceur.voteCount + 1 }
          : influenceur
      )
    );
  };

  const addInfluenceur = (influenceur: Influenceur) => {
    setInfluenceurs([...influenceurs, { ...influenceur, id: String(Date.now()), voteCount: 0 }]);
  };

  const removeInfluenceur = (id: string) => {
    setInfluenceurs(influenceurs.filter(influenceur => influenceur.id !== id));
  };

  const updateInfluenceur = (updatedInfluenceur: Influenceur) => {
    setInfluenceurs(influenceurs.map(influenceur => 
      influenceur.id === updatedInfluenceur.id ? updatedInfluenceur : influenceur
    ));
  };

  return (
    <VoteContext.Provider
      value={{
        listInfluenceur: influenceurs,
        votes,
        selectedInfluenceur: selectedInfluenceur,
        phoneNumber,
        setPhoneNumber,
        selectInfluenceur: selectInfluenceur,
        submitVote,
        hasVoted,
        resetSelection,
        addInfluenceur: addInfluenceur,
        removeInfluenceur: removeInfluenceur,
        updateInfluenceur: updateInfluenceur
      }}
    >
      {children}
    </VoteContext.Provider>
  );
};

export const useVote = () => {
  const context = useContext(VoteContext);
  if (context === undefined) {
    throw new Error('useVote must be used within a VoteProvider');
  }
  return context;
};