import React, { useState } from 'react';
import { useVote } from '../context/VoteContext';
import { PlusCircle, Edit, Trash2, Save, X } from 'lucide-react';
import { Artist } from '../types';

const AdminDashboard: React.FC = () => {
  const { artists, votes, addArtist, removeArtist, updateArtist } = useVote();
  const [isAddingArtist, setIsAddingArtist] = useState(false);
  const [editingArtistId, setEditingArtistId] = useState<string | null>(null);
  const [newArtist, setNewArtist] = useState<Partial<Artist>>({
    name: '',
    imageUrl: ''
  });
  const [editArtist, setEditArtist] = useState<Artist | null>(null);

  // Total number of votes
  const totalVotes = artists.reduce((total, artist) => total + artist.voteCount, 0);

  const handleAddArtist = () => {
    if (!newArtist.name || !newArtist.imageUrl) return;
    
    addArtist({
      id: '',
      name: newArtist.name,
      imageUrl: newArtist.imageUrl,
      voteCount: 0
    });
    
    // Reset form
    setNewArtist({ name: '', imageUrl: '' });
    setIsAddingArtist(false);
  };

  const handleEditArtist = (artist: Artist) => {
    setEditingArtistId(artist.id);
    setEditArtist({ ...artist });
  };

  const handleSaveEdit = () => {
    if (editArtist) {
      updateArtist(editArtist);
    }
    setEditingArtistId(null);
  };

  const handleDeleteArtist = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet artiste ?')) {
      removeArtist(id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Tableau de bord</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium">Total des artistes</p>
            <p className="text-2xl font-bold">{artists.length}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium">Total des votes</p>
            <p className="text-2xl font-bold">{totalVotes}</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-600 font-medium">Utilisateurs uniques</p>
            <p className="text-2xl font-bold">{votes.length}</p>
          </div>
        </div>
      </div>
      
      {/* Artist Management */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Gestion des artistes</h2>
          
          <button
            onClick={() => setIsAddingArtist(true)}
            className="px-4 py-2 bg-[#28a745] text-white rounded-md hover:bg-[#218838] transition-colors flex items-center"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Ajouter un artiste
          </button>
        </div>
        
        {isAddingArtist && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-medium mb-3">Nouvel artiste</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="artistName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'artiste
                </label>
                <input
                  type="text"
                  id="artistName"
                  value={newArtist.name}
                  onChange={(e) => setNewArtist({ ...newArtist, name: e.target.value })}
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
                  value={newArtist.imageUrl}
                  onChange={(e) => setNewArtist({ ...newArtist, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleAddArtist}
                  className="px-4 py-2 bg-[#28a745] text-white rounded-md hover:bg-[#218838] transition-colors"
                >
                  Ajouter
                </button>
                
                <button
                  onClick={() => {
                    setIsAddingArtist(false);
                    setNewArtist({ name: '', imageUrl: '' });
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
                  Artiste
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
              {artists.map((artist) => (
                <tr key={artist.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden">
                        <img 
                          src={artist.imageUrl} 
                          alt={artist.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      
                      {editingArtistId === artist.id ? (
                        <input
                          type="text"
                          value={editArtist?.name || ''}
                          onChange={(e) => setEditArtist(prev => prev ? { ...prev, name: e.target.value } : null)}
                          className="px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent"
                        />
                      ) : (
                        <span className="font-medium text-gray-900">{artist.name}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-[#6C63FF] bg-opacity-10 text-[#6C63FF]">
                      {artist.voteCount} votes
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingArtistId === artist.id ? (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Save className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setEditingArtistId(null)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditArtist(artist)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteArtist(artist.id)}
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