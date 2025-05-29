import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Category } from "../types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const socket = io(BACKEND_URL, {
  withCredentials: true,
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export const useCategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Initialisé à true

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

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(BACKEND_URL + `/api/categories`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des catégories');
      }

      const data = await response.json();
      setCategories(data);
      setIsLoading(false);
    } catch (err) {
      setError('Erreur lors du chargement des catégories');
      console.error(err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Chargement initial
    fetchCategories();

    // Écoute des mises à jour en temps réel
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