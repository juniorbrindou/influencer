const SecondVoteOffer: React.FC<{
  onAccept: () => void;
  onDecline: () => void;
}> = ({ onAccept, onDecline }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-lg font-medium mb-4">Second vote disponible</h3>
        <p className="mb-4">
          Vous avez déjà voté dans une catégorie normale. Souhaitez-vous utiliser 
          votre second vote pour la catégorie "Influenceur2lannee"?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onDecline}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            Non merci
          </button>
          <button
            onClick={() => {
              onAccept(); // Cela déclenchera setSpecialVote(true) dans VoteModal
            }}
            className="px-4 py-2 bg-[#6C63FF] text-white rounded-md"
          >
            Oui, voter à nouveau
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecondVoteOffer;
