const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const logger = require('../config/logger');

// Get all bookings (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { userId, gameId, status } = req.query;
    const filter = {};

    if (userId) filter.user = userId;
    if (gameId) filter.game = gameId;
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('game')
      .populate('user', '-password')
      .populate('payment')
      .sort({ createdAt: -1 });

    res.json({ bookings });

  } catch (error) {
    logger.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings', message: error.message });
  }
});

// Get single booking by ID
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('game')
      .populate('user', '-password')
      .populate('payment');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ booking });

  } catch (error) {
    logger.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking', message: error.message });
  }
});

// Cancel booking
router.post('/:id/cancel', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('game');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking is already cancelled' });
    }

    const wasConfirmed = booking.status === 'confirmed';

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    // Update game player count if booking was confirmed
    if (wasConfirmed) {
      const Game = require('../models/Game');
      const game = await Game.findById(booking.game);
      if (game) {
        game.currentPlayers = Math.max(0, game.currentPlayers - booking.numberOfPlayers);
        game.updateStatus();
        await game.save();
      }
    }

    logger.info(`Booking cancelled: ${booking._id}`);

    res.json({ message: 'Booking cancelled successfully', booking });

  } catch (error) {
    logger.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking', message: error.message });
  }
});

module.exports = router;
