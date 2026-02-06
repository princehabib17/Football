import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/* ---------- tiny helpers ---------- */

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });
};

const Badge = ({ children, variant = 'default' }) => {
  const styles = {
    open: { background: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9' },
    urgent: { background: '#fff3e0', color: '#e65100', border: '1px solid #ffe0b2' },
    full: { background: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2' },
    default: { background: '#f5f5f5', color: '#616161', border: '1px solid #e0e0e0' },
  };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 10px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: '0.02em',
      ...styles[variant],
    }}>
      {children}
    </span>
  );
};

/* ---------- skeleton loader ---------- */

const SkeletonCard = () => (
  <div style={{
    borderRadius: 16,
    padding: 24,
    background: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  }}>
    <div style={{ height: 14, width: '50%', borderRadius: 6, background: 'linear-gradient(90deg,#eee 25%,#f5f5f5 50%,#eee 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
    <div style={{ height: 20, width: '80%', borderRadius: 6, marginTop: 12, background: 'linear-gradient(90deg,#eee 25%,#f5f5f5 50%,#eee 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
    <div style={{ height: 14, width: '60%', borderRadius: 6, marginTop: 12, background: 'linear-gradient(90deg,#eee 25%,#f5f5f5 50%,#eee 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
      <div style={{ height: 28, width: 80, borderRadius: 20, background: 'linear-gradient(90deg,#eee 25%,#f5f5f5 50%,#eee 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ height: 28, width: 60, borderRadius: 20, background: 'linear-gradient(90deg,#eee 25%,#f5f5f5 50%,#eee 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
    </div>
    <div style={{ height: 22, width: '40%', borderRadius: 6, marginTop: 16, background: 'linear-gradient(90deg,#eee 25%,#f5f5f5 50%,#eee 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
  </div>
);

/* ---------- game card ---------- */

const GameCard = ({ game, index, onClick }) => {
  const spotsLeft = game.maxPlayers - game.currentPlayers;
  const spotsPercent = (game.currentPlayers / game.maxPlayers) * 100;
  const isAlmostFull = spotsLeft <= 3;

  return (
    <div
      className={`animate-fade-in-up stagger-${Math.min(index + 1, 8)}`}
      style={{
        borderRadius: 16,
        padding: 0,
        backgroundColor: '#fff',
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.04)',
        opacity: 0,
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)';
        e.currentTarget.style.borderColor = 'rgba(76,175,80,0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.04)';
      }}
    >
      {/* Top accent bar */}
      <div style={{
        height: 4,
        background: isAlmostFull
          ? 'linear-gradient(90deg, #ff6f00, #ff9800)'
          : 'linear-gradient(90deg, #1b5e20, #4caf50)',
      }} />

      <div style={{ padding: '20px 24px 24px' }}>
        {/* Date & Time row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 10,
          fontSize: 13,
          color: '#5f6368',
          fontWeight: 500,
        }}>
          <span>{formatDate(game.date)}</span>
          <span style={{ color: '#ccc' }}>|</span>
          <span>{game.time}</span>
        </div>

        {/* Title */}
        <h3 style={{
          margin: '0 0 6px 0',
          fontSize: 18,
          fontWeight: 700,
          color: '#1a1a2e',
          lineHeight: 1.3,
        }}>
          {game.title}
        </h3>

        {/* Venue */}
        <p style={{
          margin: '0 0 16px 0',
          color: '#5f6368',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span style={{ fontSize: 15 }}>&#128205;</span>
          {game.venue}
        </p>

        {/* Badges */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          <Badge variant={isAlmostFull ? 'urgent' : 'open'}>
            {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
          </Badge>
          <Badge>{game.maxPlayers} players max</Badge>
        </div>

        {/* Progress bar */}
        <div style={{
          height: 6,
          borderRadius: 3,
          backgroundColor: '#f0f0f0',
          marginBottom: 16,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            borderRadius: 3,
            width: `${spotsPercent}%`,
            background: isAlmostFull
              ? 'linear-gradient(90deg, #ff6f00, #ff9800)'
              : 'linear-gradient(90deg, #1b5e20, #4caf50)',
            transition: 'width 0.6s ease',
          }} />
        </div>

        {/* Price */}
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
        }}>
          <div>
            <span style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#1b5e20',
            }}>
              &#x20B1;{game.pricePerPlayer}
            </span>
            <span style={{ fontSize: 13, color: '#9e9e9e', marginLeft: 4 }}>/player</span>
          </div>
          <span style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#4caf50',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            View &rarr;
          </span>
        </div>
      </div>
    </div>
  );
};

/* ---------- main component ---------- */

const Home = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/api/games?status=open`)
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

  return (
    <div style={{ minHeight: '70vh' }}>
      {/* Hero section */}
      <div style={{
        background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 40%, #388e3c 70%, #43a047 100%)',
        padding: '48px 24px 56px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />
        <div style={{
          position: 'absolute', bottom: -40, left: '20%',
          width: 120, height: 120, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h1 style={{
            color: '#fff',
            fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
            fontWeight: 800,
            marginBottom: 12,
            lineHeight: 1.2,
            letterSpacing: '-0.5px',
          }}>
            Find a game near you.
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: 'clamp(1rem, 2vw, 1.15rem)',
            maxWidth: 520,
            lineHeight: 1.6,
          }}>
            Book your spot in local football matches across the Philippines. No account required &mdash; just pick a game and play.
          </p>
          {!loading && !error && (
            <div style={{
              marginTop: 20,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(4px)',
              padding: '8px 16px',
              borderRadius: 24,
              fontSize: 14,
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 500,
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                backgroundColor: '#69f0ae',
                display: 'inline-block',
              }} />
              {games.length} game{games.length !== 1 ? 's' : ''} available
            </div>
          )}
        </div>
      </div>

      {/* Games grid */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '32px 24px 48px',
      }}>
        {loading && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20,
          }}>
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {error && (
          <div className="animate-fade-in" style={{
            textAlign: 'center',
            padding: '48px 24px',
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>&#9888;&#65039;</div>
            <p style={{ color: '#c62828', fontSize: 16, fontWeight: 500 }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: 16,
                padding: '10px 24px',
                background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && games.length === 0 && (
          <div className="animate-fade-in" style={{
            textAlign: 'center',
            padding: '64px 24px',
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>&#9917;</div>
            <h3 style={{ marginBottom: 8, color: '#1a1a2e' }}>No games available right now</h3>
            <p style={{ color: '#5f6368', maxWidth: 400, margin: '0 auto' }}>
              Check back soon &mdash; new games are posted regularly!
            </p>
          </div>
        )}

        {!loading && !error && games.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20,
          }}>
            {games.map((game, index) => (
              <GameCard
                key={game._id}
                game={game}
                index={index}
                onClick={() => navigate(`/game/${game._id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
