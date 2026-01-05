const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Game = require('../models/Game');
const logger = require('../config/logger');

// Get all games
router.get('/', async (req, res) => {
  try {
    const { status, date } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }

    const games = await Game.find(filter).sort({ date: 1 });
    res.json({ games });

  } catch (error) {
    logger.error('Error fetching games:', error);
    res.status(500).json({ error: 'Failed to fetch games', message: error.message });
  }
});

// Get single game by ID
router.get('/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json({ game });

  } catch (error) {
    logger.error('Error fetching game:', error);
    res.status(500).json({ error: 'Failed to fetch game', message: error.message });
  }
});

// Create new game (admin only - for now no auth check)
router.post('/',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('venue').notEmpty().withMessage('Venue is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('time').notEmpty().withMessage('Time is required'),
    body('maxPlayers').isInt({ min: 2 }).withMessage('Max players must be at least 2'),
    body('pricePerPlayer').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('description').optional(),
    body('mapUrl').optional().isURL().withMessage('Map URL must be valid')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const game = new Game({
        ...req.body,
        currency: 'PHP',
        status: 'open'
      });

      await game.save();

      logger.info(`New game created: ${game.title} (${game._id})`);

      res.status(201).json({ game });

    } catch (error) {
      logger.error('Error creating game:', error);
      res.status(500).json({ error: 'Failed to create game', message: error.message });
    }
  }
);

// Update game
router.put('/:id',
  [
    body('title').optional().notEmpty(),
    body('venue').optional().notEmpty(),
    body('date').optional().isISO8601(),
    body('time').optional().notEmpty(),
    body('maxPlayers').optional().isInt({ min: 2 }),
    body('pricePerPlayer').optional().isFloat({ min: 0 }),
    body('mapUrl').optional().isURL()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const game = await Game.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }

      logger.info(`Game updated: ${game._id}`);

      res.json({ game });

    } catch (error) {
      logger.error('Error updating game:', error);
      res.status(500).json({ error: 'Failed to update game', message: error.message });
    }
  }
);

// Delete game
router.delete('/:id', async (req, res) => {
  try {
    const game = await Game.findByIdAndDelete(req.params.id);

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    logger.info(`Game deleted: ${req.params.id}`);

    res.json({ message: 'Game deleted successfully' });

  } catch (error) {
    logger.error('Error deleting game:', error);
    res.status(500).json({ error: 'Failed to delete game', message: error.message });
  }
});

module.exports = router;
