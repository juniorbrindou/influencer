import React, { createContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Influenceur, Vote } from '../types';


interface VoteContextType {
  listInfluenceur: Influenceur[];
  votes: Vote[];
  selectedInfluenceur: Influenceur | null;
  phoneNumber: string;
  setPhoneNumber: (number: string) => void;
  selectInfluenceur: (influenceur: Influenceur) => void;
  submitVote: (influenceur: Influenceur, phoneNumber: string) => Promise<void>;
  requestOTP: (influenceur: Influenceur, phoneNumber: string) => Promise<boolean>;
  validateOTP: (otp: string) => Promise<void>;
  resetSelection: () => void;
  addInfluenceur: (influenceur: Influenceur) => Promise<void>;
  removeInfluenceur: (id: string) => Promise<void>;
  updateInfluenceur: (influenceur: Influenceur) => Promise<void>;
  otpMessage: string;
  isLoading: boolean;
  error: string | null;
}

export const VoteContext = createContext<VoteContextType | undefined>(undefined);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;


// Configuration du socket adaptée au serveur
const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});



export const VoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [influenceurs, setInfluenceurs] = useState<Influenceur[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [selectedInfluenceur, setSelectedInfluenceur] = useState<Influenceur | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [otpMessage, setOtpMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [receivedOTP, setReceivedOTP] = useState<string | null>(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // Configurer les écouteurs de socket.io
  useEffect(() => {
    // Gestion des événements de connexion
    socket.on("connect", () => {
      console.log("✅ Connecté au serveur Socket.IO:", socket.id);
      setSocketConnected(true);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Erreur de connexion Socket.IO:", error);
      setError(`Erreur de connexion: ${error.message}`);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Déconnecté du serveur Socket.IO");
      setSocketConnected(false);
    });

    socket.on('voteUpdate', ({ influenceurId, newVoteCount }) => {
      console.log("🔥 Vote mis à jour:", influenceurId, newVoteCount);

      setInfluenceurs(prev =>
        prev.map(inf =>
          inf.id === influenceurId ? { ...inf, voteCount: newVoteCount } : inf
        )
      );
    });

    socket.on("influenceursUpdate", (data) => {
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

    // Écouteurs spécifiques au processus de vote
    socket.on("otpSent", (otp) => {
      console.log("OTP reçu:", otp);
      setReceivedOTP(otp);
      setOtpMessage("Code de validation envoyé");
      setIsLoading(false);
    });

    socket.on("otpError", (errorMessage) => {
      console.error("Erreur OTP:", errorMessage);
      setError(errorMessage);
      setIsLoading(false);
    });

    socket.on("voteSuccess", (vote) => {
      console.log("Vote enregistré avec succès:", vote);
      setIsLoading(false);
      resetSelection();
    });

    socket.on("voteError", (errorMessage) => {
      console.error("Erreur de vote:", errorMessage);
      setError(errorMessage);
      setIsLoading(false);
    });

    socket.on("validateSuccess", (validatedVote) => {
      console.log("Vote validé avec succès:", validatedVote);
      setIsLoading(false);
      resetSelection();
    });

    socket.on("validateError", (errorMessage) => {
      console.error("Erreur de validation:", errorMessage);
      setError(errorMessage);
      setIsLoading(false);
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
      socket.off("otpSent");
      socket.off("otpError");
      socket.off("voteSuccess");
      socket.off("voteError");
      socket.off("validateSuccess");
      socket.off("validateError");
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
      const response = await fetch(BACKEND_URL+'/api/influenceurs', {
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
      setError('Erreur lors du chargement des influenceurs');
    }
  };

  /**
   * Fonction pour sélectionner un influenceur
   * @param {Influenceur} influenceur - L'influenceur à sélectionner
   */
  const selectInfluenceur = (influenceur: Influenceur) => {
    setSelectedInfluenceur(influenceur);
    setError(null); // Réinitialiser les erreurs
  };

  /**
   * Fonction pour réinitialiser la sélection d'influenceur
   */
  const resetSelection = () => {
    setSelectedInfluenceur(null);
    setPhoneNumber('');
    setError(null);
    setOtpMessage('');
    setReceivedOTP(null);
  };


  // Ajoutez en haut de votre fichier

  // Fonction d'envoi
  const sendWhatsAppLink = (phoneNumber: string, otp: string) => {
    try {
      const message = `Votre code OTP est : ${otp}\n\nValide 5 minutes`;
      const formattedPhone = phoneNumber.replace(/[^\d+]/g, '').replace(/^00/, '+');
      phoneNumber = "+225" + formattedPhone;
      const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

      return {
        otp,
        whatsappLink
      };
    } catch (error) {
      console.error('Erreur génération lien WhatsApp:', error);
      throw error;
    }
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
      setIsLoading(true);
      const response = await fetch(BACKEND_URL+'/api/influenceurs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(influenceur),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'ajout');
      }

      setIsLoading(false);
      // Pas besoin de fetchInfluenceurs car nous recevrons l'update via socket
    } catch (error) {
      setIsLoading(false);
      console.error('Erreur lors de l\'ajout de l\'influenceur:', error);
      setError('Erreur lors de l\'ajout de l\'influenceur');
      throw error;
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
      setIsLoading(true);
      const response = await fetch(BACKEND_URL+`/api/influenceurs/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

      setIsLoading(false);
      // Pas besoin de fetchInfluenceurs car nous recevrons l'update via socket
    } catch (error) {
      setIsLoading(false);
      console.error('Erreur lors de la suppression de l\'influenceur:', error);
      setError('Erreur lors de la suppression de l\'influenceur');
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
      setIsLoading(true);
      const response = await fetch(BACKEND_URL+`/api/influenceurs/${updatedInfluenceur.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedInfluenceur),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }

      setIsLoading(false);
      // Pas besoin de fetchInfluenceurs car nous recevrons l'update via socket
    } catch (error) {
      setIsLoading(false);
      console.error('Erreur lors de la mise à jour de l\'influenceur:', error);
      setError('Erreur lors de la mise à jour de l\'influenceur');
      throw error;
    }
  };


  /**
   * Fonction pour soumettre un vote via socket.io
   * @returns {Promise<void>}
   * @throws {Error} Si la requête échoue
   */
  const submitVote = async (selectedInfluenceur: Influenceur, phoneNumber: string): Promise<void> => {
    if (!selectedInfluenceur || !phoneNumber) {
      setError("Sélectionnez un influenceur et entrez un numéro de téléphone");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Utiliser socket.io pour soumettre le vote
      socket.emit("submitVote", {
        influenceurId: selectedInfluenceur.id,
        phoneNumber: phoneNumber
      });

      // La réponse sera traitée par les gestionnaires d'événements socket
    } catch (error) {
      setIsLoading(false);
      console.error('Erreur lors du vote:', error);
      setError('Erreur lors du vote');
      throw error;
    }
  };

  /**
 * Fonction pour vérifier si un numéro peut voter (n'a pas déjà voté)
 * @returns {Promise<boolean>} - true si le numéro a déjà voté, false sinon
 * @throws {Error} Si la requête échoue
 */
  const requestOTP = async (selectedInfluenceur: Influenceur, phoneNumber: string): Promise<boolean> => {
    if (!selectedInfluenceur || !phoneNumber) {
      setError("Sélectionnez un influenceur et entrez un numéro de téléphone");
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Utiliser socket.io pour demander l'OTP
      socket.emit("requestOTP", {
        phoneNumber: phoneNumber,
        influenceurId: selectedInfluenceur.id
      });

      // On crée une promesse qui sera résolue quand on recevra la réponse
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Délai d'attente dépassé pour la demande d'OTP"));
          setIsLoading(false);
          setError("Délai d'attente dépassé pour la demande d'OTP");
        }, 10000); // 10 secondes de timeout

        // Fonction temporaire pour recevoir la réponse
        const onResponse = (response: { hasVoted: boolean, otp?: string }) => {
          clearTimeout(timeout);
          socket.off("otpResponse", onResponse);
          socket.off("otpError", onOtpError);
          resolve(response.hasVoted);
          console.log("Réponse OTP reçue:", response, phoneNumber);
          if (response.hasVoted) {
            setError("Vous avez déjà voté avec ce numéro");
            setIsLoading(false);
            return;
          }
          if (!response.hasVoted && response.otp) {
            setOtpMessage("Code de validation envoyé");

            const whatsappLink = sendWhatsAppLink(phoneNumber, response.otp);
            console.log("WhatsApp link:", whatsappLink);

            window.open(whatsappLink.whatsappLink, '_blank');
          } else {
            setOtpMessage("Erreur lors de l'envoi du code OTP");
          }
          setIsLoading(false);
        };

        // Fonction temporaire pour gérer les erreurs
        const onOtpError = (errorMsg: string | undefined) => {
          clearTimeout(timeout);
          socket.off("otpResponse", onResponse);
          socket.off("otpError", onOtpError);
          reject(new Error(errorMsg));
        };

        // Ajouter les écouteurs temporaires
        socket.on("otpResponse", onResponse);
        socket.on("otpError", onOtpError);
      });
    } catch (error) {
      setIsLoading(false);
      console.error('Erreur lors de la vérification du vote:', error);
      setError('Erreur lors de la vérification du vote');
      throw error;
    }
  };

  /**
   * Fonction pour valider le code OTP via socket.io
   * @param {string} otp - Le code OTP à valider
   * @returns {Promise<void>}
   * @throws {Error} Si la requête échoue
   */
  const validateOTP = async (otp: string): Promise<void> => {
    if (!otp || !selectedInfluenceur || !phoneNumber) {
      setError("Tous les champs sont requis pour valider le vote.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Utiliser socket.io pour valider l'OTP
      socket.emit("validateOTP", {
        influenceurId: selectedInfluenceur.id,
        phoneNumber,
        otp
      });
      console.log("Validation de l'OTP:", otp);


      // todo La réponse sera traitée par les gestionnaires d'événements socket
    } catch (error) {
      setIsLoading(false);
      console.error('Erreur lors de la validation de l\'OTP:', error);
      setError('Erreur lors de la validation de l\'OTP');
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
        requestOTP,
        validateOTP,
        resetSelection,
        addInfluenceur,
        removeInfluenceur,
        updateInfluenceur,
        otpMessage,
        isLoading,
        error
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