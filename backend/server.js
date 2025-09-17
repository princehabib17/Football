const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB (use local MongoDB or MongoDB Atlas)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kickslot', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.get('/api/games', (req, res) => {
  // Mock data for now
  const games = [
    {
      id: 1,
      venue: 'Al Wasl Park',
      time: '2023-10-15T18:00:00Z',
      location: 'Dubai',
      slotsLeft: 12,
      totalSlots: 14,
      price: 40,
      organizer: 'Ahmed',
    },
    // Add more mock games
  ];
  res.json(games);
});

app.get('/api/games/:id', (req, res) => {
  // Mock detail
  const game = {
    id: req.params.id,
    venue: 'Al Wasl Park',
    time: '2023-10-15T18:00:00Z',
    location: 'Dubai',
    slotsLeft: 12,
    totalSlots: 14,
    price: 40,
    organizer: 'Ahmed',
    description: 'Casual 7-a-side game.',
    mapUrl: 'https://maps.google.com/...',
  };
  res.json(game);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
