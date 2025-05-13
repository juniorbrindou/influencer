import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrismaClient } from '@prisma/client';
import { Vote } from '../types';

const prisma = new PrismaClient();

const VotesPage: React.FC = () => {
	const [votes, setVotes] = useState<Vote[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		fetchVotes();
	}, []);

	const fetchVotes = async () => {
		try {
			setIsLoading(true);
			const response = await fetch('/api/votes');
			if (!response.ok) throw new Error('Erreur de chargement');
			const data = await response.json();
			setVotes(data);
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setIsLoading(false);
		}
	};

	const deleteVote = async (voteId: string) => {
		try {
			const response = await fetch(`/api/votes/${voteId}`, {
				method: 'DELETE',
			});

			if (!response.ok) throw new Error('Échec de suppression');

			setVotes(votes.filter(vote => vote.id !== voteId));
		} catch (err) {
			setError((err as Error).message);
		}
	};

	if (isLoading) return <div>Chargement...</div>;
	if (error) return <div>Erreur: {error}</div>;

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-2xl font-bold mb-6">Gestion des Votes</h1>

			<div className="bg-white shadow-md rounded-lg overflow-hidden">
				<table className="min-w-full">
					<thead className="bg-gray-100">
						<tr>
							<th className="px-6 py-3 text-left">ID</th>
							<th className="px-6 py-3 text-left">Influenceur</th>
							<th className="px-6 py-3 text-left">Téléphone</th>
							<th className="px-6 py-3 text-left">Date</th>
							<th className="px-6 py-3 text-left">Spécial</th>
							<th className="px-6 py-3 text-left">Actions</th>
						</tr>
					</thead>
					<tbody>
						{votes.map((vote) => (
							<tr key={vote.id} className="border-b hover:bg-gray-50">
								<td className="px-6 py-4">{vote.id}</td>
								<td className="px-6 py-4">{vote.phoneNumber}</td>
								<td className="px-6 py-4">{vote.isSpecial ? 'Oui' : 'Non'}</td>
								<td className="px-6 py-4">
									<button
										onClick={() => deleteVote(vote.id)}
										className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
									>
										Supprimer
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default VotesPage;