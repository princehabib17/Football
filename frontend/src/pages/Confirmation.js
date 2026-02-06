import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/* ---------- detail row ---------- */
const DetailRow = ({ label, value, mono, bold, color }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '10px 0',
    borderBottom: '1px solid #f0f0f0',
    gap: 16,
  }}>
    <span style={{ fontSize: 14, color: '#5f6368', fontWeight: 500, flexShrink: 0 }}>{label}</span>
    <span style={{
      fontSize: bold ? 18 : 14,
      fontWeight: bold ? 800 : 500,
      color: color || '#1a1a2e',
      fontFamily: mono ? "'JetBrains Mono', monospace" : 'inherit',
      textAlign: 'right',
      wordBreak: 'break-all',
    }}>
      {value}
    </span>
  </div>
);

const Confirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/bookings/${id}`)
      .then(response => {
        setBooking(response.data.booking);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching booking:', error);
        setError('Failed to load booking details.');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div style={{
        padding: '80px 24px',
        textAlign: 'center',
      }}>
        <div style={{
          width: 40, height: 40,
          border: '3px solid #e0e0e0',
          borderTopColor: '#4caf50',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px',
        }} />
        <p style={{ color: '#5f6368', fontSize: 15 }}>Loading your booking...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="animate-fade-in" style={{ padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>&#9888;&#65039;</div>
        <p style={{ color: '#c62828', fontSize: 16, fontWeight: 500, marginBottom: 20 }}>
          {error || 'Booking not found'}
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '12px 28px',
            background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Back to Games
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{
      padding: '32px 24px 48px',
      maxWidth: 640,
      margin: '0 auto',
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.04)',
      }}>
        {/* Success header */}
        <div style={{
          background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #43a047 100%)',
          padding: '40px 32px',
          textAlign: 'center',
          color: '#fff',
        }}>
          {/* Animated checkmark */}
          <div className="animate-bounce-in" style={{
            width: 80,
            height: 80,
            margin: '0 auto 20px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
            color: '#ffffff',
            backdropFilter: 'blur(4px)',
            border: '2px solid rgba(255,255,255,0.3)',
          }}>
            &#10003;
          </div>

          <h1 style={{
            margin: '0 0 8px',
            fontSize: 26,
            fontWeight: 800,
            color: '#fff',
          }}>
            Booking Confirmed!
          </h1>
          <p style={{
            margin: 0,
            fontSize: 15,
            opacity: 0.9,
          }}>
            Your spot has been successfully reserved
          </p>
        </div>

        <div style={{ padding: '28px 32px 32px' }}>
          {/* Booking details card */}
          <div style={{
            padding: 24,
            backgroundColor: '#f8f9fa',
            borderRadius: 14,
            border: '1px solid #eee',
            marginBottom: 24,
          }}>
            <h3 style={{
              marginTop: 0,
              marginBottom: 16,
              fontSize: 15,
              fontWeight: 600,
              color: '#1a1a2e',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span style={{ fontSize: 17 }}>&#128203;</span>
              Booking Details
            </h3>

            <DetailRow label="Booking ID" value={booking._id} mono />
            <DetailRow label="Game" value={booking.game?.title} />
            <DetailRow label="Venue" value={booking.game?.venue} />
            <DetailRow
              label="Date & Time"
              value={`${new Date(booking.game?.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })} at ${booking.game?.time}`}
            />
            <DetailRow label="Players" value={booking.numberOfPlayers} />
            <DetailRow
              label="Total Paid"
              value={`\u20B1${booking.totalAmount?.toLocaleString()}`}
              bold
              color="#1b5e20"
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 10,
            }}>
              <span style={{ fontSize: 14, color: '#5f6368', fontWeight: 500 }}>Status</span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                background: booking.status === 'confirmed' ? '#e8f5e9' : '#f5f5f5',
                color: booking.status === 'confirmed' ? '#2e7d32' : '#616161',
                border: booking.status === 'confirmed' ? '1px solid #c8e6c9' : '1px solid #e0e0e0',
                textTransform: 'capitalize',
              }}>
                {booking.status === 'confirmed' && <span style={{ marginRight: 4 }}>&#9989;</span>}
                {booking.status}
              </span>
            </div>
          </div>

          {/* Guest info */}
          {booking.guestInfo && (
            <div style={{
              padding: 24,
              backgroundColor: '#f8f9fa',
              borderRadius: 14,
              border: '1px solid #eee',
              marginBottom: 24,
            }}>
              <h3 style={{
                marginTop: 0,
                marginBottom: 16,
                fontSize: 15,
                fontWeight: 600,
                color: '#1a1a2e',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <span style={{ fontSize: 17 }}>&#128100;</span>
                Contact Information
              </h3>
              <DetailRow label="Name" value={booking.guestInfo.name} />
              <DetailRow label="Email" value={booking.guestInfo.email} />
              <DetailRow label="Phone" value={booking.guestInfo.phone} />
            </div>
          )}

          {/* Important notice */}
          <div style={{
            padding: 18,
            backgroundColor: '#e3f2fd',
            borderRadius: 12,
            border: '1px solid #bbdefb',
            marginBottom: 24,
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>&#8505;&#65039;</span>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#1565c0' }}>
                Important
              </p>
              <p style={{ margin: 0, fontSize: 13, color: '#1976d2', lineHeight: 1.6 }}>
                A confirmation email has been sent with all the details. Please arrive 10 minutes before the game starts.
              </p>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate('/')}
            style={{
              width: '100%',
              padding: 18,
              background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
              color: '#fff',
              border: 'none',
              borderRadius: 14,
              fontSize: 17,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 16px rgba(27,94,32,0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(27,94,32,0.4)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(27,94,32,0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Browse More Games
          </button>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
