import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Category } from "../types";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export const useCategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fonction pour ajouter une catégorie
  const addCategory = async (category: Partial<Category>) => {
    try {
      setIsLoading(true);
      socket.emit("addCategory", category);
    } catch (err) {
      setIsLoading(false);
      setError("Erreur lors de l'ajout de la catégorie");
      console.error(err);
    }
  };

  // Fonction pour supprimer une catégorie
  const removeCategory = async (id: string) => {
    try {
      setIsLoading(true);
      socket.emit("removeCategory", id);
    } catch (err) {
      setIsLoading(false);
      setError("Erreur lors de la suppression de la catégorie");
      console.error(err);
    }
  };

  // Fonction pour mettre à jour une catégorie
  const updateCategory = async (category: Category) => {
    try {
      setIsLoading(true);
      socket.emit("updateCategory", category);
    } catch (err) {
      setIsLoading(false);
      setError("Erreur lors de la mise à jour de la catégorie");
      console.error(err);
    }
  };

  // Fonction pour récupérer les catégories (optionnel - si besoin d'un fetch initial)
  const fetchCategories = async () => {
    try {
      const response = await fetch(SOCKET_URL + `/api/categories`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des catégories');
      }

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError('Erreur lors du chargement des catégories');
      console.error(err);
    }
  };

  // Écouter les événements WebSocket
  useEffect(() => {
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

    socket.on("categoryError", (errorMessage: string) => {
      setError(errorMessage);
      setIsLoading(false);
    });

    // Chargement initial
    fetchCategories();

    // Cleanup
    return () => {
      socket.off("categoriesUpdate");
      socket.off("categoryError");
    };
  }, []);

  return {
    categories,
    addCategory,
    removeCategory,
    updateCategory,
    fetchCategories,
    isLoading,
    error,
  };
};