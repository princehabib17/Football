import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [games, setGames] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/games')
      .then(response => setGames(response.data))
      .catch(error => console.error('Error fetching games:', error));
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1>Find a game near you.</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
        {games.map(game => (
          <div key={game.id} style={{
            border: '1px solid #ccc',
            borderRadius: 8,
            padding: 16,
            backgroundColor: '#fff',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
            onClick={() => navigate(`/game/${game.id}`)}
          >
            <h2 style={{ margin: '0 0 8px 0' }}>{game.venue}</h2>
            <p>{new Date(game.time).toLocaleString()}</p>
            <p>{game.location}</p>
            <p>{game.slotsLeft} / {game.totalSlots} spots left</p>
            <p style={{ fontWeight: 'bold' }}>Reserve for AED {game.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
