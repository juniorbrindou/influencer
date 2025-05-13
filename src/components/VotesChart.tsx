import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { Socket } from 'socket.io-client';
import { Vote } from '../types';

Chart.register(...registerables);

interface VotesChartProps {
  votes: Vote[];
  socket: Socket;
}

const VotesChart: React.FC<VotesChartProps> = ({ votes, socket }) => {
  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Préparer les données par jour
  const processData = () => {
    const dailyVotes: Record<string, number> = {};

    votes.forEach(vote => {
      const date = new Date(vote.timestamp || Date.now()).toLocaleDateString();
      dailyVotes[date] = (dailyVotes[date] || 0) + 1;
    });

    const labels = Object.keys(dailyVotes).sort();
    const data = labels.map(date => dailyVotes[date]);

    return { labels, data };
  };

  // Initialiser le graphique
  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const { labels, data } = processData();

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Votes par jour',
          data,
          backgroundColor: '#6C63FF',
          borderColor: '#4A42D6',
          borderWidth: 1,
        }]
      },
      options: {
        responsive: true,
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Nombre de votes' }
          },
          x: {
            title: { display: true, text: 'Date' }
          }
        }
      }
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, []);

  // Mettre à jour le graphique en temps réel via Socket.IO
  useEffect(() => {
    const handleNewVote = (newVote: Vote) => {
      if (!chartRef.current) return;

      const date = new Date(newVote.timestamp || Date.now()).toLocaleDateString();
      const chart = chartRef.current;

      // Trouver l'index du jour ou l'ajouter
      const labelIndex = chart.data.labels?.indexOf(date) ?? -1;
      if (labelIndex >= 0) {
        const currentValue = Number(chart.data.datasets?.[0]?.data?.[labelIndex] || 0);
        chart.data.datasets[0].data[labelIndex] = currentValue + 1;
      } else {
        chart.data.labels?.push(date);
        chart.data.datasets[0].data.push(1);
      }

      chart.update();
    };

    socket.on('voteUpdate', handleNewVote);
    return () => { socket.off('voteUpdate', handleNewVote); };
  }, [socket]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Activité des votes (temps réel)</h3>
      <canvas ref={canvasRef} height="300" />
    </div>
  );
};

export default VotesChart;