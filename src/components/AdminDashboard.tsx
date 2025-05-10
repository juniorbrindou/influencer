import React, { useEffect, useState } from 'react';
import { PlusCircle, Edit, Trash2, Save, X } from 'lucide-react';
import { Category, Influenceur } from '../types';
import { useVote } from '../context/useVote';
import { useCategoryManager } from '../context/useCartegoryManager';
import { ExclamationTriangleIcon } from '@heroicons/react/16/solid';

/**
 * Composant AdminDashboard pour gérer les influenceurs et afficher les statistiques de vote.
 */
const AdminDashboard: React.FC = () => {
  // Extrait les données et fonctions nécessaires du contexte VoteContext
  const { listInfluenceur: influenceurs, votes, addInfluenceur, removeInfluenceur, updateInfluenceur } = useVote();

  const [isAddingInfluenceur, setIsAddingInfluenceur] = useState(false);
  const [editingInfluenceurId, setEditingInfluenceurId] = useState<string | null>(null);
  const [newInfluenceur, setNewInfluenceur] = useState<Partial<Influenceur & { imageUrl: string | File | undefined }>>({
    name: '',
    imageUrl: undefined
  });
  // État pour stocker les données de l'influenceur en cours d'édition
  const [editInfluenceur, setEditInfluenceur] = useState<Influenceur | null>(null);


  const totalVotes = influenceurs.reduce((total, influenceur) => {
    // Convertir voteCount en nombre au cas où ce serait une string
    const votes = Number(influenceur.voteCount) || 0;
    return total + votes;
  }, 0);

  // const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState<Partial<Category> | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const { categories, addCategory, removeCategory, updateCategory, isLoading: isCategoryLoading, error: categoryError } = useCategoryManager();


  // Ajoutez ces fonctions pour gérer les catégories
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


  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    // Remplacez BACKEND_URL par l'URL de votre backend
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    try {
      const response = await fetch(`${BACKEND_URL}/api/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Échec du téléchargement de l\'image');
      }

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      throw error;
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
      if (newInfluenceur.imageUrl) {
        imageUrl = await uploadImage(newInfluenceur.imageUrl as File);
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
    <div className="space-y-8 p-4 md:p-6 lg:p-8"> {/* Ajout de padding pour l'espacement général */}

      {/* Section En-tête du Tableau de Bord */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Tableau de bord</h2>

        {/* Grille pour afficher les statistiques clés */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Carte : Total des influenceurs */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium">Total des influenceurs</p>
            <p className="text-2xl font-bold">{influenceurs.length}</p>
          </div>

          {/* Carte : Total des votes */}
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium">Total des votes</p>
            <p className="text-2xl font-bold">{isNaN(totalVotes) ? 0 : totalVotes}</p>
          </div>

          {/* Carte : Autre statistique (nombre d'enregistrements de votes individuels) */}
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-600 font-medium">Nb. Votes Enregistrés</p> {/* Libellé plus clair */}
            <p className="text-2xl font-bold">{votes.length}</p>
          </div>
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

        {/* Liste des catégories existantes */}
        <div className="space-y-2 mt-4">
          {categories.map(category => (
            <div key={category.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
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
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-100 transition-colors"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
            disabled={!selectedCategory}
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
                .filter(influenceur => !selectedCategory || influenceur.categoryId === selectedCategory)
                .map((influenceur) => {
                  const category = categories.find(cat => cat.id === influenceur.categoryId);
                  return (
                    <tr key={influenceur.id}>
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
                            <button
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
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              {/* Ligne affichée si la liste des influenceurs est vide */}
              {influenceurs.length === 0 && !isAddingInfluenceur && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Aucun influenceur à afficher. Cliquez sur "Ajouter un Influenceur" pour commencer.
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