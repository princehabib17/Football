import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

/* ---------- input component ---------- */
const FormInput = ({ label, required, ...props }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{
      display: 'block',
      marginBottom: 6,
      fontWeight: 600,
      fontSize: 14,
      color: '#1a1a2e',
    }}>
      {label} {required && <span style={{ color: '#c62828' }}>*</span>}
    </label>
    <input
      required={required}
      style={{
        width: '100%',
        padding: '12px 16px',
        fontSize: 15,
        border: '1px solid #e0e0e0',
        borderRadius: 10,
        boxSizing: 'border-box',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        outline: 'none',
        backgroundColor: '#fafafa',
        color: '#1a1a2e',
      }}
      onFocus={(e) => {
        e.target.style.borderColor = '#4caf50';
        e.target.style.boxShadow = '0 0 0 3px rgba(76,175,80,0.12)';
        e.target.style.backgroundColor = '#fff';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = '#e0e0e0';
        e.target.style.boxShadow = 'none';
        e.target.style.backgroundColor = '#fafafa';
      }}
      {...props}
    />
  </div>
);

/* ---------- checkout form ---------- */
const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [numberOfPlayers] = useState(location.state?.numberOfPlayers || 1);

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  useEffect(() => {
    axios.get(`${API_URL}/api/games/${id}`)
      .then(response => setGame(response.data.game))
      .catch(error => {
        console.error('Error fetching game:', error);
        setError('Failed to load game details.');
      });
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements || !game) return;

    if (!customerName || !customerEmail || !customerPhone) {
      setError('Please fill in all your information');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post(`${API_URL}/api/payment/create-payment-intent`, {
        gameId: id,
        numberOfPlayers,
        customerName,
        customerEmail,
        customerPhone,
        isGuest: true,
      });

      const { clientSecret, bookingId } = data;

      const cardElement = elements.getElement(CardElement);
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      await axios.post(`${API_URL}/api/payment/confirm-payment`, {
        paymentIntentId: paymentIntent.id,
        bookingId,
      });

      navigate(`/confirmation/${bookingId}`);
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.error || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  if (!game) {
    return (
      <div style={{
        padding: '64px 24px',
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
        <p style={{ color: '#5f6368', fontSize: 15 }}>Loading checkout...</p>
      </div>
    );
  }

  const totalPrice = game.pricePerPlayer * numberOfPlayers;

  return (
    <div className="animate-fade-in" style={{
      padding: '32px 24px 48px',
      maxWidth: 640,
      margin: '0 auto',
    }}>
      {/* Back */}
      <button
        onClick={() => navigate(`/game/${id}`)}
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
        &larr; Back to Game
      </button>

      {/* Main card */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.04)',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
          padding: '24px 32px',
          color: '#fff',
        }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff' }}>Checkout</h1>
          <p style={{ margin: '6px 0 0', opacity: 0.85, fontSize: 14 }}>Secure payment powered by Stripe</p>
        </div>

        <div style={{ padding: '28px 32px 32px' }}>
          {/* Booking summary */}
          <div style={{
            marginBottom: 28,
            padding: 20,
            background: '#f8f9fa',
            borderRadius: 14,
            border: '1px solid #eee',
          }}>
            <h3 style={{ marginTop: 0, marginBottom: 14, fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>
              Booking Summary
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#5f6368' }}>Game</span>
                <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{game.title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#5f6368' }}>Venue</span>
                <span style={{ fontWeight: 500, color: '#424242' }}>{game.venue}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#5f6368' }}>Date & Time</span>
                <span style={{ fontWeight: 500, color: '#424242' }}>{new Date(game.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} at {game.time}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#5f6368' }}>Players</span>
                <span style={{ fontWeight: 500, color: '#424242' }}>{numberOfPlayers}</span>
              </div>
              <div style={{ height: 1, background: '#e0e0e0', margin: '6px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
                <span style={{ fontWeight: 600, color: '#1a1a2e' }}>Total</span>
                <span style={{ fontWeight: 800, color: '#1b5e20', fontSize: 20 }}>&#x20B1;{totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <h3 style={{
              marginTop: 0,
              marginBottom: 16,
              fontSize: 16,
              fontWeight: 700,
              color: '#1a1a2e',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span style={{ fontSize: 18 }}>&#128100;</span>
              Your Information
            </h3>

            <FormInput
              label="Full Name"
              required
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Juan Dela Cruz"
            />

            <FormInput
              label="Email Address"
              required
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="juan@example.com"
            />

            <FormInput
              label="Phone Number"
              required
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+63 912 345 6789"
            />

            <div style={{ height: 1, background: '#eee', margin: '8px 0 28px' }} />

            <h3 style={{
              marginTop: 0,
              marginBottom: 16,
              fontSize: 16,
              fontWeight: 700,
              color: '#1a1a2e',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span style={{ fontSize: 18 }}>&#128179;</span>
              Payment Information
            </h3>

            <div style={{
              marginBottom: 16,
              padding: 16,
              border: '1px solid #e0e0e0',
              borderRadius: 10,
              backgroundColor: '#fafafa',
              transition: 'border-color 0.2s ease',
            }}>
              <CardElement options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#1a1a2e',
                    fontFamily: 'Inter, -apple-system, sans-serif',
                    '::placeholder': {
                      color: '#9e9e9e',
                    },
                  },
                  invalid: {
                    color: '#c62828',
                  },
                },
              }} />
            </div>

            <p style={{
              fontSize: 12,
              color: '#9e9e9e',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <span style={{ fontSize: 14 }}>&#128274;</span>
              Supports Credit/Debit Cards, GCash, GrabPay, PayMaya
            </p>

            {error && (
              <div className="animate-scale-in" style={{
                padding: '14px 18px',
                marginBottom: 20,
                backgroundColor: '#ffebee',
                color: '#c62828',
                borderRadius: 10,
                border: '1px solid #ef9a9a',
                fontSize: 14,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>&#9888;&#65039;</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!stripe || loading}
              style={{
                width: '100%',
                padding: 18,
                background: !stripe || loading
                  ? '#e0e0e0'
                  : 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                color: !stripe || loading ? '#9e9e9e' : '#fff',
                border: 'none',
                borderRadius: 14,
                fontSize: 17,
                fontWeight: 700,
                cursor: !stripe || loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: !stripe || loading
                  ? 'none'
                  : '0 4px 16px rgba(27,94,32,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              onMouseEnter={(e) => {
                if (stripe && !loading) {
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(27,94,32,0.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (stripe && !loading) {
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(27,94,32,0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {loading && (
                <span style={{
                  width: 20, height: 20,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  display: 'inline-block',
                }} />
              )}
              {loading ? 'Processing...' : `Pay \u20B1${totalPrice.toLocaleString()}`}
            </button>

            <p style={{
              fontSize: 13,
              color: '#9e9e9e',
              marginTop: 14,
              textAlign: 'center',
            }}>
              Guest checkout &mdash; no account required
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

const Checkout = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default Checkout;
