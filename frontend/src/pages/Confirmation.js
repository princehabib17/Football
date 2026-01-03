import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Confirmation = () => {
  const { id } = useParams(); // booking ID
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
    return <div style={{ padding: 16, textAlign: 'center' }}>Loading...</div>;
  }

  if (error || !booking) {
    return (
      <div style={{ padding: 16, textAlign: 'center' }}>
        <p style={{ color: 'red' }}>{error || 'Booking not found'}</p>
        <button
          onClick={() => navigate('/')}
          style={{
            marginTop: 16,
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Back to Games
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, maxWidth: 600, margin: '0 auto' }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 32,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <div style={{
          width: 80,
          height: 80,
          margin: '0 auto 16px',
          backgroundColor: '#4CAF50',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 48
        }}>
          ✓
        </div>

        <h1 style={{ color: '#4CAF50', marginTop: 0 }}>Booking Confirmed!</h1>
        <p style={{ fontSize: 16, color: '#666' }}>Your spot has been successfully reserved.</p>

        <div style={{
          marginTop: 32,
          padding: 24,
          backgroundColor: '#f5f5f5',
          borderRadius: 8,
          textAlign: 'left'
        }}>
          <h3 style={{ marginTop: 0 }}>Booking Details</h3>

          <div style={{ marginBottom: 12 }}>
            <strong>Booking ID:</strong>
            <p style={{ margin: '4px 0', color: '#666', fontFamily: 'monospace' }}>{booking._id}</p>
          </div>

          <div style={{ marginBottom: 12 }}>
            <strong>Game:</strong>
            <p style={{ margin: '4px 0', color: '#666' }}>{booking.game?.title}</p>
          </div>

          <div style={{ marginBottom: 12 }}>
            <strong>Venue:</strong>
            <p style={{ margin: '4px 0', color: '#666' }}>{booking.game?.venue}</p>
          </div>

          <div style={{ marginBottom: 12 }}>
            <strong>Date & Time:</strong>
            <p style={{ margin: '4px 0', color: '#666' }}>
              {new Date(booking.game?.date).toLocaleDateString()} at {booking.game?.time}
            </p>
          </div>

          <div style={{ marginBottom: 12 }}>
            <strong>Number of Players:</strong>
            <p style={{ margin: '4px 0', color: '#666' }}>{booking.numberOfPlayers}</p>
          </div>

          <div style={{ marginBottom: 12 }}>
            <strong>Total Paid:</strong>
            <p style={{ margin: '4px 0', color: '#2e7d32', fontSize: 18, fontWeight: 'bold' }}>
              ₱{booking.totalAmount?.toLocaleString()}
            </p>
          </div>

          <div style={{ marginBottom: 12 }}>
            <strong>Status:</strong>
            <p style={{
              margin: '4px 0',
              color: booking.status === 'confirmed' ? '#4CAF50' : '#666',
              textTransform: 'capitalize'
            }}>
              {booking.status}
            </p>
          </div>

          {booking.guestInfo && (
            <div style={{ marginBottom: 12 }}>
              <strong>Contact:</strong>
              <p style={{ margin: '4px 0', color: '#666' }}>{booking.guestInfo.name}</p>
              <p style={{ margin: '4px 0', color: '#666' }}>{booking.guestInfo.email}</p>
              <p style={{ margin: '4px 0', color: '#666' }}>{booking.guestInfo.phone}</p>
            </div>
          )}
        </div>

        <div style={{
          marginTop: 24,
          padding: 16,
          backgroundColor: '#e3f2fd',
          borderRadius: 8,
          border: '1px solid #2196F3'
        }}>
          <p style={{ margin: 0, fontSize: 14, color: '#1976D2' }}>
            <strong>Important:</strong> A confirmation email has been sent to your email address with all the details.
            Please arrive 10 minutes before the game starts.
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          style={{
            marginTop: 24,
            width: '100%',
            padding: 16,
            backgroundColor: '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 18,
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Browse More Games
        </button>
      </div>
    </div>
  );
};

export default Confirmation;
