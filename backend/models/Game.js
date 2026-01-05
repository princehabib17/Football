const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  venue: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  maxPlayers: {
    type: Number,
    required: true,
    min: 2,
    default: 22
  },
  currentPlayers: {
    type: Number,
    default: 0,
    min: 0
  },
  pricePerPlayer: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'PHP',
    uppercase: true
  },
  description: {
    type: String,
    trim: true
  },
  mapUrl: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['open', 'full', 'cancelled', 'completed'],
    default: 'open'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Update status based on current players
gameSchema.methods.updateStatus = function() {
  if (this.currentPlayers >= this.maxPlayers) {
    this.status = 'full';
  } else if (this.status === 'full' && this.currentPlayers < this.maxPlayers) {
    this.status = 'open';
  }
};

module.exports = mongoose.model('Game', gameSchema);
