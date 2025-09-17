import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_...'); // Replace with your Stripe publishable key

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const cardElement = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      console.error(error);
      setLoading(false);
    } else {
      // Send paymentMethod.id to backend to process payment
      // For now, mock success
      navigate(`/confirmation/${id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 16 }}>
      <h1>Checkout</h1>
      <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
      <button
        type="submit"
        disabled={!stripe || loading}
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
      >
        {loading ? 'Processing...' : 'Pay AED 40'}
      </button>
    </form>
  );
};

const Checkout = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default Checkout;
