import React, { useEffect, useState, useCallback } from 'react';
import { PlusCircle, Edit, Trash2, Save, X } from 'lucide-react';
import { Category, Influenceur } from '../types';
import { useVote } from '../context/useVote';
import { useCategoryManager } from '../context/useCartegoryManager';
import { ExclamationTriangleIcon } from '@heroicons/react/16/solid';
import CountUp from 'react-countup';

// Composant pour afficher une carte de statistique avec animation
const StatCard = React.memo(({
  title,
  value,
  color,
  subValue
}: {
  title: string;
  value: number | string;
  color: string;
  subValue?: string;
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    indigo: 'bg-indigo-50 text-indigo-600'
  };

  return (
    <div className={`${colorClasses[color as keyof typeof colorClasses]} rounded-lg p-4`}>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold">
        {typeof value === 'number' ? <CountUp end={value} duration={1.5} /> : value}
      </p>
      {subValue && <p className="text-xs opacity-75">{subValue}</p>}
    </div>
  );
});



/**
 * Composant AdminDashboard pour gérer les influenceurs et afficher les statistiques de vote.
 */
const AdminDashboard: React.FC = () => {
  // Extrait les données et fonctions nécessaires du contexte VoteContext
  const { listInfluenceur: influenceurs, votes, addInfluenceur, removeInfluenceur, updateInfluenceur } = useVote();
  const { categories, addCategory, removeCategory, updateCategory } = useCategoryManager();

  // États pour la gestion des influenceurs
  const [isAddingInfluenceur, setIsAddingInfluenceur] = useState(false);
  const [editingInfluenceurId, setEditingInfluenceurId] = useState<string | null>(null);
  const [newInfluenceur, setNewInfluenceur] = useState<Partial<Influenceur & { imageUrl: string | File | undefined }>>({
    name: '',
    imageUrl: undefined
  });
  const [editInfluenceur, setEditInfluenceur] = useState<Influenceur | null>(null);

  // États pour la gestion des catégories
  const [newCategory, setNewCategory] = useState<Partial<Category> | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const [categoryStats, setCategoryStats] = useState({
    totalByCategory: {} as Record<string, number>,
    specialCategoryTotal: 0,
    mostPopularCategory: { name: '', votes: 0 },
    todayVotes: 0
  });


  // États pour les statistiques
  const [stats, setStats] = useState({
    totalInfluenceurs: 0,
    totalVotes: 0,
    totalVoteRecords: 0,
    lastUpdated: new Date()
  });

  // Trouver la catégorie spéciale
  const specialCategory = categories.find(cat => cat.name === "INFLUENCEUR2LANNEE");

  // Déterminer si le bouton d'ajout doit être affiché
  const showAddInfluenceurButton = selectedCategory && selectedCategory !== specialCategory?.id;

  // Ajoutez cette fonction dans le composant
  const calculateStats = useCallback(() => {
    // Calcul des votes par catégorie
    const votesByCategory: Record<string, number> = {};

    categories.forEach(category => {
      const categoryVotes = influenceurs
        .filter(inf => inf.categoryId === category.id)
        .reduce((sum, inf) => sum + (inf.voteCount || 0), 0);

      votesByCategory[category.id] = categoryVotes;
    });

    // Trouver la catégorie spéciale et son total
    const specialCat = categories.find(c => c.name === "INFLUENCEUR2LANNEE");
    const specialCategoryTotal = specialCat ? votesByCategory[specialCat.id] || 0 : 0;

    // Trouver la catégorie la plus populaire (hors spéciale)
    const nonSpecialCategories = categories.filter(c => c.name !== "INFLUENCEUR2LANNEE");
    let mostPopular = { name: '', votes: 0 };

    nonSpecialCategories.forEach(category => {
      if (votesByCategory[category.id] > mostPopular.votes) {
        mostPopular = {
          name: category.name,
          votes: votesByCategory[category.id]
        };
      }
    });

    // Calcul des votes du jour (simplifié - à adapter selon votre modèle de données)
    const today = new Date().toISOString().split('T')[0];
    const todayVotes = votes.filter(vote => {
      const voteDate = new Date(vote.timestamp || 0).toISOString().split('T')[0];
      return voteDate === today;
    }).length;

    setCategoryStats({
      totalByCategory: votesByCategory,
      specialCategoryTotal,
      mostPopularCategory: mostPopular,
      todayVotes
    });
  }, [categories, influenceurs, votes]);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  // Calcul des statistiques
  useEffect(() => {
  const mainInfluenceurs = influenceurs.filter(inf => inf.isMain);
  const totalVotes = mainInfluenceurs.reduce((total, influenceur) => {
    return total + (Number(influenceur.voteCount) || 0);
  }, 0);

  setStats({
    totalInfluenceurs: mainInfluenceurs.length,
    totalVotes,
    totalVoteRecords: votes.length,
    lastUpdated: new Date()
  });
}, [influenceurs, votes]);

  // Fonction pour uploader une image
  const uploadImage = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    try {
      const response = await fetch(`${BACKEND_URL}/api/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) throw new Error('Échec du téléchargement');
      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      throw error;
    }
  }, []);

  // Fonctions pour la gestion des catégories
  const handleAddCategory = async () => {
    if (!newCategory?.name) return;

    try {
      let imageUrl = '';
      if (newCategory.imageUrl instanceof File) {
        imageUrl = await uploadImage(newCategory.imageUrl);
      } else if (newCategory.imageUrl) {
        imageUrl = newCategory.imageUrl;
      }

      await addCategory({
        name: newCategory.name,
        imageUrl
      });
      setShowCategoryForm(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la catégorie:', error);
    }
  };




  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      await removeCategory(id);
    }
  };


  const handleSaveEditCategory = async () => {
    if (!editCategory) return;

    try {
      let imageUrl = editCategory.imageUrl;
      if (editCategory.imageUrl instanceof File) {
        imageUrl = await uploadImage(editCategory.imageUrl);
      }

      await updateCategory({
        ...editCategory,
        imageUrl
      });
      setEditingCategoryId(null);
      setEditCategory(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditCategory({ ...category });
  };

  const handleCancelEditCategory = () => {
    setEditingCategoryId(null);
    setEditCategory(null);
  };

  const handleCategoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewCategory({ ...newCategory, imageUrl: e.target.files[0] });
    }
  };

  const handleEditCategoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditCategory(prev => prev ? { ...prev, imageUrl: e.target.files![0] } : null);
    }
  };


  /**
   * Gère l'ajout d'un nouvel influenceur.
   * Vérifie que le nom et l'URL de l'image sont présents.
   * Appelle la fonction addInfluenceur du contexte.
   * Réinitialise le formulaire et masque le formulaire d'ajout.
   */
  const handleAddInfluenceur = async () => {
    if (!newInfluenceur.name || !newInfluenceur.imageUrl || !selectedCategory) return;

    try {
      let imageUrl = newInfluenceur.imageUrl;
      if (newInfluenceur.imageUrl instanceof File) {
        imageUrl = await uploadImage(newInfluenceur.imageUrl);
      }

      await addInfluenceur({
        id: '',
        name: newInfluenceur.name,
        imageUrl: imageUrl as string,
        voteCount: 0,
        categoryId: selectedCategory,
        isMain: false
      });

      setNewInfluenceur({ name: '', imageUrl: '' });
      setIsAddingInfluenceur(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'influenceur:', error);
    }
  };

  /**
   * Prépare l'édition d'un influenceur.
   * Définit l'ID de l'influenceur à éditer et copie ses données dans l'état editInfluenceur.
   * @param influenceur L'objet Influenceur à éditer.
   */
  const handleEditInfluenceur = (influenceur: Influenceur) => {
    // Définit l'ID de l'influenceur qui est en cours d'édition
    setEditingInfluenceurId(influenceur.id);
    // Copie les données de l'influenceur dans l'état dédié à l'édition
    // Utilise l'opérateur spread (...) pour créer une copie et éviter les mutations directes
    setEditInfluenceur({ ...influenceur });
  };

  /**
   * Gère la sauvegarde des modifications apportées à un influenceur.
   * Appelle la fonction updateInfluenceur du contexte si des données d'édition existent.
   * Réinitialise l'état d'édition.
   */
  const handleSaveEdit = () => {
    // Vérifie si un influenceur est en cours d'édition
    if (editInfluenceur) {
      // Appelle la fonction pour mettre à jour l'influenceur via le contexte
      updateInfluenceur(editInfluenceur);
    }
    // Quitte le mode édition en réinitialisant l'ID d'édition
    setEditingInfluenceurId(null);
    // Optionnel : Réinitialiser editInfluenceur à null
    setEditInfluenceur(null);
  };

  /**
   * Gère la suppression d'un influenceur après confirmation.
   * @param id L'ID de l'influenceur à supprimer.
   */
  const handleDeleteInfluenceur = (id: string) => {
    // Affiche une boîte de dialogue de confirmation
    if (window.confirm('Êtes-vous sûr de vouloir retirer cet influenceur de la course ?')) {
      // Appelle la fonction pour supprimer l'influenceur via le contexte
      removeInfluenceur(id);
    }
  };

  // Rendu JSX du composant
  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
      {/* Section En-tête avec les statistiques animées */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Tableau de bord</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Total des influenceurs" value={stats.totalInfluenceurs} color="blue" />
          <StatCard title="Total des votes" value={stats.totalVotes} color="green" />
          <StatCard title="Votes aujourd'hui" value={categoryStats.todayVotes} color="purple" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <StatCard
            title="Votes spéciaux"
            value={categoryStats.specialCategoryTotal}
            color="yellow"
          />
          <StatCard
            title="Catégorie la plus populaire"
            value={categoryStats.mostPopularCategory.name || 0}
            subValue={`${categoryStats.mostPopularCategory.votes} votes`}
            color="indigo"
          />
        </div>

        <div className="mt-2 text-xs text-gray-500 text-right">
          Dernière mise à jour: {stats.lastUpdated.toLocaleTimeString()}
        </div>
      </div>








      {/* Section categorie */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Gestion des catégories</h2>
          {/* fait l'operation ternaire de sorte a rendre un bouton avec une petit icone de crois ou de plus un peu comme pour l'autre en bas */}

          <button
            onClick={() => {
              setShowCategoryForm(!showCategoryForm);
              setNewCategory({ name: '', imageUrl: '' });
            }}
            className="flex items-center px-4 py-2 bg-[#6C63FF] text-white rounded-md hover:bg-[#5a52e0] transition-colors"
          >
            {showCategoryForm ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Annuler
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4 mr-2" />
                Nouvelle catégorie
              </>
            )}
          </button>
        </div>

        {/* Formulaire d'ajout de catégorie (visible seulement quand showCategoryForm est true) */}
        {showCategoryForm && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <div className="mb-4">
              <label htmlFor="newCategoryName" className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la nouvelle catégorie
              </label>
              <input
                type="text"
                id="newCategoryName"
                value={newCategory?.name || ''}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent shadow-sm"
                placeholder="Nom de la catégorie"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="newCategoryImage" className="block text-sm font-medium text-gray-700 mb-1">
                Image de la nouvelle catégorie
              </label>
              <input
                type="file"
                id="newCategoryImage"
                onChange={handleCategoryImageChange}
                className="w-full mb-2"
              />
              {/* Prévisualisation de l'image */}
              {newCategory?.imageUrl && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-1">Prévisualisation :</p>
                  <div className="w-32 h-32 border border-gray-300 rounded-md overflow-hidden">
                    <img
                      src={newCategory.imageUrl instanceof File
                        ? URL.createObjectURL(newCategory.imageUrl)
                        : newCategory.imageUrl}
                      alt="Prévisualisation"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                handleAddCategory();
                setShowCategoryForm(false);
              }}
              disabled={!newCategory || !newCategory.name}
              className="px-4 py-2 bg-[#28a745] text-white rounded-md hover:bg-[#218838] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Ajouter la catégorie
            </button>
          </div>
        )}

        {/* Liste des catégories existantes avec numérotation */}
        <div className="space-y-2 mt-4">
          {categories.map((category, index) => (
            <div key={category.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-3">
                {/* Numéro stylisé */}
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-[#6C63FF] text-white text-xs font-bold rounded-full">
                  {index + 1}
                </div>

                {category.imageUrl && (
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img
                      src={category.imageUrl instanceof File ? URL.createObjectURL(category.imageUrl) : category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <span>
                  {editingCategoryId === category.id ? (
                    <input
                      type="text"
                      value={editCategory?.name || ''}
                      onChange={(e) => setEditCategory(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent"
                    />
                  ) : (
                    category.name
                  )}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {editingCategoryId === category.id ? (
                  <>
                    <input
                      type="file"
                      onChange={handleEditCategoryImageChange}
                      className="text-sm"
                    />
                    {/* Ajoutez la prévisualisation pour l'édition */}
                    {editCategory?.imageUrl && (
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img
                          src={editCategory.imageUrl instanceof File
                            ? URL.createObjectURL(editCategory.imageUrl)
                            : editCategory.imageUrl}
                          alt="Prévisualisation"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <button
                      onClick={handleSaveEditCategory}
                      className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100 transition-colors"
                      title="Sauvegarder"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleCancelEditCategory}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 transition-colors"
                      title="Annuler"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    {/* <button
                      onClick={() => handleEditCategory(category)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-100 transition-colors"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </button> */}
                    {/* <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button> */}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>























      {/* Section Gestion des Influenceurs */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Gestion des influenceurs</h2>
          {showAddInfluenceurButton && (
            <button
              onClick={() => {
                setIsAddingInfluenceur(!isAddingInfluenceur);
                setNewInfluenceur({
                  name: '',
                  imageUrl: '',
                  categoryId: selectedCategory || ''
                });
              }}
              className="px-4 py-2 bg-[#6C63FF] text-white rounded-md hover:bg-[#5a52e0] transition-colors flex items-center"
            >
              {isAddingInfluenceur ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Ajouter un Influenceur
                </>
              )}
            </button>
          )}
        </div>

        {/* Formulaire d'ajout d'influenceur (conditionnel) */}
        {isAddingInfluenceur && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-medium mb-3 text-gray-700">Nouvel Influenceur</h3>

            {!selectedCategory ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Veuillez sélectionner une catégorie dans le filtre avant d'ajouter un influenceur.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Afficher la catégorie sélectionnée */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie
                  </label>
                  <div className="px-3 py-2 bg-gray-100 rounded-md">
                    {categories.find(c => c.id === selectedCategory)?.name || 'Catégorie sélectionnée'}
                  </div>
                </div>

                {/* Champ : Nom de l'influenceur */}
                <div>
                  <label htmlFor="influenceurNameAdd" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l'influenceur
                  </label>
                  <input
                    type="text"
                    id="influenceurNameAdd"
                    value={newInfluenceur.name || ''}
                    onChange={(e) => setNewInfluenceur({ ...newInfluenceur, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent shadow-sm"
                    placeholder="Nom complet"
                  />
                </div>

                {/* Champ : Image de l'influenceur */}
                <div>
                  <label htmlFor="influenceurImageAdd" className="block text-sm font-medium text-gray-700 mb-1">
                    Image de l'influenceur
                  </label>
                  <input
                    type="file"
                    id="influenceurImageAdd"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setNewInfluenceur({ ...newInfluenceur, imageUrl: e.target.files[0] as string | File });
                      }
                    }}
                    className="w-full mb-2"
                    accept="image/*"
                  />
                  {/* Prévisualisation de l'image */}
                  {newInfluenceur.imageUrl && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-1">Prévisualisation :</p>
                      <div className="w-32 h-32 border border-gray-300 rounded-md overflow-hidden">
                        <img
                          src={newInfluenceur.imageUrl instanceof File ? URL.createObjectURL(newInfluenceur.imageUrl) : newInfluenceur.imageUrl}
                          alt="Prévisualisation"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Bouton de soumission */}
                <button
                  onClick={() => {
                    handleAddInfluenceur();
                    setIsAddingInfluenceur(false);
                  }}
                  disabled={!newInfluenceur.name || !newInfluenceur.imageUrl || !newInfluenceur.categoryId}
                  className="px-4 py-2 bg-[#28a745] text-white rounded-md hover:bg-[#218838] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Ajouter l'influenceur
                </button>
              </div>
            )}
          </div>
        )}

        {/* Filtre par catégorie */}
        <div className="mb-4">
          <label htmlFor="filterCategory" className="block text-sm font-medium text-gray-700 mb-1">
            Filtrer par catégorie
          </label>
          <select
            id="filterCategory"
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent shadow-sm"
          >
            <option value="">Toutes les catégories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>

        {/* Liste des influenceurs existants */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Votes
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {influenceurs
                .filter(influenceur => {
                  if (!selectedCategory) return true;
                  if (selectedCategory === specialCategory?.id) return influenceur.isMain;
                  return influenceur.categoryId === selectedCategory;
                })
                .sort((a, b) => {
                  if (!selectedCategory) {
                    return (b.voteCount || 0) - (a.voteCount || 0);
                  }
                  return 0;
                })
                .map((influenceur, index) => {
                  const category = categories.find(cat => cat.id === influenceur.categoryId);
                  return (
                    <tr key={influenceur.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-6 h-6 flex items-center justify-center bg-[#6C63FF] text-white text-xs font-bold rounded-full">
                          {/* Afficher le rang basé sur le tri quand "Toutes les catégories" est sélectionné */}
                          {!selectedCategory ? index + 1 : index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingInfluenceurId === influenceur.id ? (
                          <input
                            type="text"
                            value={editInfluenceur?.name || ''}
                            onChange={(e) => setEditInfluenceur(prev => prev ? { ...prev, name: e.target.value } : null)}
                            className="px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent"
                          />
                        ) : (
                          influenceur.name
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {influenceur.imageUrl && (
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                            <img
                              src={influenceur.imageUrl instanceof File ? URL.createObjectURL(influenceur.imageUrl) : influenceur.imageUrl}
                              alt={influenceur.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="max-w-[120px] truncate" title={category?.name}>
                          {category?.name || 'Non classé'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {influenceur.voteCount} votes
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingInfluenceurId === influenceur.id ? (
                          <>
                            <button
                              onClick={handleSaveEdit}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              <Save className="h-5 w-5 inline" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingInfluenceurId(null);
                                setEditInfluenceur(null);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              <X className="h-5 w-5 inline" />
                            </button>
                          </>
                        ) : (
                          <>
                            {/* <button
                              onClick={() => handleEditInfluenceur(influenceur)}
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                            >
                              <Edit className="h-5 w-5 inline" />
                            </button>
                            <button
                              onClick={() => handleDeleteInfluenceur(influenceur.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-5 w-5 inline" />
                            </button> */}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              {/* Ligne affichée si la liste des influenceurs est vide */}
              {influenceurs.filter(influenceur => {
                if (!selectedCategory) return true;
                if (selectedCategory === specialCategory?.id) return influenceur.isMain;
                return influenceur.categoryId === selectedCategory;
              }).length === 0 && !isAddingInfluenceur && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      {!selectedCategory ? "Aucun influenceur trouvé" :
                        selectedCategory === specialCategory?.id ? "Aucun influenceur principal dans cette catégorie" :
                          "Aucun influenceur dans cette catégorie"}
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

  );
};

export default AdminDashboard;