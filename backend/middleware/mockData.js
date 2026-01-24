const mongoose = require('mongoose');
const logger = require('../config/logger');

// Mock games data for when MongoDB is not available
const mockGames = [
  {
    _id: '507f1f77bcf86cd799439011',
    title: 'Sunday Friendly Match - BGC',
    venue: 'Turf BGC, Bonifacio Global City',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    time: '18:00',
    maxPlayers: 14,
    currentPlayers: 8,
    pricePerPlayer: 350,
    currency: 'PHP',
    description: 'Casual 7v7 game at BGC turf. All skill levels welcome!',
    status: 'open',
    mapUrl: 'https://maps.google.com',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '507f1f77bcf86cd799439012',
    title: 'Friday Night Football - Makati',
    venue: 'Makati Sports Club',
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    time: '20:00',
    maxPlayers: 16,
    currentPlayers: 12,
    pricePerPlayer: 400,
    currency: 'PHP',
    description: 'Competitive 8v8 match. Looking for skilled players!',
    status: 'open',
    mapUrl: 'https://maps.google.com',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '507f1f77bcf86cd799439013',
    title: 'Saturday Morning Game - QC',
    venue: 'UP Diliman Football Field',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    time: '08:00',
    maxPlayers: 12,
    currentPlayers: 10,
    pricePerPlayer: 250,
    currency: 'PHP',
    description: 'Early morning 6v6 game. Great way to start the weekend!',
    status: 'open',
    mapUrl: 'https://maps.google.com',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '507f1f77bcf86cd799439014',
    title: 'Weekday Evening Match - Ortigas',
    venue: 'The Yard Ortigas',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    time: '19:30',
    maxPlayers: 10,
    currentPlayers: 3,
    pricePerPlayer: 450,
    currency: 'PHP',
    description: 'After-work 5v5 game. Indoor turf with lights.',
    status: 'open',
    mapUrl: 'https://maps.google.com',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Middleware to inject mock data when MongoDB is not connected
const useMockDataIfDisconnected = (mockDataGetter) => {
  return (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
      logger.info('Using mock data (MongoDB not connected)');
      req.useMockData = true;
      req.mockData = mockDataGetter();
      return next();
    }
    req.useMockData = false;
    next();
  };
};

module.exports = {
  mockGames,
  useMockDataIfDisconnected
};
