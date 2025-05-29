import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Influenceur } from "../types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const socket = io(BACKEND_URL, {
  withCredentials: true,
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export const useInfluenceurManager = () => {
  const [influenceurs, setInfluenceurs] = useState<Influenceur[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fonction pour ajouter un influenceur
  const addInfluenceur = async (influenceur: Influenceur) => {
    try {
      setIsLoading(true);

      let finalImageUrl = influenceur.imageUrl;
      if (influenceur.imageUrl instanceof File) {
        const formData = new FormData();
        formData.append('image', influenceur.imageUrl);

        const uploadResponse = await fetch(BACKEND_URL + '/api/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        if (!uploadResponse.ok) throw new Error('Erreur upload image');

        const uploadData = await uploadResponse.json();
        finalImageUrl = uploadData.imageUrl;
      }

      const response = await fetch(BACKEND_URL + `/api/influenceurs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...influenceur,
          imageUrl: finalImageUrl,
          categoryId: influenceur.categoryId
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de l\'ajout');

      const data = await response.json();

      // Normalise les données reçues
      const normalizedData = {
        ...data,
        voteCount: data.voteCount || 0
      };

      socket.emit("addInfluenceur", normalizedData);
      setIsLoading(false);
      return normalizedData;
    } catch (err) {
      setIsLoading(false);
      setError("Erreur lors de l'ajout");
      console.error(err);
      throw err;
    }
  };

  // Fonction pour supprimer un influenceur
  const removeInfluenceur = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(BACKEND_URL + `/api/influenceurs/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      // Réponse de l'API
      socket.emit("removeInfluenceur", id); // Émettre l'événement via WebSocket
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError("Erreur lors de la suppression de l'influenceur");
      console.error(err);
    }
  };

  // Fonction pour mettre à jour un influenceur
  const updateInfluenceur = async (influenceur: Influenceur) => {
    try {
      setIsLoading(true);
      const response = await fetch(BACKEND_URL + `/api/influenceurs/${influenceur.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(influenceur),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      // Réponse de l'API
      const data = await response.json();
      socket.emit("updateInfluenceur", data); // Émettre l'événement via WebSocket
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError("Erreur lors de la mise à jour de l'influenceur");
      console.error(err);
    }
  };

  // Fonction pour récupérer les influenceurs
  const fetchInfluenceurs = async () => {
    try {
      const response = await fetch(BACKEND_URL + `/api/influenceurs`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des influenceurs');
      }

      const data = await response.json();
      setInfluenceurs(data);
    } catch (err) {
      setError('Erreur lors du chargement des influenceurs');
      console.error(err);
    }
  };

  // Écouter les événements WebSocket pour mettre à jour l'état
  useEffect(() => {
    socket.on("influenceurAdded", (newInfluenceur: Influenceur) => {
      setInfluenceurs((prevInfluenceurs) => [...prevInfluenceurs, newInfluenceur]);
    });

    socket.on("influenceurRemoved", (id: string) => {
      setInfluenceurs((prevInfluenceurs) => prevInfluenceurs.filter(inf => inf.id !== id));
    });

    socket.on("influenceurUpdated", (updatedInfluenceur: Influenceur) => {
      setInfluenceurs((prevInfluenceurs) => prevInfluenceurs.map((inf) =>
        inf.id === updatedInfluenceur.id ? updatedInfluenceur : inf
      ));
    });

    // Clean up on component unmount
    return () => {
      socket.off("influenceurAdded");
      socket.off("influenceurRemoved");
      socket.off("influenceurUpdated");
    };
  }, []);

  return {
    influenceurs,
    addInfluenceur,
    removeInfluenceur,
    updateInfluenceur,
    fetchInfluenceurs,
    isLoading,
    error,
  };
};
