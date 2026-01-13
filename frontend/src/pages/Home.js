import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { API_BASE_URL } from '../config/api';

const Home = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/games?status=open`)
      .then(response => {
        setGames(response.data.games || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching games:', error);
        setError('Failed to load games. Please try again later.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ padding: 16, textAlign: 'center' }}>Loading games...</div>;
  }

  if (error) {
    return <div style={{ padding: 16, color: 'red', textAlign: 'center' }}>{error}</div>;
  }

  return (
    <div style={{ padding: 16, maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 24 }}>Find a game near you.</h1>
      {games.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>No games available at the moment.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
          {games.map(game => {
            const spotsLeft = game.maxPlayers - game.currentPlayers;
            return (
              <div key={game._id} style={{
                border: '1px solid #ccc',
                borderRadius: 8,
                padding: 16,
                backgroundColor: '#fff',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s',
              }}
                onClick={() => navigate(`/game/${game._id}`)}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <h2 style={{ margin: '0 0 8px 0', fontSize: 18 }}>{game.title}</h2>
                <p style={{ margin: '4px 0', color: '#666' }}>{game.venue}</p>
                <p style={{ margin: '4px 0', color: '#666' }}>
                  {new Date(game.date).toLocaleDateString()} at {game.time}
                </p>
                <p style={{ margin: '8px 0', color: spotsLeft <= 3 ? '#d32f2f' : '#333' }}>
                  {spotsLeft} / {game.maxPlayers} spots left
                </p>
                <p style={{ fontWeight: 'bold', margin: '8px 0 0 0', fontSize: 16, color: '#2e7d32' }}>
                  ₱{game.pricePerPlayer} / player
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Home;
