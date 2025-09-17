import React from 'react';
import { useParams } from 'react-router-dom';

const Confirmation = () => {
  const { id } = useParams();

  return (
    <div style={{ padding: 16, textAlign: 'center' }}>
      <h1>Booking Confirmed!</h1>
      <p>✅ Your spot is reserved.</p>
      <p>Game ID: {id}</p>
      <p>QR Code: [Mock QR]</p>
      <p>Join WhatsApp group: [Link]</p>
    </div>
  );
};

export default Confirmation;
