require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// Routes
app.use('/api/songs', require('./routes/songs'));
app.use('/api/stats', require('./routes/stats'));

// Health check
app.get('/', (req, res) => {
  res.json({
    message: '🎵 MP3 App Backend',
    version: '1.0.0',
    endpoints: {
      songs: '/api/songs',
      recent: '/api/songs/recent',
      mostPlayed: '/api/songs/most-played',
      search: '/api/songs/search?q=xxx',
      streamUrl: '/api/songs/:id/stream',
      directors: '/api/songs/meta/directors',
      movies: '/api/songs/meta/movies',
      stats: '/api/stats',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  🎵 MP3 Backend Server                ║');
  console.log('╠════════════════════════════════════════╣');
  console.log(`║  Running on: http://localhost:${PORT}   ║`);
  console.log('╚════════════════════════════════════════╝');
});