const mongoose = require('mongoose');
require('dotenv').config();

const Game = require('../models/Game');
const logger = require('../config/logger');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kickslot')
  .then(() => {
    logger.info('Connected to MongoDB for seeding');
    seedGames();
  })
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Sample games data (Philippines locations)
const sampleGames = [
  {
    title: 'Friday Night Football - BGC',
    venue: 'Turf BGC',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    time: '19:00',
    maxPlayers: 14,
    currentPlayers: 8,
    pricePerPlayer: 350,
    currency: 'PHP',
    description: 'Casual 7v7 football game at BGC. All skill levels welcome! Bring your own water and wear proper football boots.',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.4!2d121.0!3d14.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTTCsDMwJzAwLjAiTiAxMjHCsDAwJzAwLjAiRQ!5e0!3m2!1sen!2sph!4v1234567890',
    status: 'open'
  },
  {
    title: 'Weekend Kickabout - Makati',
    venue: 'Circuit Makati Sports Complex',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    time: '08:00',
    maxPlayers: 22,
    currentPlayers: 15,
    pricePerPlayer: 300,
    currency: 'PHP',
    description: 'Saturday morning football! Full-size pitch, 11v11 format. Great workout to start your weekend.',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.3!2d121.0!3d14.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTTCsDMwJzAwLjAiTiAxMjHCsDAwJzAwLjAiRQ!5e0!3m2!1sen!2sph!4v1234567891',
    status: 'open'
  },
  {
    title: 'Sunday League - Alabang',
    venue: 'Filinvest Football Field',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    time: '16:00',
    maxPlayers: 18,
    currentPlayers: 12,
    pricePerPlayer: 280,
    currency: 'PHP',
    description: 'Competitive 9v9 match in Alabang. Good level of play expected. Shin guards mandatory.',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3863.1!2d121.0!3d14.4!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTTCsDI0JzAwLjAiTiAxMjHCsDAwJzAwLjAiRQ!5e0!3m2!1sen!2sph!4v1234567892',
    status: 'open'
  },
  {
    title: 'Midweek Match - Quezon City',
    venue: 'UP Diliman Football Field',
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    time: '18:30',
    maxPlayers: 16,
    currentPlayers: 10,
    pricePerPlayer: 250,
    currency: 'PHP',
    description: 'Wednesday evening game at UP Diliman. Mix of students and working professionals. Relaxed atmosphere.',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3860.1!2d121.1!3d14.6!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTTCsDM2JzAwLjAiTiAxMjHCsDA2JzAwLjAiRQ!5e0!3m2!1sen!2sph!4v1234567893',
    status: 'open'
  },
  {
    title: 'Saturday Showdown - Ortigas',
    venue: 'Meralco Football Field',
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
    time: '14:00',
    maxPlayers: 20,
    currentPlayers: 18,
    pricePerPlayer: 320,
    currency: 'PHP',
    description: 'Almost full! Competitive 10v10 game in Ortigas. Well-maintained grass pitch.',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.0!2d121.1!3d14.6!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTTCsDM2JzAwLjAiTiAxMjHCsDA2JzAwLjAiRQ!5e0!3m2!1sen!2sph!4v1234567894',
    status: 'open'
  },
  {
    title: 'Ladies Football - Pasig',
    venue: 'Ynares Sports Arena',
    date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
    time: '17:00',
    maxPlayers: 14,
    currentPlayers: 7,
    pricePerPlayer: 300,
    currency: 'PHP',
    description: 'Women-only football session. All levels welcome! Friendly and supportive environment.',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.2!2d121.1!3d14.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTTCsDMwJzAwLjAiTiAxMjHCsDA2JzAwLjAiRQ!5e0!3m2!1sen!2sph!4v1234567895',
    status: 'open'
  },
  {
    title: 'Early Bird Game - Taguig',
    venue: 'McKinley Hill Sports Complex',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    time: '06:30',
    maxPlayers: 12,
    currentPlayers: 9,
    pricePerPlayer: 280,
    currency: 'PHP',
    description: 'Beat the heat with an early morning game! 6v6 format, perfect way to start your day.',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.5!2d121.0!3d14.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTTCsDMwJzAwLjAiTiAxMjHCsDAwJzAwLjAiRQ!5e0!3m2!1sen!2sph!4v1234567896',
    status: 'open'
  },
  {
    title: 'Veterans Match - Manila',
    venue: 'Rizal Memorial Football Stadium',
    date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
    time: '15:00',
    maxPlayers: 22,
    currentPlayers: 20,
    pricePerPlayer: 400,
    currency: 'PHP',
    description: '35+ years old players only. Full-size pitch at historic Rizal Memorial. Competitive but fair play.',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.3!2d121.0!3d14.6!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTTCsDM2JzAwLjAiTiAxMjHCsDAwJzAwLjAiRQ!5e0!3m2!1sen!2sph!4v1234567897',
    status: 'open'
  }
];

async function seedGames() {
  try {
    // Clear existing games
    await Game.deleteMany({});
    logger.info('Cleared existing games');

    // Insert sample games
    const games = await Game.insertMany(sampleGames);
    logger.info(`Successfully seeded ${games.length} games to the database`);

    // Display seeded games
    games.forEach(game => {
      logger.info(`- ${game.title} on ${game.date.toLocaleDateString()} at ${game.time}`);
    });

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding games:', error);
    process.exit(1);
  }
}
