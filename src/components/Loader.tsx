import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-[1000] space-y-4">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-yellow-500 border-r-yellow-500 animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-yellow-500 border-l-yellow-500 animate-spin-reverse"></div>
      </div>
      <p className="text-white text-lg font-medium">Veuillez patienter ...</p>
    </div>
  );
};