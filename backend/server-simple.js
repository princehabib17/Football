const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const logger = console; // Simple logger for now

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} - ${req.ip}`);
  next();
});

// In-memory data store (replace with MongoDB when available)
const games = [
  {
    _id: '1',
    title: 'Friday Night Football - BGC',
    venue: 'Turf BGC',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    time: '19:00',
    maxPlayers: 14,
    currentPlayers: 8,
    pricePerPlayer: 350,
    currency: 'PHP',
    description: 'Casual 7v7 football game at BGC. All skill levels welcome!',
    status: 'open'
  },
  {
    _id: '2',
    title: 'Weekend Kickabout - Makati',
    venue: 'Circuit Makati Sports Complex',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    time: '08:00',
    maxPlayers: 22,
    currentPlayers: 15,
    pricePerPlayer: 300,
    currency: 'PHP',
    description: 'Saturday morning football! Full-size pitch, 11v11 format.',
    status: 'open'
  }
];

const bookings = [];
const payments = [];

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    database: 'in-memory'
  });
});

// Get all games
app.get('/api/games', (req, res) => {
  const { status } = req.query;
  let filteredGames = games;

  if (status) {
    filteredGames = games.filter(g => g.status === status);
  }

  res.json({ games: filteredGames });
});

// Get single game
app.get('/api/games/:id', (req, res) => {
  const game = games.find(g => g._id === req.params.id);

  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  res.json({ game });
});

// Create payment intent (mock)
app.post('/api/payment/create-payment-intent', (req, res) => {
  const { gameId, numberOfPlayers, customerName, customerEmail, customerPhone } = req.body;

  const game = games.find(g => g._id === gameId);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  const totalAmount = game.pricePerPlayer * numberOfPlayers;
  const bookingId = `booking_${Date.now()}`;
  const paymentIntentId = `pi_mock_${Date.now()}`;

  // Create booking
  const booking = {
    _id: bookingId,
    game: game,
    guestInfo: { name: customerName, email: customerEmail, phone: customerPhone },
    numberOfPlayers,
    totalAmount,
    currency: 'PHP',
    status: 'pending',
    isGuestBooking: true
  };

  bookings.push(booking);

  // Create payment
  const payment = {
    _id: `payment_${Date.now()}`,
    booking: bookingId,
    stripePaymentIntentId: paymentIntentId,
    amount: totalAmount,
    currency: 'PHP',
    status: 'pending',
    customerEmail,
    customerName
  };

  payments.push(payment);

  res.json({
    clientSecret: `${paymentIntentId}_secret_mock`,
    bookingId,
    paymentId: payment._id,
    amount: totalAmount,
    currency: 'PHP'
  });
});

// Confirm payment (mock - auto-succeeds)
app.post('/api/payment/confirm-payment', (req, res) => {
  const { bookingId } = req.body;

  const booking = bookings.find(b => b._id === bookingId);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  // Update booking
  booking.status = 'confirmed';

  // Update game player count
  const game = games.find(g => g._id === booking.game._id);
  if (game) {
    game.currentPlayers += booking.numberOfPlayers;
    if (game.currentPlayers >= game.maxPlayers) {
      game.status = 'full';
    }
  }

  res.json({
    success: true,
    booking,
    payment: payments.find(p => p.booking === bookingId)
  });
});

// Get booking
app.get('/api/bookings/:id', (req, res) => {
  const booking = bookings.find(b => b._id === req.params.id);

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  res.json({ booking });
});

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to KickSlot API (In-Memory Mode)',
    version: '1.0.0',
    note: 'Using in-memory storage - data will be lost on restart',
    endpoints: {
      health: '/health',
      games: '/api/games',
      bookings: '/api/bookings',
      payment: '/api/payment'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Not Found - ${req.originalUrl}` });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Error:', err);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running in DEVELOPMENT mode on port ${PORT}`);
  logger.info('Using IN-MEMORY storage (no database required)');
  logger.info(`Loaded ${games.length} sample games`);
});

module.exports = app;
