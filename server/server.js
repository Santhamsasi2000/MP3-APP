require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Telegraf } = require('telegraf');

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ⚠️ TEMPORARY: Hardcoded song for testing
// Later we'll get this from MongoDB
const TEST_SONG = {
  id: '1',
  title: 'Vishwanath - Sons Teaser Theme',
  artist: 'Test Artist',
  album: 'Test Album',
  duration: '1:17',
  fileSize: 1310720, // 1.25 MB
  cover: 'https://picsum.photos/300/300?random=1',
  telegramFileId: 'PASTE_YOUR_FILE_ID_HERE', // ⚠️ REPLACE THIS
};

// ===== ROUTES =====

// Health check
app.get('/', (req, res) => {
  res.json({ message: '🎵 MP3 App Backend Running!' });
});

// Get all songs
app.get('/api/songs', (req, res) => {
  res.json([TEST_SONG]);
});

// Get streaming URL for a song
app.get('/api/songs/:id/stream', async (req, res) => {
  try {
    const song = TEST_SONG; // Get from MongoDB later
    
    console.log(`🎵 Getting stream URL for: ${song.title}`);
    
    // Get temporary streaming URL from Telegram
    const fileLink = await bot.telegram.getFileLink(song.telegramFileId);
    
    console.log(`✅ Got URL: ${fileLink.href.substring(0, 50)}...`);
    
    res.json({
      success: true,
      streamUrl: fileLink.href,
      song: song,
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  🎵 MP3 Backend Server                ║');
  console.log('╠════════════════════════════════════════╣');
  console.log(`║  Running on: http://localhost:${PORT}   ║`);
  console.log('║                                        ║');
  console.log('║  Endpoints:                            ║');
  console.log('║  GET /api/songs                        ║');
  console.log('║  GET /api/songs/:id/stream             ║');
  console.log('╚════════════════════════════════════════╝');
});