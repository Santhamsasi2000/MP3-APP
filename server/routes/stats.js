const express = require('express');
const router = express.Router();
const Song = require('../models/Song');

// Get overall statistics
router.get('/', async (req, res) => {
  try {
    const totalSongs = await Song.countDocuments();
    
    const totalSize = await Song.aggregate([
      { $group: { _id: null, total: { $sum: '$fileSize' } } },
    ]);

    const totalDuration = await Song.aggregate([
      { $group: { _id: null, total: { $sum: '$duration' } } },
    ]);

    const byCategory = await Song.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const totalGB = (totalSize[0]?.total || 0) / (1024 * 1024 * 1024);
    const totalHours = (totalDuration[0]?.total || 0) / 3600;

    res.json({
      success: true,
      stats: {
        totalSongs,
        totalSize: totalGB.toFixed(2) + ' GB',
        totalDuration: totalHours.toFixed(2) + ' hours',
        byCategory,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;