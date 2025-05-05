import React, { createContext, useState, useContext, useEffect } from 'react';
import { Influenceur, Vote } from '../types';
import { io } from 'socket.io-client';
import { generateOTP } from '../helpers/generateOtp';

interface VoteContextType {
  listInfluenceur: Influenceur[];
  votes: Vote[];
  selectedInfluenceur: Influenceur | null;
  phoneNumber: string;
  setPhoneNumber: (number: string) => void;
  selectInfluenceur: (influenceur: Influenceur) => void;
  submitVote: (phone: string) => Promise<void>;
  hasVoted: (phone: string) => Promise<boolean>;
  requestOTP: (phone: string) => Promise<void>;
  validateOTP: (phone: string, otp: string) => Promise<void>;
  resetSelection: () => void;
  addInfluenceur: (influenceur: Influenceur) => Promise<void>;
  removeInfluenceur: (id: string) => Promise<void>;
  updateInfluenceur: (influenceur: Influenceur) => Promise<void>;
}

const VoteContext = createContext<VoteContextType | undefined>(undefined);

// Configuration correcte du socket avec les options nécessaires
const socket = io('', {
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
    socket.on("connect", () => {
      console.log("✅ Connecté au serveur Socket.IO:", socket.id);
      setSocketConnected(true);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Erreur de connexion Socket.IO:", error);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Déconnecté du serveur Socket.IO");
      setSocketConnected(false);
    });

    // Écouter les mises à jour en temps réel
    // socket.on('voteUpdate', ({ influenceurId, newVoteCount }) => {
    //   console.log("🔥 Vote mis à jour:", influenceurId, newVoteCount);

    // setVotes(prevInfluenceurs =>
    //   prevInfluenceurs.map(influenceur =>
    //     influenceur.id === influenceurId
    //       ? { ...influenceur, voteCount: newVoteCount }
    //       : influenceur
    //   )
    // );
    // });

    socket.on('voteUpdate', ({ influenceurId, newVoteCount }) => {
      console.log("🔥 Vote mis à jour:", influenceurId, newVoteCount);

      setInfluenceurs(prev =>
        prev.map(inf =>
          inf.id === influenceurId ? { ...inf, voteCount: newVoteCount } : inf
        )
      );
    });

    // Écouter les mises à jour de la liste des influenceurs
    // socket.on("influenceursUpdate", (newInfluenceur: Influenceur) => {
    //   console.log("-------------------------------------------------");
    //   console.log("🔥 Mise à jour de la liste reçue:", newInfluenceur);

    //   setInfluenceurs(prevInfluenceurs => [...prevInfluenceurs, newInfluenceur]);
    // });

    socket.on("influenceursUpdate", (data) => {
      // data peut être : { newInfluenceur }, { deletedInfluenceurId }, { updatedInfluenceur }
      if (data.newInfluenceur) {
        setInfluenceurs(prev => [...prev, data.newInfluenceur]);
      }

      if (data.deletedInfluenceurId) {
        setInfluenceurs(prev => prev.filter(inf => inf.id !== data.deletedInfluenceurId));
      }

      if (data.updatedInfluenceur) {
        setInfluenceurs(prev => prev.map(inf =>
          inf.id === data.updatedInfluenceur.id ? data.updatedInfluenceur : inf
        ));
      }
    });

    // Force une tentative de connexion
    socket.connect();

    // Nettoyer les écouteurs à la désinscription
    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
      socket.off('voteUpdate');
      socket.off("influenceursUpdate");

    };
  }, []);

  // Charger les influenceurs au démarrage avec fetch indépendant du socket
  useEffect(() => {
    fetchInfluenceurs();
  }, []);


  /**
   * Fonction pour récupérer la liste des influenceurs depuis l'API
   * @returns {Promise<void>}
   * @throws {Error} Si la requête échoue
   * @description Cette fonction effectue une requête GET à l'API pour récupérer la liste des influenceurs.
   * Elle met à jour l'état local avec les données récupérées.
   */
  const fetchInfluenceurs = async () => {
    try {
      const response = await fetch('https://localhost:3000/api/influenceurs', {
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
      setInfluenceurs(data);
    } catch (error) {
      console.error('Erreur lors du chargement des influenceurs:', error);
    }
  };

  /**
   * Fonction pour sélectionner un influenceur
   * @param {Influenceur} influenceur - L'influenceur à sélectionner
   */
  const selectInfluenceur = (influenceur: Influenceur) => {
    setSelectedInfluenceur(influenceur);
  };


  /**
   * Fonction pour réinitialiser la sélection d'influenceur
   */
  const resetSelection = () => {
    setSelectedInfluenceur(null);
    setPhoneNumber('');
  };














































  // -------------------Influenceur ------------------- //

  /**
   * Fonction pour ajouter un nouvel influenceur
   * @param {Influenceur} influenceur - L'influenceur à ajouter
   * @returns {Promise<void>}
   * @throws {Error} Si la requête échoue
   */
  const addInfluenceur = async (influenceur: Influenceur) => {
    try {
      const response = await fetch('/api/influenceurs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(influenceur),
      });

      if (!response.ok) throw new Error('Erreur lors de l\'ajout');

      // await fetchInfluenceurs(); // Recharger la liste complète
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'influenceur:', error);
    }
  };


  /**
   * Fonction pour supprimer un influenceur
   * @param {string} id - L'ID de l'influenceur à supprimer
   * @returns {Promise<void>}
   * @throws {Error} Si la requête échoue
   */
  const removeInfluenceur = async (id: string) => {
    try {
      const response = await fetch(`/api/influenceurs/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');

    } catch (error) {
      console.error('Erreur lors de la suppression de l\'influenceur:', error);
      throw error;
    }
  };

  /**
   * Fonction pour mettre à jour un influenceur
   * @param {Influenceur} updatedInfluenceur - L'influenceur mis à jour
   * @returns {Promise<void>}
   * @throws {Error} Si la requête échoue
   */
  const updateInfluenceur = async (updatedInfluenceur: Influenceur) => {
    try {
      const response = await fetch(`/api/influenceurs/${updatedInfluenceur.id}`, {
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






































  // -------------------Vote ------------------- //
  /**
   * Fonction pour vérifier si un numéro de téléphone a déjà voté
   * @param {string} phone - Le numéro de téléphone à vérifier
   * @returns {Promise<boolean>} - True si le numéro a voté, sinon false
   */
  const hasVoted = async (phone: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/votes?phoneNumber=${encodeURIComponent(phone)}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Erreur réseau: ${response.status}`);
      }

      // envoyer le code OTP
      const code  = await requestOTP(phone);
      console.log("Code OTP envoyé:", code);
      
      
      const data = await response.json();
      return data.hasVoted;
    } catch (error) {
      console.error('Erreur lors de la vérification du vote:', error);
      return false;
    }
  };

  /**
   * Fonction pour soumettre un vote
   * @param {string} phone - Le numéro de téléphone de l'utilisateur
   * @returns {Promise<void>}
   * @throws {Error} Si la requête échoue
   */
  const submitVote = async (phone: string) => {
    if (!selectedInfluenceur) return;

    console.log('Submitting vote for:', selectedInfluenceur.name, 'with phone:', phone);

    try {
      const response = await fetch('/api/votes', {
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




  /**
   * Fonction pour demander un code OTP
   * @param {string} phone - Le numéro de téléphone de l'utilisateur
   * @returns {Promise<void>}
   * @throws {Error} Si la requête échoue
   */
  const requestOTP = async (phone: string) => {
  if (!selectedInfluenceur) return;

  const response = await fetch("/api/otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phoneNumber: phone,
      influenceurId: selectedInfluenceur.id,
    }),
  });

  if (!response.ok) {
    throw new Error("Erreur lors de l'envoi du code OTP");
  }

  console.log("OTP envoyé avec succès");
};

/**
  * Fonction pour valider le code OTP
  * @param {string} phone - Le numéro de téléphone de l'utilisateur
  * @param {string} otp - Le code OTP à valider
  * @returns {Promise<void>}
  * @throws {Error} Si la requête échoue
 */
const validateOTP = async (phone: string, otp: string) => {
  const response = await fetch("/api/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber: phone, otp }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Erreur de validation");
  }

  const validatedVote = await response.json();
  console.log("Vote validé", validatedVote);
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