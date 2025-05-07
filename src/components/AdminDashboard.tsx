import React, { useEffect, useState } from 'react';
import { PlusCircle, Edit, Trash2, Save, X } from 'lucide-react';
import { Category, Influenceur } from '../types';
import { useVote } from '../context/useVote';

/**
 * Composant AdminDashboard pour gérer les influenceurs et afficher les statistiques de vote.
 */
const AdminDashboard: React.FC = () => {
  // Extrait les données et fonctions nécessaires du contexte VoteContext
  const { listInfluenceur: influenceurs, votes, addInfluenceur, removeInfluenceur, updateInfluenceur } = useVote();

  const [isAddingInfluenceur, setIsAddingInfluenceur] = useState(false);
  const [editingInfluenceurId, setEditingInfluenceurId] = useState<string | null>(null);
  const [newInfluenceur, setNewInfluenceur] = useState<Partial<Influenceur>>({
    name: '',
    imageUrl: ''
  });
  // État pour stocker les données de l'influenceur en cours d'édition
  const [editInfluenceur, setEditInfluenceur] = useState<Influenceur | null>(null);

  // Calcule le nombre total de votes en additionnant les voteCount de tous les influenceurs
  const totalVotes = influenceurs.reduce((total, influenceur) => total + influenceur.voteCount, 0);

  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState<Partial<Category> | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState<Category | null>(null);



  useEffect(() => {
    const fetchCategories = async () => {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    };
    fetchCategories();
  }, []);


  // Ajoutez ces fonctions pour gérer les catégories
  const handleAddCategory = async () => {
    if (!newCategory!.name) return;

    const formData = new FormData();
    formData.append('name', newCategory!.name);
    if (newCategory!.imageUrl) {
      formData.append('image', newCategory!.imageUrl);
    }

    const response = await fetch('/api/categories', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    setCategories([...categories, data]);
    setNewCategory({ name: '', imageUrl: '', id: '' });
  };

  const handleDeleteCategory = async (id: string) => {
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditCategory({ ...category });
  };

  const handleSaveEditCategory = async () => {
    if (!editCategory) return;

    const formData = new FormData();
    formData.append('name', editCategory.name);
    if (editCategory!.imageUrl instanceof File) {
      formData.append('image', editCategory.imageUrl);
    }

    const response = await fetch(`/api/categories/${editCategory.id}`, {
      method: 'PUT',
      body: formData,
    });
    const updatedCategory = await response.json();
    setCategories(categories.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat));
    setEditingCategoryId(null);
    setEditCategory(null);
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
  const handleAddInfluenceur = () => {
    // Vérification simple : si le nom ou l'imageUrl est vide, on ne fait rien
    if (!newInfluenceur.name || !newInfluenceur.imageUrl) return;

    // Appelle la fonction pour ajouter l'influenceur via le contexte
    addInfluenceur({
      id: '',
      name: newInfluenceur.name,
      imageUrl: newInfluenceur.imageUrl,
      voteCount: 0,
      categoryId: ''
    });

    // Réinitialise les champs du formulaire d'ajout
    setNewInfluenceur({ name: '', imageUrl: '' });
    // Masque le formulaire d'ajout
    setIsAddingInfluenceur(false);
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
            <p className="text-2xl font-bold">{totalVotes}</p>
          </div>

          {/* Carte : Autre statistique (nombre d'enregistrements de votes individuels) */}
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-600 font-medium">Nb. Votes Enregistrés</p> {/* Libellé plus clair */}
            <p className="text-2xl font-bold">{votes.length}</p>
          </div>
        </div>
      </div>









        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Gestion des catégories</h2>

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
              className="w-full"
            />
          </div>

          <button
            onClick={handleAddCategory}
            disabled={!newCategory || !newCategory.name}
            className="px-4 py-2 bg-[#28a745] text-white rounded-md hover:bg-[#218838] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Ajouter une catégorie
          </button>

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
      <div className="bg-white rounded-lg shadow-md p-6">





        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4"> {/* Responsive flex */}
          <h2 className="text-xl font-semibold text-gray-800">Gestion des influenceurs</h2>

          {/* Bouton pour afficher le formulaire d'ajout */}
          <button
            onClick={() => setIsAddingInfluenceur(true)}
            className="w-full sm:w-auto px-4 py-2 bg-[#28a745] text-white rounded-md hover:bg-[#218838] transition-colors flex items-center justify-center" // Centrer sur mobile
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Ajouter un Influenceur
          </button>
        </div>

        {/* Formulaire d'ajout d'influenceur (conditionnel) */}
        {isAddingInfluenceur && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50"> {/* Fond léger pour distinction */}
            <h3 className="text-lg font-medium mb-3 text-gray-700">Nouvel Influenceur</h3>

            <div className="space-y-4">
              {/* Champ : Nom de l'influenceur */}
              <div>
                <label htmlFor="influenceurNameAdd" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'influenceur
                </label>
                <input
                  type="text"
                  id="influenceurNameAdd" // ID unique
                  value={newInfluenceur.name}
                  onChange={(e) => setNewInfluenceur({ ...newInfluenceur, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent shadow-sm" // Style amélioré
                  placeholder="ex: Jean Dupont"
                />
              </div>

              {/* Champ : URL de l'image */}
              <div>
                <label htmlFor="influenceurImageAdd" className="block text-sm font-medium text-gray-700 mb-1">
                  URL de l'image
                </label>
                <input
                  type="text"
                  id="influenceurImageAdd" // ID unique
                  value={newInfluenceur.imageUrl}
                  onChange={(e) => setNewInfluenceur({ ...newInfluenceur, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent shadow-sm" // Style amélioré
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Boutons d'action pour le formulaire d'ajout */}
              <div className="flex space-x-2 pt-2"> {/* Ajout de padding top */}
                <button
                  onClick={handleAddInfluenceur}
                  disabled={!newInfluenceur.name || !newInfluenceur.imageUrl} // Désactiver si champs vides
                  className="px-4 py-2 bg-[#28a745] text-white rounded-md hover:bg-[#218838] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Ajouter
                </button>

                <button
                  onClick={() => {
                    setIsAddingInfluenceur(false); // Masque le formulaire
                    setNewInfluenceur({ name: '', imageUrl: '' }); // Réinitialise les champs
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}



        {/* categories */}
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




        {/* Tableau listant les influenceurs */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* En-tête : Colonne Influenceur (Nom et Image) */}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Influenceur
                </th>
                {/* NOUVEAU: En-tête : Colonne URL Image (visible seulement en édition) */}
                {editingInfluenceurId && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL Image
                  </th>
                )}
                {/* En-tête : Colonne Votes */}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Votes
                </th>
                {/* En-tête : Colonne Actions */}
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {influenceurs.map((influenceur) => (
                <tr key={influenceur.id} className={`${editingInfluenceurId === influenceur.id ? 'bg-yellow-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                        <img
                          src={influenceur.imageUrl}
                          alt={influenceur.name}
                          className="h-full w-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = "/fallback.png" as string; }}
                        />
                      </div>
                      <div>
                        {editingInfluenceurId === influenceur.id ? (
                          <input
                            type="text"
                            value={editInfluenceur?.name || ''}
                            onChange={(e) => setEditInfluenceur(prev => prev ? { ...prev, name: e.target.value } : null)}
                            className="px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent"
                          />
                        ) : (
                          <span className="font-medium text-gray-900">{influenceur.name}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  {editingInfluenceurId === influenceur.id && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={editInfluenceur?.imageUrl || ''}
                        onChange={(e) => setEditInfluenceur(prev => prev ? { ...prev, imageUrl: e.target.value } : null)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent"
                        placeholder="URL de l'image"
                      />
                    </td>
                  )}
                  {editingInfluenceurId !== null && editingInfluenceurId !== influenceur.id && (
                    <td className="px-6 py-4 whitespace-nowrap"></td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${influenceur.voteCount > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {influenceur.voteCount} vote{influenceur.voteCount !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingInfluenceurId === influenceur.id ? (
                      <div className="flex justify-end items-center space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100 transition-colors"
                          title="Sauvegarder"
                        >
                          <Save className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingInfluenceurId(null);
                            setEditInfluenceur(null);
                          }}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 transition-colors"
                          title="Annuler"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end items-center space-x-2">
                        <button
                          onClick={() => handleEditInfluenceur(influenceur)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-100 transition-colors" // Style amélioré
                          title="Modifier"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteInfluenceur(influenceur.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 transition-colors"
                          title="Supprimer">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {/* Ligne affichée si la liste des influenceurs est vide */}
              {influenceurs.length === 0 && !isAddingInfluenceur && (
                <tr>
                  <td colSpan={editingInfluenceurId ? 4 : 3} className="px-6 py-4 text-center text-gray-500"> {/* Ajuste colSpan dynamiquement */}
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