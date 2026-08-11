const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  artist: { type: String, default: 'Unknown Artist', trim: true },
  album: { type: String, default: 'Unknown Album', trim: true },
  duration: { type: Number, default: 0 },
  fileSize: { type: Number, default: 0 },
  originalFileName: { type: String, required: true },
  filePath: { type: String, required: true, unique: true },
  telegramFileId: { type: String, required: true, unique: true },
  telegramMessageId: { type: Number, required: true },
  musicDirector: { type: String, default: 'Unknown', trim: true },
  movieName: { type: String, default: '', trim: true },
  category: {
    type: String,
    enum: ['song', 'bgm', 'other'],
    default: 'song',
  },
  year: { type: String, default: '' },
  genre: { type: String, default: '' },
  playCount: { type: Number, default: 0 },
  isFavorite: { type: Boolean, default: false },
  coverImage: { type: String, default: '' },
  uploadedAt: { type: Date, default: Date.now },
  lastPlayed: { type: Date, default: null },
}, { timestamps: true });

songSchema.index({ title: 'text', artist: 'text', album: 'text' });
songSchema.index({ musicDirector: 1 });
songSchema.index({ movieName: 1 });
songSchema.index({ category: 1 });

module.exports = mongoose.model('Song', songSchema);