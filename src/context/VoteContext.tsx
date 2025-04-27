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
  // const [influenceurs, setInfluenceurs] = useLocalStorage<Influenceur[]>('Influenceurs', initialInfluenceurs);
  const [influenceurs, setInfluenceurs] = useState<Influenceur[]>([]);

  // const [votes, setVotes] = useLocalStorage<Vote[]>('votes', []);
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













  // const hasVoted = (phone: string): boolean => {
  //   return votes.some(vote => vote.phoneNumber === phone);
  // };

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












  // const submitVote = (phone: string) => {
  //   if (!selectedInfluenceur || hasVoted(phone)) return;

  //   // Add the vote to the votes array
  //   const newVote: Vote = {
  //     influenceurId: selectedInfluenceur.id,
  //     phoneNumber: phone,
  //     timestamp: Date.now()
  //   };
  //   setVotes([...votes, newVote]);

  //   // Update the Influenceur's vote count
  //   setInfluenceurs(prevInfluenceurs =>
  //     prevInfluenceurs.map(influenceur =>
  //       influenceur.id === selectedInfluenceur.id
  //         ? { ...influenceur, voteCount: influenceur.voteCount + 1 }
  //         : influenceur
  //     )
  //   );
  // };


  const submitVote = async (phone: string) => {
    if (!selectedInfluenceur) return;

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
        throw new Error('Erreur lors du vote');
      }

      const newVote = await response.json();
      setVotes([...votes, newVote]);
      resetSelection();
    } catch (error) {
      console.error('Erreur lors du vote:', error);
    }
  };









  // const addInfluenceur = (influenceur: Influenceur) => {
  //   setInfluenceurs([...influenceurs, { ...influenceur, id: String(Date.now()), voteCount: 0 }]);
  // };

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




















  // const removeInfluenceur = (id: string) => {
  //   setInfluenceurs(influenceurs.filter(influenceur => influenceur.id !== id));
  // };

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










  // const updateInfluenceur = (updatedInfluenceur: Influenceur) => {
  //   setInfluenceurs(influenceurs.map(influenceur =>
  //     influenceur.id === updatedInfluenceur.id ? updatedInfluenceur : influenceur
  //   ));
  // };

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




















  // return (
  //   <VoteContext.Provider
  //     value={{
  //       listInfluenceur: influenceurs,
  //       votes,
  //       selectedInfluenceur: selectedInfluenceur,
  //       phoneNumber,
  //       setPhoneNumber,
  //       selectInfluenceur: selectInfluenceur,
  //       submitVote,
  //       hasVoted,
  //       resetSelection,
  //       addInfluenceur: addInfluenceur,
  //       removeInfluenceur: removeInfluenceur,
  //       updateInfluenceur: updateInfluenceur
  //     }}
  //   >
  //     {children}
  //   </VoteContext.Provider>
  // );



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