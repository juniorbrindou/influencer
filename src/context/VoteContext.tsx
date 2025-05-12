import React, { createContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Category, ClassementData, Influenceur, Vote } from '../types';


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

  categories: Category[];
  addCategory: (category: Partial<Category>) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  countryCode: string;
  setCountryCode: (code: string) => void;

  offerSecondVote: boolean;
  setOfferSecondVote: (val: boolean) => void;
  specialVote: boolean;
  setSpecialVote: (val: boolean) => void;
  fetchResults: (categoryId: string) => Promise<ClassementData>
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
  const [votes, setVotes] = useState<Vote[]>(() => {
    const stored = 0
    return stored ? JSON.parse(stored) : [];
  });
  const [selectedInfluenceur, setSelectedInfluenceur] = useState<Influenceur | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [otpMessage, setOtpMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [receivedOTP, setReceivedOTP] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [countryCode, setCountryCode] = useState<string>('+225');
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [offerSecondVote, setOfferSecondVote] = useState(false);
  const [specialVote, setSpecialVote] = useState(false);


  // #section Configurer les écouteurs de socket.io
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

    socket.on("voteError", (errorMessage) => {
      setError(errorMessage);
      setIsLoading(false);
      setOfferSecondVote(false); // S'assurer qu'on ne montre pas l'offre de second vote si erreur
    });

    socket.on("offerSecondVote", ({ canVoteSpecial }) => {
      if (canVoteSpecial) {
        setOfferSecondVote(true);
      }
      setIsLoading(false);
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


    // Écouteur pour les mises à jour de catégories

    socket.on("categoriesUpdate", (data) => {
      if (data.newCategory) {
        setCategories(prev => [...prev, data.newCategory]);
      }

      if (data.deletedCategoryId) {
        setCategories(prev => prev.filter(cat => cat.id !== data.deletedCategoryId));
      }

      if (data.updatedCategory) {
        setCategories(prev => prev.map(cat =>
          cat.id === data.updatedCategory.id ? data.updatedCategory : cat
        ));
      }
    });
    // fin de l'écouteur pour les mises à jour de catégories



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
      setVotes(prev => [...prev, vote]); // Mettre à jour les votes
      resetSelection();
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


  useEffect(() => {
    if (!socket) return;

    const handleVoteValidated = ({ influenceurId }: { influenceurId: string }) => {
      console.log("voteValidated reçu pour:", influenceurId);
      fetchInfluenceurs(); // 💥 on recharge
    };

    socket.on("voteValidated", handleVoteValidated);

    return () => {
      socket.off("voteValidated", handleVoteValidated);
    };
  }, [socket]);

  // #endSection Configurer les écouteurs de socket.io

  // Ajoutez ces fonctions
  const addCategory = async (category: Partial<Category>) => {
    try {
      setIsLoading(true);
      socket.emit("addCategory", category);
    } catch (error) {
      setIsLoading(false);
      setError("Erreur lors de l'ajout de la catégorie");
      throw error;
    }
  };

  const removeCategory = async (id: string) => {
    try {
      setIsLoading(true);
      socket.emit("removeCategory", id);
    } catch (error) {
      setIsLoading(false);
      setError("Erreur lors de la suppression de la catégorie");
      throw error;
    }
  };

  const updateCategory = async (category: Category) => {
    try {
      setIsLoading(true);
      socket.emit("updateCategory", category);
    } catch (error) {
      setIsLoading(false);
      setError("Erreur lors de la mise à jour de la catégorie");
      throw error;
    }
  };






  const fetchCategories = async () => {
    try {
      const response = await fetch(BACKEND_URL + '/api/categories', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur réseau: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
      setError('Erreur chargement catégories');
    }
  };

  // Appelez cette fonction dans un useEffect
  useEffect(() => {
    fetchCategories();
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
      const response = await fetch(BACKEND_URL + '/api/influenceurs', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur réseau: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      // S'assurer que chaque influenceur a bien un voteCount numérique
      const formattedData = data.map((inf: { voteCount: unknown; }) => ({
        ...inf,
        voteCount: Number(inf.voteCount) || 0
      }));
      setInfluenceurs(formattedData);
    } catch (error) {
      console.error('Erreur chargement influenceurs:', error);
      setError('Erreur chargement influenceurs');
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
      const response = await fetch(BACKEND_URL + '/api/influenceurs', {
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
      const response = await fetch(BACKEND_URL + `/api/influenceurs/${id}`, {
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
      const response = await fetch(BACKEND_URL + `/api/influenceurs/${updatedInfluenceur.id}`, {
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
    if (!selectedInfluenceur) {
      setError("Sélectionnez un influenceur");
      return Promise.reject("Aucun influenceur sélectionné");
    }

    return new Promise((resolve, reject) => {
      try {
        setIsLoading(true);
        setError(null);

        // Générer un fingerprint client
        generateEnhancedFingerprint().then(fingerprint => {
          // Écouteurs temporaires pour gérer la réponse
          const handleSuccess = () => {
            cleanup();
            resolve();
          };

          const handleError = (errorMessage: string) => {
            cleanup();
            reject(errorMessage);
          };

          const cleanup = () => {
            socket.off('voteSuccess', handleSuccess);
            socket.off('voteError', handleError);
          };

          // Configurer les écouteurs
          socket.once('voteSuccess', handleSuccess);
          socket.once('voteError', handleError);

          // Émettre le vote
          socket.emit("submitVote", {
            influenceurId: selectedInfluenceur.id,
            phoneNumber,
            isSpecialVote: specialVote,
            otp: fingerprint,
          });

          // Timeout au cas où le serveur ne répond pas
          setTimeout(() => {
            cleanup();
            reject("Timeout - Pas de réponse du serveur");
          }, 10000);
        });
      } catch (error) {
        setIsLoading(false);
        reject('Erreur lors du vote');
      }
    });
  };

  // Fonction pour générer un fingerprint client
  const generateFingerprint = async (): Promise<string> => {
    const fingerprintData = {
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    // Hasher les données pour créer un identifiant unique
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(fingerprintData));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const generateEnhancedFingerprint = async (): Promise<string> => {
    const fingerprintData = {
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      colorDepth: window.screen.colorDepth,
      languages: navigator.languages.join(','),
      hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
    };

    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(fingerprintData));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };


  /**
 * Fonction pour vérifier si un numéro peut voter (n'a pas déjà voté)
 * @returns {Promise<boolean>} - true si le numéro a déjà voté, false sinon
 * @throws {Error} Si la requête échoue
 */
  const requestOTP = async (selectedInfluenceur: Influenceur, phoneNumberWithoutCode: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const fullPhoneNumber = `${countryCode}${phoneNumberWithoutCode.replace(/\D/g, '')}`;

      socket.emit("requestOTP", {
        phoneNumber: fullPhoneNumber,
        influenceurId: selectedInfluenceur.id
      });

      return false; // Retourne false car la réponse sera gérée via les écouteurs socket
    } catch (error) {
      setIsLoading(false);
      setError("Erreur réseau");
      return false; // Ensure a boolean is returned even in case of an error
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

      const fullPhoneNumber = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;

      socket.emit("validateOTP", {
        influenceurId: selectedInfluenceur.id,
        phoneNumber: fullPhoneNumber,
        otp,
        isSpecialVote: specialVote // Ajoutez ceci
      });

    } catch (error) {
      setIsLoading(false);
      console.error('Erreur lors de la validation de l\'OTP:', error);
      setError('Erreur lors de la validation de l\'OTP');
      throw error;
    }
  };


  /**
   * Recuperer les utilisateurs de maniere filtrée et rangée pour la partie classement
   * @param categoryId 
   * @returns promise
   */
  const fetchResults = async (categoryId: string): Promise<ClassementData> => {
    try {
      setIsLoading(true);
      const response = await fetch(BACKEND_URL + `/api/results/${categoryId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur réseau: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur chargement résultats:', error);
      setError('Erreur chargement résultats');
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
        error,
        categories,
        addCategory,
        removeCategory,
        updateCategory,
        countryCode,
        setCountryCode,
        offerSecondVote,
        setOfferSecondVote,
        specialVote,
        setSpecialVote,
        fetchResults,
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