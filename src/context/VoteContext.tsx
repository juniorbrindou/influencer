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
  submitVote: (phone: string) => Promise<void>;
  hasVoted: (phone: string) => Promise<boolean>;
  resetSelection: () => void;
  addInfluenceur: (influenceur: Influenceur) => Promise<void>;
  removeInfluenceur: (id: string) => Promise<void>;
  updateInfluenceur: (influenceur: Influenceur) => Promise<void>;
}

const VoteContext = createContext<VoteContextType | undefined>(undefined);

// Configuration correcte du socket avec les options nécessaires
const socket = io('http://localhost:3000', {
  withCredentials: true,
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

export const VoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [influenceurs, setInfluenceurs] = useState<Influenceur[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [selectedInfluenceur, setSelectedInfluenceur] = useState<Influenceur | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [socketConnected, setSocketConnected] = useState<boolean>(false);

  // Configurer les écouteurs de socket.io
  useEffect(() => {
    // Gestion des événements de connexion
    socket.on('connect', () => {
      console.log('Connecté au serveur Socket.IO!', socket.id);
      setSocketConnected(true);
    });

    socket.on('connect_error', (error) => {
      console.error('Erreur de connexion Socket.IO:', error);
    });

    socket.on('disconnect', () => {
      console.log('Déconnecté du serveur Socket.IO');
      setSocketConnected(false);
    });

    // Écouter les mises à jour en temps réel
    socket.on('voteUpdate', ({ influenceurId, newVoteCount }) => {
      console.log('Vote update reçu:', influenceurId, newVoteCount);
      setInfluenceurs(prevInfluenceurs =>
        prevInfluenceurs.map(influenceur =>
          influenceur.id === influenceurId
            ? { ...influenceur, voteCount: newVoteCount }
            : influenceur
        )
      );
    });

    // Force une tentative de connexion
    socket.connect();

    // Nettoyer les écouteurs à la désinscription
    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
      socket.off('voteUpdate');
    };
  }, []);

  // Charger les influenceurs au démarrage avec fetch indépendant du socket
  useEffect(() => {
    fetchInfluenceurs();
  }, []);

  const fetchInfluenceurs = async () => {
    try {
      console.log('Tentative de récupération des influenceurs...');
      const response = await fetch('http://localhost:3000/api/influenceurs', {
        method: 'GET',
        credentials: 'include', // Envoyer les cookies
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur réseau: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Influenceurs reçus:', data);
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
      const response = await fetch(`http://localhost:3000/api/votes?phoneNumber=${encodeURIComponent(phone)}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Erreur réseau: ${response.status}`);
      }
      
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
        credentials: 'include',
        body: JSON.stringify({
          influenceurId: selectedInfluenceur.id,
          phoneNumber: phone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du vote');
      }

      resetSelection();
    } catch (error) {
      console.error('Erreur lors du vote:', error);
      throw error;
    }
  };

  const addInfluenceur = async (influenceur: Influenceur) => {
    try {
      const response = await fetch('http://localhost:3000/api/influenceurs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(influenceur),
      });

      if (!response.ok) throw new Error('Erreur lors de l\'ajout');

      await fetchInfluenceurs(); // Recharger la liste complète
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'influenceur:', error);
    }
  };

  const removeInfluenceur = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/influenceurs/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');
      
      await fetchInfluenceurs(); // Recharger la liste complète
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'influenceur:', error);
      throw error;
    }
  };

  const updateInfluenceur = async (updatedInfluenceur: Influenceur) => {
    try {
      const response = await fetch(`http://localhost:3000/api/influenceurs/${updatedInfluenceur.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedInfluenceur),
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      
      await fetchInfluenceurs(); // Recharger la liste complète
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'influenceur:', error);
      throw error;
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
      {socketConnected ? null : (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg">
          Déconnecté du serveur - Les votes en temps réel ne sont pas disponibles
        </div>
      )}
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