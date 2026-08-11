require('dotenv').config({ path: '../.env' });
const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require('path');
const mm = require('music-metadata');
const mongoose = require('mongoose');

const Song = require('../models/Song');

const bot = new Telegraf(process.env.BOT_TOKEN);
const CHANNEL_ID = process.env.CHANNEL_ID;
const SONGS_FOLDER = process.env.SONGS_FOLDER;

const stats = { total: 0, uploaded: 0, skipped: 0, failed: 0 };

// Get all MP3 files
function getAllMp3Files(dirPath, files = []) {
  const items = fs.readdirSync(dirPath);
  items.forEach((item) => {
    const fullPath = path.join(dirPath, item);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllMp3Files(fullPath, files);
    } else if (item.toLowerCase().endsWith('.mp3')) {
      files.push(fullPath);
    }
  });
  return files;
}

// Get metadata
async function getMetadata(filePath) {
  try {
    const metadata = await mm.parseFile(filePath);
    const stat = fs.statSync(filePath);
    return {
      title: metadata.common.title || path.basename(filePath, '.mp3'),
      artist: metadata.common.artist || 'Unknown',
      album: metadata.common.album || 'Unknown',
      duration: Math.floor(metadata.format.duration || 0),
      year: metadata.common.year?.toString() || '',
      genre: metadata.common.genre?.[0] || '',
      fileSize: stat.size,
    };
  } catch {
    const stat = fs.statSync(filePath);
    return {
      title: path.basename(filePath, '.mp3'),
      artist: 'Unknown',
      album: 'Unknown',
      duration: 0,
      year: '',
      genre: '',
      fileSize: stat.size,
    };
  }
}

// Extract path info
function extractPathInfo(filePath) {
  const parts = filePath.split(path.sep);
  return {
    musicDirector: parts[parts.length - 3] || 'Unknown',
    movieName: parts[parts.length - 2] || '',
    category: filePath.toLowerCase().includes('bgm') ? 'bgm' : 'song',
  };
}

// Upload one song
async function uploadSong(filePath, index, total) {
  try {
    const fileName = path.basename(filePath);
    console.log(`\n[${index}/${total}] 📁 ${fileName}`);

    // Check duplicate
    const existing = await Song.findOne({ filePath });
    if (existing) {
      console.log('⏭️  Skipped (already uploaded)');
      stats.skipped++;
      return;
    }

    const metadata = await getMetadata(filePath);
    const pathInfo = extractPathInfo(filePath);

    console.log(`   📤 Uploading: ${metadata.title}`);

    const message = await bot.telegram.sendAudio(
      CHANNEL_ID,
      { source: filePath },
      {
        title: metadata.title,
        performer: metadata.artist,
        duration: metadata.duration,
      }
    );

    await Song.create({
      title: metadata.title,
      artist: metadata.artist,
      album: metadata.album,
      duration: metadata.duration,
      fileSize: metadata.fileSize,
      originalFileName: fileName,
      filePath: filePath,
      telegramFileId: message.audio.file_id,
      telegramMessageId: message.message_id,
      musicDirector: pathInfo.musicDirector,
      movieName: pathInfo.movieName,
      category: pathInfo.category,
      year: metadata.year,
      genre: metadata.genre,
    });

    console.log('   ✅ Uploaded & saved');
    stats.uploaded++;
  } catch (error) {
    console.log('   ❌ Error:', error.message);
    stats.failed++;
  }
}

// Main
async function main() {
  console.log('🎵 MP3 Mass Uploader\n');

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB Connected\n');

  if (!fs.existsSync(SONGS_FOLDER)) {
    console.error(`❌ Folder not found: ${SONGS_FOLDER}`);
    process.exit(1);
  }

  const files = getAllMp3Files(SONGS_FOLDER);
  stats.total = files.length;
  console.log(`📊 Found ${files.length} MP3 files\n`);

  for (let i = 0; i < files.length; i++) {
    await uploadSong(files[i], i + 1, files.length);
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log('\n═══════════════════════════════');
  console.log('📊 UPLOAD COMPLETE');
  console.log('═══════════════════════════════');
  console.log(`Total:    ${stats.total}`);
  console.log(`Uploaded: ${stats.uploaded}`);
  console.log(`Skipped:  ${stats.skipped}`);
  console.log(`Failed:   ${stats.failed}`);

  process.exit(0);
}

main();