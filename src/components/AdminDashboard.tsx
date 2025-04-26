import React, { useState } from 'react';
import { useVote } from '../context/VoteContext';
import { PlusCircle, Edit, Trash2, Save, X } from 'lucide-react';
import { Influenceur } from '../types';

const AdminDashboard: React.FC = () => {
  const { listInfluenceur: influenceurs, votes, addInfluenceur: addInfluenceur, removeInfluenceur: removeInfluenceur, updateInfluenceur: updateInfluenceur } = useVote();
  const [isAddingInfluenceur, setIsAddingInfluenceur] = useState(false);
  const [editingInfluenceurId, setEditingInfluenceurId] = useState<string | null>(null);
  const [newInfluenceur, setNewInfluenceur] = useState<Partial<Influenceur>>({
    name: '',
    imageUrl: ''
  });
  const [editInfluenceur, setEditInfluenceur] = useState<Influenceur | null>(null);

  // Total number of votes
  const totalVotes = influenceurs.reduce((total, influenceur) => total + influenceur.voteCount, 0);

  const handleAddInfluenceur = () => {
    if (!newInfluenceur.name || !newInfluenceur.imageUrl) return;

    addInfluenceur({
      id: '',
      name: newInfluenceur.name,
      imageUrl: newInfluenceur.imageUrl,
      voteCount: 0
    });

    // Reset form
    setNewInfluenceur({ name: '', imageUrl: '' });
    setIsAddingInfluenceur(false);
  };

  const handleEditInfluenceur = (influenceur: Influenceur) => {
    setEditingInfluenceurId(influenceur.id);
    setEditInfluenceur({ ...influenceur });
  };

  const handleSaveEdit = () => {
    if (editInfluenceur) {
      updateInfluenceur(editInfluenceur);
    }
    setEditingInfluenceurId(null);
  };

  const handleDeleteInfluenceur = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir retirer cet influenceur de la course ?')) {
      removeInfluenceur(id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Tableau de bord</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium">Total des influenceurs</p>
            <p className="text-2xl font-bold">{influenceurs.length}</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium">Total des votes</p>
            <p className="text-2xl font-bold">{totalVotes}</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-600 font-medium">Autre stat</p>
            <p className="text-2xl font-bold">{votes.length}</p>
          </div>
        </div>
      </div>

      {/* Influenceur Management */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Gestion des influenceurs</h2>

          <button
            onClick={() => setIsAddingInfluenceur(true)}
            className="px-4 py-2 bg-[#28a745] text-white rounded-md hover:bg-[#218838] transition-colors flex items-center"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Ajouter un Influenceur
          </button>
        </div>

        {isAddingInfluenceur && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-medium mb-3">Nouvel Influenceur</h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="artistName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'influenceur
                </label>
                <input
                  type="text"
                  id="artistName"
                  value={newInfluenceur.name}
                  onChange={(e) => setNewInfluenceur({ ...newInfluenceur, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="artistImage" className="block text-sm font-medium text-gray-700 mb-1">
                  URL de l'image
                </label>
                <input
                  type="text"
                  id="artistImage"
                  value={newInfluenceur.imageUrl}
                  onChange={(e) => setNewInfluenceur({ ...newInfluenceur, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleAddInfluenceur}
                  className="px-4 py-2 bg-[#28a745] text-white rounded-md hover:bg-[#218838] transition-colors"
                >
                  Ajouter
                </button>

                <button
                  onClick={() => {
                    setIsAddingInfluenceur(false);
                    setNewInfluenceur({ name: '', imageUrl: '' });
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Influenceur
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Votes
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {influenceurs.map((influenceur) => (
                <tr key={influenceur.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden">
                        <img
                          src={influenceur.imageUrl}
                          alt={influenceur.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-[#6C63FF] bg-opacity-10 text-[#6C63FF]">
                      {influenceur.voteCount} votes
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingInfluenceurId === influenceur.id ? (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Save className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setEditingInfluenceurId(null)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditInfluenceur(influenceur)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteInfluenceur(influenceur.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;