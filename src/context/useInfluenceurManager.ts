import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Influenceur } from "../types";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
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
      // Logique d'ajout côté API
      const response = await fetch(SOCKET_URL+`/api/influenceurs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(influenceur),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout');
      }

      // Réponse de l'API
      const data = await response.json();
      socket.emit("addInfluenceur", data); // Émettre l'événement via WebSocket

      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError("Erreur lors de l'ajout de l'influenceur");
      console.error(err);
    }
  };

  // Fonction pour supprimer un influenceur
  const removeInfluenceur = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(SOCKET_URL+`/api/influenceurs/${id}`, {
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
      const response = await fetch(SOCKET_URL+`/api/influenceurs/${influenceur.id}`, {
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
      const response = await fetch(SOCKET_URL+`/api/influenceurs`, {
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
