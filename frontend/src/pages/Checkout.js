import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

import { API_BASE_URL } from '../config/api';
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [numberOfPlayers, setNumberOfPlayers] = useState(location.state?.numberOfPlayers || 1);

  // Guest checkout form data
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isGuest, setIsGuest] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/games/${id}`)
      .then(response => {
        setGame(response.data.game);
      })
      .catch(error => {
        console.error('Error fetching game:', error);
        setError('Failed to load game details.');
      });
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements || !game) return;

    // Validate guest info
    if (!customerName || !customerEmail || !customerPhone) {
      setError('Please fill in all your information');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Create payment intent on backend
      const { data } = await axios.post(`${API_BASE_URL}/api/payment/create-payment-intent`, {
        gameId: id,
        numberOfPlayers,
        customerName,
        customerEmail,
        customerPhone,
        isGuest,
      });

      const { clientSecret, bookingId } = data;

      // Step 2: Confirm payment with Stripe
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

      // Step 3: Confirm payment on backend
      await axios.post(`${API_BASE_URL}/api/payment/confirm-payment`, {
        paymentIntentId: paymentIntent.id,
        bookingId,
      });

      // Success - navigate to confirmation
      navigate(`/confirmation/${bookingId}`);

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.error || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  if (!game) {
    return <div style={{ padding: 16, textAlign: 'center' }}>Loading...</div>;
  }

  const totalPrice = game.pricePerPlayer * numberOfPlayers;

  return (
    <div style={{ padding: 16, maxWidth: 600, margin: '0 auto' }}>
      <button
        onClick={() => navigate(`/game/${id}`)}
        style={{
          padding: '8px 16px',
          marginBottom: 16,
          backgroundColor: '#f5f5f5',
          border: '1px solid #ccc',
          borderRadius: 4,
          cursor: 'pointer'
        }}
      >
        ← Back to Game
      </button>

      <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h1 style={{ marginTop: 0 }}>Checkout</h1>

        <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
          <h3 style={{ marginTop: 0 }}>Booking Summary</h3>
          <p><strong>Game:</strong> {game.title}</p>
          <p><strong>Venue:</strong> {game.venue}</p>
          <p><strong>Date:</strong> {new Date(game.date).toLocaleDateString()} at {game.time}</p>
          <p><strong>Number of Players:</strong> {numberOfPlayers}</p>
          <p style={{ fontSize: 18, fontWeight: 'bold', color: '#2e7d32', marginBottom: 0 }}>
            Total: ₱{totalPrice.toLocaleString()}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <h3>Your Information</h3>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
              Full Name *
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: 16,
                border: '1px solid #ccc',
                borderRadius: 4,
                boxSizing: 'border-box'
              }}
              placeholder="Juan Dela Cruz"
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
              Email Address *
            </label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: 16,
                border: '1px solid #ccc',
                borderRadius: 4,
                boxSizing: 'border-box'
              }}
              placeholder="juan@example.com"
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
              Phone Number *
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: 16,
                border: '1px solid #ccc',
                borderRadius: 4,
                boxSizing: 'border-box'
              }}
              placeholder="+63 912 345 6789"
            />
          </div>

          <h3>Payment Information</h3>
          <div style={{
            marginBottom: 16,
            padding: 12,
            border: '1px solid #ccc',
            borderRadius: 4
          }}>
            <CardElement options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }} />
          </div>

          <p style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
            Supports Philippine payment methods: Credit/Debit Cards, GCash, GrabPay, PayMaya
          </p>

          {error && (
            <div style={{
              padding: 12,
              marginBottom: 16,
              backgroundColor: '#ffebee',
              color: '#c62828',
              borderRadius: 4,
              border: '1px solid #ef9a9a'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!stripe || loading}
            style={{
              width: '100%',
              padding: 16,
              backgroundColor: !stripe || loading ? '#ccc' : '#4CAF50',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 18,
              fontWeight: 'bold',
              cursor: !stripe || loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Processing...' : `Pay ₱${totalPrice.toLocaleString()}`}
          </button>

          <p style={{ fontSize: 12, color: '#666', marginTop: 12, textAlign: 'center' }}>
            Checkout as guest - no account required
          </p>
        </form>
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
