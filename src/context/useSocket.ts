// useSocket.ts
import { useEffect } from 'react';
import { Socket, io } from 'socket.io-client';
import { Influenceur, Vote } from '../types';

const socket: Socket = io(import.meta.env.VITE_BACKEND_URL, {
  autoConnect: false,
});

type Callbacks = {
  setSocketConnected: (val: boolean) => void;
  setError: (val: string | null) => void;
  setInfluenceurs: React.Dispatch<React.SetStateAction<Influenceur[]>>;
  setReceivedOTP: (otp: string) => void;
  setOtpMessage: (val: string) => void;
  setIsLoading: (val: boolean) => void;
  resetSelection: () => void;
};

export const useSocket = ({
  setSocketConnected,
  setError,
  setInfluenceurs,
  setReceivedOTP,
  setOtpMessage,
  setIsLoading,
  resetSelection,
}: Callbacks) => {
  useEffect(() => {
    socket.on('connect', () => {
      console.log('✅ Connecté à Socket.IO');
      setSocketConnected(true);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Erreur Socket.IO:', error);
      setError(`Erreur de connexion: ${error.message}`);
    });

    socket.on('disconnect', () => {
      console.log('🔴 Déconnecté de Socket.IO');
      setSocketConnected(false);
    });

    socket.on('voteUpdate', ({ influenceurId, newVoteCount }) => {
      console.log('🔥 Vote mis à jour:', influenceurId);
      setInfluenceurs(prev =>
        prev.map(inf =>
          inf.id === influenceurId ? { ...inf, voteCount: newVoteCount } : inf
        )
      );
    });

    socket.on('influenceursUpdate', (data) => {
      if (data.newInfluenceur) {
        setInfluenceurs(prev => [...prev, data.newInfluenceur]);
      }

      if (data.deletedInfluenceurId) {
        setInfluenceurs(prev => prev.filter(inf => inf.id !== data.deletedInfluenceurId));
      }

      if (data.updatedInfluenceur) {
        setInfluenceurs(prev =>
          prev.map(inf =>
            inf.id === data.updatedInfluenceur.id ? data.updatedInfluenceur : inf
          )
        );
      }
    });

    socket.on('otpSent', (otp: string) => {
      setReceivedOTP(otp);
      setOtpMessage('Code de validation envoyé');
      setIsLoading(false);
    });

    socket.on('otpError', (errorMessage: string) => {
      setError(errorMessage);
      setIsLoading(false);
    });

    socket.on('voteSuccess', (vote: Vote) => {
      console.log('✅ Vote enregistré:', vote);
      setIsLoading(false);
      resetSelection();
    });

    socket.on('voteError', (errorMessage: string) => {
      setError(errorMessage);
      setIsLoading(false);
    });

    socket.on('validateSuccess', () => {
      setIsLoading(false);
      resetSelection();
    });

    socket.on('validateError', (errorMessage: string) => {
      setError(errorMessage);
      setIsLoading(false);
    });

    // On se connecte
    socket.connect();

    // Nettoyage
    return () => {
      socket.removeAllListeners();
    };
  }, [resetSelection, setError, setInfluenceurs, setIsLoading, setOtpMessage, setReceivedOTP, setSocketConnected]);
};
