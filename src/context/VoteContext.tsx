import React, { createContext, useState, useContext, useEffect } from 'react';
import { Influenceur, Vote } from '../types';
import { io } from 'socket.io-client';

interface VoteContextType {
  listInfluenceur: Influenceur[];
  votes: Vote[];
  selectedInfluenceur: Influenceur | null;
  phoneNumber: string;
  setPhoneNumber: (number: string) => void;
  selectInfluenceur: (influenceur: Influenceur) => void;
  submitVote: (phone: string) => void;
  hasVoted: (phone: string) => Promise<boolean>;
  resetSelection: () => void;
  addInfluenceur: (influenceur: Influenceur) => void;
  removeInfluenceur: (id: string) => void;
  updateInfluenceur: (influenceur: Influenceur) => void;
}

const VoteContext = createContext<VoteContextType | undefined>(undefined);
const socket = io('http://localhost:3000');


export const VoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [influenceurs, setInfluenceurs] = useState<Influenceur[]>([]);

  const [votes, setVotes] = useState<Vote[]>([]);

  const [selectedInfluenceur, setSelectedInfluenceur] = useState<Influenceur | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');



  // Charger les influenceurs au démarrage
  useEffect(() => {
    fetchInfluenceurs();

    // Écouter les mises à jour en temps réel
    socket.on('voteUpdate', ({ influenceurId, newVoteCount }) => {
      setInfluenceurs(prevInfluenceurs =>
        prevInfluenceurs.map(influenceur =>
          influenceur.id === influenceurId
            ? { ...influenceur, voteCount: newVoteCount }
            : influenceur
        )
      );
    });

    return () => {
      socket.off('voteUpdate');
    };
  }, []);


  const fetchInfluenceurs = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/influenceurs');
      const data = await response.json();
      setInfluenceurs(data);
    } catch (error) {
      console.error('Erreur lors du chargement des influenceurs:', error);
    }
  };


  const selectInfluenceur = (influenceur: Influenceur) => {
    setSelectedInfluenceur(influenceur);
  };

  const resetSelection = () => {
    setSelectedInfluenceur(null);
    setPhoneNumber('');
  };












  const hasVoted = async (phone: string): Promise<boolean> => {
    try {
      const response = await fetch(`http://localhost:3000/api/votes?phoneNumber=${phone}`);
      const data = await response.json();
      return data.hasVoted;
    } catch (error) {
      console.error('Erreur lors de la vérification du vote:', error);
      return false;
    }
  };










  const submitVote = async (phone: string) => {
    if (!selectedInfluenceur) return;

    console.log('Submitting vote for:', selectedInfluenceur.name, 'with phone:', phone);

    try {
      const response = await fetch('http://localhost:3000/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          influenceurId: selectedInfluenceur.id,
          phoneNumber: phone,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Erreur serveur 5:', text);
        throw new Error('Erreur lors du vote 3');
      }

      // const newVote = await response.json();
      // setVotes([...votes, newVote]);
      fetchInfluenceurs()

      resetSelection();


    } catch (error) {
      if (error instanceof Error) {
        console.error('Erreur lors du vote 1:', error.message);
      } else {
        console.error('Erreur lors du vote 2:', error);
      }
    }
  };







  const addInfluenceur = async (influenceur: Influenceur) => {
    try {
      const response = await fetch('http://localhost:3000/api/influenceurs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(influenceur),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout de l\'influenceur');
      }

      const newInfluenceur = await response.json();
      setInfluenceurs([...influenceurs, newInfluenceur]);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'influenceur:', error);
    }
  };




















  const removeInfluenceur = async (id: string) => {
    try {
      await fetch(`http://localhost:3000/api/influenceurs/${id}`, {
        method: 'DELETE',
      });
      setInfluenceurs(influenceurs.filter(influenceur => influenceur.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'influenceur:', error);
    }
  };











  const updateInfluenceur = async (updatedInfluenceur: Influenceur) => {
    try {
      const response = await fetch(`http://localhost:3000/api/influenceurs/${updatedInfluenceur.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedInfluenceur),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de l\'influenceur');
      }

      setInfluenceurs(influenceurs.map(influenceur =>
        influenceur.id === updatedInfluenceur.id ? updatedInfluenceur : influenceur
      ));
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'influenceur:', error);
    }
  };





















  return (
    <VoteContext.Provider
      value={{
        listInfluenceur: influenceurs,
        votes,
        selectedInfluenceur,
        phoneNumber,
        setPhoneNumber,
        selectInfluenceur,
        submitVote,
        hasVoted,
        resetSelection,
        addInfluenceur,
        removeInfluenceur,
        updateInfluenceur
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