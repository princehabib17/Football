import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

/* ---------- skeleton ---------- */
const DetailSkeleton = () => (
  <div style={{ padding: '32px 24px', maxWidth: 800, margin: '0 auto' }}>
    <div style={{ height: 16, width: 120, borderRadius: 8, background: 'linear-gradient(90deg,#eee 25%,#f5f5f5 50%,#eee 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', marginBottom: 24 }} />
    <div style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div style={{ height: 32, width: '60%', borderRadius: 8, background: 'linear-gradient(90deg,#eee 25%,#f5f5f5 50%,#eee 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', marginBottom: 24 }} />
      {[1,2,3,4].map(i => (
        <div key={i} style={{ height: 18, width: `${70 - i*10}%`, borderRadius: 6, background: 'linear-gradient(90deg,#eee 25%,#f5f5f5 50%,#eee 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', marginBottom: 16 }} />
      ))}
      <div style={{ height: 56, width: '100%', borderRadius: 12, background: 'linear-gradient(90deg,#eee 25%,#f5f5f5 50%,#eee 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', marginTop: 32 }} />
    </div>
  </div>
);

const GameDetail = () => {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [numberOfPlayers, setNumberOfPlayers] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/api/games/${id}`)
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

  if (loading) return <DetailSkeleton />;

  if (error) {
    return (
      <div className="animate-fade-in" style={{ padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>&#9888;&#65039;</div>
        <p style={{ color: '#c62828', fontSize: 16, fontWeight: 500, marginBottom: 16 }}>{error}</p>
        <button
          onClick={() => navigate('/')}
          style={{
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
          Back to Games
        </button>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="animate-fade-in" style={{ padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>&#9917;</div>
        <h3 style={{ marginBottom: 8 }}>Game not found</h3>
        <button
          onClick={() => navigate('/')}
          style={{
            marginTop: 12,
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
          Browse Games
        </button>
      </div>
    );
  }

  const spotsLeft = game.maxPlayers - game.currentPlayers;
  const totalPrice = game.pricePerPlayer * numberOfPlayers;
  const spotsPercent = (game.currentPlayers / game.maxPlayers) * 100;
  const isAlmostFull = spotsLeft <= 3;

  return (
    <div className="animate-fade-in" style={{
      padding: '32px 24px 48px',
      maxWidth: 800,
      margin: '0 auto',
    }}>
      {/* Breadcrumb / Back */}
      <button
        onClick={() => navigate('/')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '10px 18px',
          marginBottom: 24,
          backgroundColor: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: 10,
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 500,
          color: '#5f6368',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#4caf50';
          e.currentTarget.style.color = '#1b5e20';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#e0e0e0';
          e.currentTarget.style.color = '#5f6368';
        }}
      >
        &larr; All Games
      </button>

      {/* Main card */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.04)',
      }}>
        {/* Header accent */}
        <div style={{
          background: isAlmostFull
            ? 'linear-gradient(135deg, #e65100, #ff9800)'
            : 'linear-gradient(135deg, #1b5e20, #4caf50)',
          padding: '28px 32px',
          color: '#fff',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8,
            fontSize: 14,
            opacity: 0.9,
          }}>
            <span>{formatDate(game.date)}</span>
            <span style={{ opacity: 0.5 }}>|</span>
            <span>{game.time}</span>
          </div>
          <h1 style={{
            margin: 0,
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.2,
          }}>
            {game.title}
          </h1>
        </div>

        <div style={{ padding: '28px 32px 32px' }}>
          {/* Info grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
            marginBottom: 24,
          }}>
            <div style={{
              padding: 16,
              background: '#f8f9fa',
              borderRadius: 12,
              border: '1px solid #eee',
            }}>
              <div style={{ fontSize: 13, color: '#9e9e9e', fontWeight: 500, marginBottom: 4 }}>Venue</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 16 }}>&#128205;</span>
                {game.venue}
              </div>
            </div>

            <div style={{
              padding: 16,
              background: '#f8f9fa',
              borderRadius: 12,
              border: '1px solid #eee',
            }}>
              <div style={{ fontSize: 13, color: '#9e9e9e', fontWeight: 500, marginBottom: 4 }}>Available Spots</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: isAlmostFull ? '#e65100' : '#1a1a2e' }}>
                {spotsLeft} of {game.maxPlayers} remaining
              </div>
            </div>

            <div style={{
              padding: 16,
              background: '#e8f5e9',
              borderRadius: 12,
              border: '1px solid #c8e6c9',
            }}>
              <div style={{ fontSize: 13, color: '#2e7d32', fontWeight: 500, marginBottom: 4 }}>Price</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1b5e20' }}>
                &#x20B1;{game.pricePerPlayer} <span style={{ fontSize: 13, fontWeight: 500 }}>/ player</span>
              </div>
            </div>
          </div>

          {/* Spots progress bar */}
          <div style={{ marginBottom: 24 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 6,
              fontSize: 13,
              color: '#9e9e9e',
            }}>
              <span>{game.currentPlayers} joined</span>
              <span>{game.maxPlayers} max</span>
            </div>
            <div style={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#f0f0f0',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                borderRadius: 4,
                width: `${spotsPercent}%`,
                background: isAlmostFull
                  ? 'linear-gradient(90deg, #ff6f00, #ff9800)'
                  : 'linear-gradient(90deg, #1b5e20, #4caf50)',
                transition: 'width 0.8s ease',
              }} />
            </div>
          </div>

          {/* Description */}
          {game.description && (
            <div style={{
              margin: '0 0 24px 0',
              padding: 20,
              backgroundColor: '#fafafa',
              borderRadius: 12,
              border: '1px solid #eee',
              lineHeight: 1.7,
              fontSize: 15,
              color: '#424242',
            }}>
              {game.description}
            </div>
          )}

          {/* Map */}
          {game.mapUrl && game.mapUrl.includes('google.com/maps') && (
            <div style={{
              margin: '0 0 24px 0',
              borderRadius: 12,
              overflow: 'hidden',
              border: '1px solid #eee',
            }}>
              <iframe
                src={game.mapUrl}
                width="100%"
                height="280"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
                title="Game location map"
              />
            </div>
          )}

          {/* Divider */}
          <div style={{
            height: 1,
            background: '#eee',
            margin: '0 0 24px 0',
          }} />

          {/* Player selector */}
          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              marginBottom: 10,
              fontWeight: 600,
              fontSize: 15,
              color: '#1a1a2e',
            }}>
              How many players?
            </label>
            <div style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
            }}>
              {Array.from({ length: Math.min(spotsLeft, 10) }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  onClick={() => setNumberOfPlayers(num)}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    border: numberOfPlayers === num ? '2px solid #1b5e20' : '1px solid #e0e0e0',
                    backgroundColor: numberOfPlayers === num ? '#e8f5e9' : '#fff',
                    color: numberOfPlayers === num ? '#1b5e20' : '#424242',
                    fontSize: 16,
                    fontWeight: numberOfPlayers === num ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {num}
                </button>
              ))}
            </div>

            {/* Total price summary */}
            <div style={{
              marginTop: 16,
              padding: 16,
              background: 'linear-gradient(135deg, #e8f5e9, #f1f8e9)',
              borderRadius: 12,
              border: '1px solid #c8e6c9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: 14, color: '#2e7d32', fontWeight: 500 }}>
                {numberOfPlayers} player{numberOfPlayers > 1 ? 's' : ''} &times; &#x20B1;{game.pricePerPlayer}
              </span>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#1b5e20' }}>
                &#x20B1;{totalPrice.toLocaleString()}
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <button
            style={{
              width: '100%',
              padding: 18,
              background: game.status === 'open' && spotsLeft > 0
                ? 'linear-gradient(135deg, #1b5e20, #2e7d32)'
                : '#e0e0e0',
              color: game.status === 'open' && spotsLeft > 0 ? '#fff' : '#9e9e9e',
              border: 'none',
              borderRadius: 14,
              fontSize: 17,
              fontWeight: 700,
              cursor: game.status === 'open' && spotsLeft > 0 ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              boxShadow: game.status === 'open' && spotsLeft > 0
                ? '0 4px 16px rgba(27,94,32,0.3)'
                : 'none',
              letterSpacing: '-0.2px',
            }}
            onClick={() => game.status === 'open' && spotsLeft > 0 && navigate(`/checkout/${id}`, { state: { numberOfPlayers } })}
            disabled={game.status !== 'open' || spotsLeft === 0}
            onMouseEnter={(e) => {
              if (game.status === 'open' && spotsLeft > 0) {
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(27,94,32,0.4)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (game.status === 'open' && spotsLeft > 0) {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(27,94,32,0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            {game.status === 'open' && spotsLeft > 0
              ? `Reserve ${numberOfPlayers} spot${numberOfPlayers > 1 ? 's' : ''} \u2014 \u20B1${totalPrice.toLocaleString()}`
              : game.status === 'full' ? 'Game is Full' : 'Game Not Available'
            }
          </button>

          {game.status === 'open' && spotsLeft > 0 && (
            <p style={{
              textAlign: 'center',
              fontSize: 13,
              color: '#9e9e9e',
              marginTop: 12,
            }}>
              No account required &mdash; checkout as guest
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameDetail;
