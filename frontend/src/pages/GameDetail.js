import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const GameDetail = () => {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:5000/api/games/${id}`)
      .then(response => setGame(response.data))
      .catch(error => console.error('Error fetching game:', error));
  }, [id]);

  if (!game) return <div>Loading...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1>{game.venue}</h1>
      <p>{new Date(game.time).toLocaleString()}</p>
      <p>{game.location}</p>
      <p>{game.slotsLeft} / {game.totalSlots} spots left</p>
      <p>{game.description}</p>
      <iframe src={game.mapUrl} width="100%" height="300" style={{ border: 0 }} allowFullScreen></iframe>
      <button
        style={{
          width: '100%',
          padding: 16,
          backgroundColor: '#4CAF50',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 18,
          marginTop: 16
        }}
        onClick={() => navigate(`/checkout/${id}`)}
      >
        Reserve for AED {game.price}
      </button>
    </div>
  );
};

export default GameDetail;
