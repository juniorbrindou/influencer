import React, { createContext, useState, useContext, useEffect } from 'react';
import { Artist, Vote } from '../types';
import { initialArtists } from '../data/artists';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface VoteContextType {
  artists: Artist[];
  votes: Vote[];
  selectedArtist: Artist | null;
  phoneNumber: string;
  setPhoneNumber: (number: string) => void;
  selectArtist: (artist: Artist) => void;
  submitVote: (phone: string) => void;
  hasVoted: (phone: string) => boolean;
  resetSelection: () => void;
  addArtist: (artist: Artist) => void;
  removeArtist: (id: string) => void;
  updateArtist: (artist: Artist) => void;
}

const VoteContext = createContext<VoteContextType | undefined>(undefined);

export const VoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [artists, setArtists] = useLocalStorage<Artist[]>('artists', initialArtists);
  const [votes, setVotes] = useLocalStorage<Vote[]>('votes', []);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  const selectArtist = (artist: Artist) => {
    setSelectedArtist(artist);
  };

  const resetSelection = () => {
    setSelectedArtist(null);
    setPhoneNumber('');
  };

  const hasVoted = (phone: string): boolean => {
    return votes.some(vote => vote.phoneNumber === phone);
  };

  const submitVote = (phone: string) => {
    if (!selectedArtist || hasVoted(phone)) return;
    
    // Add the vote to the votes array
    const newVote: Vote = {
      artistId: selectedArtist.id,
      phoneNumber: phone,
      timestamp: Date.now()
    };
    setVotes([...votes, newVote]);
    
    // Update the artist's vote count
    setArtists(prevArtists =>
      prevArtists.map(artist =>
        artist.id === selectedArtist.id
          ? { ...artist, voteCount: artist.voteCount + 1 }
          : artist
      )
    );
  };

  const addArtist = (artist: Artist) => {
    setArtists([...artists, { ...artist, id: String(Date.now()), voteCount: 0 }]);
  };

  const removeArtist = (id: string) => {
    setArtists(artists.filter(artist => artist.id !== id));
  };

  const updateArtist = (updatedArtist: Artist) => {
    setArtists(artists.map(artist => 
      artist.id === updatedArtist.id ? updatedArtist : artist
    ));
  };

  return (
    <VoteContext.Provider
      value={{
        artists,
        votes,
        selectedArtist,
        phoneNumber,
        setPhoneNumber,
        selectArtist,
        submitVote,
        hasVoted,
        resetSelection,
        addArtist,
        removeArtist,
        updateArtist
      }}
    >
      {children}
    </VoteContext.Provider>
  );
};

export const useVote = () => {
  const context = useContext(VoteContext);
  if (context === undefined) {
    throw new Error('useVote must be used within a VoteProvider');
  }
  return context;
};