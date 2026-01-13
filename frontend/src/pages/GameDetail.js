import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { API_BASE_URL } from '../config/api';

const GameDetail = () => {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [numberOfPlayers, setNumberOfPlayers] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/games/${id}`)
      .then(response => {
        setGame(response.data.game);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching game:', error);
        setError('Failed to load game details.');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div style={{ padding: 16, textAlign: 'center' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ padding: 16, color: 'red', textAlign: 'center' }}>{error}</div>;
  }

  if (!game) {
    return <div style={{ padding: 16, textAlign: 'center' }}>Game not found.</div>;
  }

  const spotsLeft = game.maxPlayers - game.currentPlayers;
  const totalPrice = game.pricePerPlayer * numberOfPlayers;

  return (
    <div style={{ padding: 16, maxWidth: 800, margin: '0 auto' }}>
      <button
        onClick={() => navigate('/')}
        style={{
          padding: '8px 16px',
          marginBottom: 16,
          backgroundColor: '#f5f5f5',
          border: '1px solid #ccc',
          borderRadius: 4,
          cursor: 'pointer'
        }}
      >
        ← Back to Games
      </button>

      <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h1 style={{ marginTop: 0 }}>{game.title}</h1>
        <p style={{ fontSize: 16, color: '#666', margin: '8px 0' }}>
          <strong>Venue:</strong> {game.venue}
        </p>
        <p style={{ fontSize: 16, color: '#666', margin: '8px 0' }}>
          <strong>Date & Time:</strong> {new Date(game.date).toLocaleDateString()} at {game.time}
        </p>
        <p style={{ fontSize: 16, color: spotsLeft <= 3 ? '#d32f2f' : '#333', margin: '8px 0' }}>
          <strong>Available Spots:</strong> {spotsLeft} / {game.maxPlayers}
        </p>
        <p style={{ fontSize: 20, fontWeight: 'bold', color: '#2e7d32', margin: '16px 0' }}>
          ₱{game.pricePerPlayer} per player
        </p>

        {game.description && (
          <div style={{ margin: '16px 0', padding: 16, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
            <p style={{ margin: 0 }}>{game.description}</p>
          </div>
        )}

        {game.mapUrl && game.mapUrl.includes('google.com/maps') && (
          <div style={{ margin: '16px 0' }}>
            <iframe
              src={game.mapUrl}
              width="100%"
              height="300"
              style={{ border: 0, borderRadius: 4 }}
              allowFullScreen
              loading="lazy"
              title="Game location map"
            ></iframe>
          </div>
        )}

        <div style={{ margin: '24px 0' }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
            Number of Players:
          </label>
          <select
            value={numberOfPlayers}
            onChange={(e) => setNumberOfPlayers(parseInt(e.target.value))}
            style={{
              padding: '8px 12px',
              fontSize: 16,
              border: '1px solid #ccc',
              borderRadius: 4,
              width: '100%',
              maxWidth: 200
            }}
          >
            {Array.from({ length: Math.min(spotsLeft, 10) }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'player' : 'players'}
              </option>
            ))}
          </select>
          <p style={{ marginTop: 8, fontSize: 18, fontWeight: 'bold' }}>
            Total: ₱{totalPrice.toLocaleString()}
          </p>
        </div>

        <button
          style={{
            width: '100%',
            padding: 16,
            backgroundColor: game.status === 'open' && spotsLeft > 0 ? '#4CAF50' : '#ccc',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 18,
            fontWeight: 'bold',
            cursor: game.status === 'open' && spotsLeft > 0 ? 'pointer' : 'not-allowed',
            marginTop: 16
          }}
          onClick={() => game.status === 'open' && spotsLeft > 0 && navigate(`/checkout/${id}`, { state: { numberOfPlayers } })}
          disabled={game.status !== 'open' || spotsLeft === 0}
        >
          {game.status === 'open' && spotsLeft > 0
            ? `Reserve ${numberOfPlayers} spot${numberOfPlayers > 1 ? 's' : ''} for ₱${totalPrice.toLocaleString()}`
            : game.status === 'full' ? 'Game is Full' : 'Game Not Available'
          }
        </button>
      </div>
    </div>
  );
};

export default GameDetail;
