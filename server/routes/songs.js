const express = require('express');
const router = express.Router();
const { Telegraf } = require('telegraf');
const Song = require('../models/Song');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const mm = require('music-metadata');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Get all songs
router.get('/', async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.json({ success: true, count: songs.length, songs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get recently added
router.get('/recent', async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, songs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get most played
router.get('/most-played', async (req, res) => {
  try {
    const songs = await Song.find().sort({ playCount: -1 }).limit(10);
    res.json({ success: true, songs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search songs
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, songs: [] });

    const songs = await Song.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { artist: { $regex: q, $options: 'i' } },
        { album: { $regex: q, $options: 'i' } },
      ],
    }).limit(20);

    res.json({ success: true, count: songs.length, songs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get by music director
router.get('/director/:name', async (req, res) => {
  try {
    const songs = await Song.find({
      musicDirector: { $regex: req.params.name, $options: 'i' },
    });
    res.json({ success: true, count: songs.length, songs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get by movie
router.get('/movie/:name', async (req, res) => {
  try {
    const songs = await Song.find({
      movieName: { $regex: req.params.name, $options: 'i' },
    });
    res.json({ success: true, count: songs.length, songs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get streaming URL
router.get('/:id/stream', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ success: false, error: 'Song not found' });
    }

    // Get Telegram streaming URL
    const fileLink = await bot.telegram.getFileLink(song.telegramFileId);

    // Increment play count
    song.playCount += 1;
    song.lastPlayed = new Date();
    await song.save();

    res.json({
      success: true,
      streamUrl: fileLink.href,
      song: {
        id: song._id,
        title: song.title,
        artist: song.artist,
        album: song.album,
        duration: song.duration,
        cover: song.coverImage || `https://picsum.photos/300/300?random=${song._id}`,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Toggle favorite
router.post('/:id/favorite', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ success: false, error: 'Song not found' });
    }

    song.isFavorite = !song.isFavorite;
    await song.save();

    res.json({ success: true, isFavorite: song.isFavorite });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all directors
router.get('/meta/directors', async (req, res) => {
  try {
    const directors = await Song.aggregate([
      {
        $group: {
          _id: '$musicDirector',
          count: { $sum: 1 },
          sampleSong: { $first: '$title' },
        },
      },
      { $sort: { count: -1 } },
    ]);
    res.json({ success: true, count: directors.length, directors });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all movies
router.get('/meta/movies', async (req, res) => {
  try {
    const movies = await Song.aggregate([
      { $match: { movieName: { $ne: '' } } },
      {
        $group: {
          _id: '$movieName',
          count: { $sum: 1 },
          director: { $first: '$musicDirector' },
        },
      },
      { $sort: { count: -1 } },
    ]);
    res.json({ success: true, count: movies.length, movies });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete song
router.delete('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ 
        success: false, 
        error: 'Song not found' 
      });
    }

    // Delete from Telegram
    try {
      await bot.telegram.deleteMessage(
        process.env.CHANNEL_ID, 
        song.telegramMessageId
      );
    } catch (err) {
      console.log('Could not delete from Telegram:', err.message);
    }

    // Delete from MongoDB
    await Song.deleteOne({ _id: song._id });

    res.json({ 
      success: true, 
      message: 'Song deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../temp-uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Keep original filename
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max (Telegram limit)
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'audio/mpeg' || file.originalname.endsWith('.mp3')) {
      cb(null, true);
    } else {
      cb(new Error('Only MP3 files allowed!'), false);
    }
  },
});

// UPLOAD ENDPOINT - Mobile sends MP3 file here
router.post('/upload', upload.single('song'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;
    console.log(`\n📤 New Upload: ${originalName}`);
    console.log(`   Size: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);

    // Get metadata from request body (from mobile)
    const {
      title,
      artist,
      album,
      musicDirector,
      movieName,
      category,
    } = req.body;

    // Extract additional metadata from file
    let metadata = {};
    try {
      const parsed = await mm.parseFile(filePath);
      metadata = {
        duration: Math.floor(parsed.format.duration || 0),
        year: parsed.common.year?.toString() || '',
        genre: parsed.common.genre?.[0] || '',
      };
    } catch (err) {
      console.log('   ⚠️ Could not read metadata');
      metadata = { duration: 0, year: '', genre: '' };
    }

    // Check if already exists
    const existing = await Song.findOne({
      title: title || originalName,
      artist: artist || 'Unknown',
    });

    if (existing) {
      // Clean up temp file
      fs.unlinkSync(filePath);
      return res.status(409).json({
        success: false,
        error: 'Song already exists',
        song: existing,
      });
    }

    // Upload to Telegram
    console.log(`   📤 Uploading to Telegram...`);
    const message = await bot.telegram.sendAudio(
      process.env.CHANNEL_ID,
      { source: filePath },
      {
        title: title || originalName,
        performer: artist || 'Unknown',
        duration: metadata.duration,
        caption: `🎵 ${title || originalName}\n🎤 ${artist || 'Unknown'}`,
      }
    );

    // Save to MongoDB
    console.log(`   💾 Saving to database...`);
    const song = await Song.create({
      title: title || originalName.replace('.mp3', ''),
      artist: artist || 'Unknown',
      album: album || 'Unknown',
      duration: metadata.duration,
      fileSize: req.file.size,
      originalFileName: originalName,
      filePath: `mobile-upload/${originalName}`,
      telegramFileId: message.audio.file_id,
      telegramMessageId: message.message_id,
      musicDirector: musicDirector || 'Unknown',
      movieName: movieName || '',
      category: category || 'song',
      year: metadata.year,
      genre: metadata.genre,
    });

    // Delete temp file
    fs.unlinkSync(filePath);
    console.log(`   ✅ Upload complete!`);

    res.json({
      success: true,
      message: 'Song uploaded successfully!',
      song: song,
    });
  } catch (error) {
    console.error('❌ Upload error:', error);

    // Clean up temp file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;