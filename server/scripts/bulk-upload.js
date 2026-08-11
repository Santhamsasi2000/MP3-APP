require('dotenv').config({ path: '../.env' });
const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const mm = require('music-metadata');
const Song = require('../models/Song');

// ===== CONFIGURATION =====
const bot = new Telegraf(process.env.BOT_TOKEN);
const CHANNEL_ID = process.env.CHANNEL_ID;
const SONGS_FOLDER = process.env.SONGS_FOLDER;
const DELAY_MS = 1500;

// ===== STATISTICS =====
const stats = {
  total: 0,
  uploaded: 0,
  skipped: 0,
  failed: 0,
  startTime: Date.now(),
  currentSize: 0,
  totalSize: 0,
  failedFiles: [],
};

// ===== HELPER FUNCTIONS =====

// Get all MP3 files recursively
function getAllMp3Files(dirPath, arrayOfFiles = []) {
  try {
    const files = fs.readdirSync(dirPath);
    
    files.forEach((file) => {
      const fullPath = path.join(dirPath, file);
      try {
        if (fs.statSync(fullPath).isDirectory()) {
          arrayOfFiles = getAllMp3Files(fullPath, arrayOfFiles);
        } else if (file.toLowerCase().endsWith('.mp3')) {
          arrayOfFiles.push(fullPath);
        }
      } catch (err) {
        console.log(`⚠️  Skipping: ${file}`);
      }
    });
  } catch (error) {
    console.error(`Error reading ${dirPath}:`, error.message);
  }
  return arrayOfFiles;
}

// Get metadata from MP3
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

// ⭐ UPDATED: Extract info from folder name
function extractPathInfo(filePath) {
  const parts = filePath.split(path.sep);
  
  // Get the folder name (e.g., "Anirudh BGMs")
  const folderName = parts[parts.length - 2] || 'Unknown';
  
  // Determine category based on folder name
  let category = 'song'; // default
  let musicDirector = folderName;
  let genre = '';
  
  const lowerFolder = folderName.toLowerCase();
  
  // Check for BGM
  if (lowerFolder.includes('bgm')) {
    category = 'bgm';
    musicDirector = folderName.replace(/\s*bgms?\s*/gi, '').trim();
    genre = 'BGM';
  }
  // Check for Melody
  else if (lowerFolder.includes('melody')) {
    category = 'song';
    musicDirector = folderName.replace(/\s*melody\s*/gi, '').trim();
    genre = 'Melody';
  }
  // Check for other categories
  else if (lowerFolder.includes('hits')) {
    musicDirector = folderName.replace(/\s*hits\s*/gi, '').trim();
    genre = 'Hits';
  }
  else if (lowerFolder.includes('mass')) {
    musicDirector = folderName.replace(/\s*mass\s*/gi, '').trim();
    genre = 'Mass';
  }
  
  return {
    musicDirector: musicDirector,
    movieName: '', // Will be filled from metadata
    category: category,
    genre: genre,
    folderName: folderName,
  };
}

// Format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format time
function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours}h ${minutes}m ${secs}s`;
}

// Print progress
function printProgress(current, total) {
  const percent = Math.floor((current / total) * 100);
  const filled = Math.floor(percent / 5);
  const empty = 20 - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `[${bar}] ${percent}%`;
}

// Calculate ETA
function calculateETA() {
  const elapsed = Date.now() - stats.startTime;
  const processed = stats.uploaded + stats.failed;
  if (processed === 0) return 'calculating...';
  const avgTime = elapsed / processed;
  const remaining = stats.total - stats.uploaded - stats.failed - stats.skipped;
  const eta = avgTime * remaining;
  return formatTime(eta);
}

// ===== UPLOAD FUNCTION =====

async function uploadSong(filePath, index, total) {
  const fileName = path.basename(filePath);
  const stat = fs.statSync(filePath);
  stats.currentSize += stat.size;

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`📤 ${printProgress(index, total)} [${index}/${total}]`);
  console.log(`📁 ${fileName}`);
  console.log(`📊 Progress: ${formatBytes(stats.currentSize)}/${formatBytes(stats.totalSize)}`);
  
  if (stats.uploaded > 0) {
    console.log(`⏱️  ETA: ${calculateETA()}`);
  }

  try {
    // Check if already uploaded
    const existing = await Song.findOne({ filePath });
    if (existing) {
      console.log(`⏭️  SKIPPED - Already uploaded`);
      stats.skipped++;
      return;
    }

    // Check file size
    if (stat.size > 50 * 1024 * 1024) {
      console.log(`❌ TOO LARGE - ${formatBytes(stat.size)}`);
      stats.failed++;
      stats.failedFiles.push({ 
        file: fileName, 
        reason: `File too large (${formatBytes(stat.size)})` 
      });
      return;
    }

    // Get metadata
    console.log(`🔍 Reading metadata...`);
    const metadata = await getMetadata(filePath);
    const pathInfo = extractPathInfo(filePath);

    // Use album from metadata as movie name if available
    const movieName = metadata.album !== 'Unknown' ? metadata.album : '';

    console.log(`   Title:    ${metadata.title}`);
    console.log(`   Artist:   ${metadata.artist}`);
    console.log(`   Director: ${pathInfo.musicDirector}`);
    console.log(`   Movie:    ${movieName || 'Unknown'}`);
    console.log(`   Category: ${pathInfo.category}`);
    console.log(`   Genre:    ${pathInfo.genre || 'None'}`);
    console.log(`   Folder:   ${pathInfo.folderName}`);
    console.log(`   Size:     ${formatBytes(metadata.fileSize)}`);

    // Upload to Telegram
    console.log(`📤 Uploading to Telegram...`);
    const message = await bot.telegram.sendAudio(
      CHANNEL_ID,
      { source: filePath },
      {
        title: metadata.title,
        performer: metadata.artist,
        duration: metadata.duration,
        caption: `🎵 ${metadata.title}\n🎤 ${metadata.artist}\n📁 ${pathInfo.folderName}`,
      }
    );

    // Save to MongoDB
    console.log(`💾 Saving to database...`);
    await Song.create({
      title: metadata.title,
      artist: metadata.artist,
      album: movieName || 'Unknown',
      duration: metadata.duration,
      fileSize: metadata.fileSize,
      originalFileName: fileName,
      filePath: filePath,
      telegramFileId: message.audio.file_id,
      telegramMessageId: message.message_id,
      musicDirector: pathInfo.musicDirector,
      movieName: movieName,
      category: pathInfo.category,
      year: metadata.year,
      genre: pathInfo.genre || metadata.genre,
    });

    console.log(`✅ SUCCESS`);
    stats.uploaded++;
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    stats.failed++;
    stats.failedFiles.push({ 
      file: fileName, 
      reason: error.message 
    });
  }
}

// ===== PRINT FINAL STATS =====

function printFinalStats() {
  const elapsed = Date.now() - stats.startTime;
  
  console.log('\n' + '═'.repeat(60));
  console.log('📊 UPLOAD COMPLETE - FINAL REPORT');
  console.log('═'.repeat(60));
  console.log(`⏱️  Total Time:  ${formatTime(elapsed)}`);
  console.log(`📁 Total Files: ${stats.total}`);
  console.log(`✅ Uploaded:    ${stats.uploaded}`);
  console.log(`⏭️  Skipped:     ${stats.skipped}`);
  console.log(`❌ Failed:      ${stats.failed}`);
  console.log(`💾 Total Size:  ${formatBytes(stats.currentSize)}`);
  console.log('═'.repeat(60));

  if (stats.failedFiles.length > 0) {
    console.log('\n❌ Failed Files:');
    stats.failedFiles.slice(0, 10).forEach((item, i) => {
      console.log(`   ${i + 1}. ${item.file}`);
      console.log(`      Reason: ${item.reason}`);
    });
    
    if (stats.failedFiles.length > 10) {
      console.log(`   ... and ${stats.failedFiles.length - 10} more`);
    }
  }

  console.log('\n🎉 Upload session complete!\n');
}

// ===== MAIN FUNCTION =====

async function main() {
  console.log('\n' + '═'.repeat(60));
  console.log('🎵 MP3 BULK UPLOADER - ANIRUDH COLLECTION');
  console.log('═'.repeat(60));

  // Connect MongoDB
  console.log('\n🔌 Connecting to MongoDB...');
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Error:', error.message);
    process.exit(1);
  }

  // Check folder
  console.log(`\n📁 Songs folder: ${SONGS_FOLDER}`);
  if (!SONGS_FOLDER || !fs.existsSync(SONGS_FOLDER)) {
    console.error(`❌ Folder not found: ${SONGS_FOLDER}`);
    process.exit(1);
  }

  // Get all MP3 files
  console.log('🔍 Scanning for MP3 files...');
  const files = getAllMp3Files(SONGS_FOLDER);
  stats.total = files.length;

  if (files.length === 0) {
    console.log('\n❌ No MP3 files found!');
    process.exit(0);
  }

  // Calculate total size
  stats.totalSize = files.reduce((total, file) => {
    try {
      return total + fs.statSync(file).size;
    } catch {
      return total;
    }
  }, 0);

  // Group by folder
  const byFolder = {};
  files.forEach(file => {
    const folder = path.basename(path.dirname(file));
    byFolder[folder] = (byFolder[folder] || 0) + 1;
  });

  console.log(`\n📊 STATISTICS:`);
  console.log(`   Total Files: ${files.length}`);
  console.log(`   Total Size:  ${formatBytes(stats.totalSize)}`);
  console.log(`   Est. Time:   ${formatTime(files.length * (DELAY_MS + 3000))}`);

  console.log(`\n📂 Files by Folder:`);
  Object.entries(byFolder).forEach(([folder, count]) => {
    console.log(`   ${folder}: ${count} songs`);
  });

  console.log('\n📝 First 5 files:');
  files.slice(0, 5).forEach((file, i) => {
    console.log(`   ${i + 1}. ${path.basename(file)}`);
  });
  
  if (files.length > 5) {
    console.log(`   ... and ${files.length - 5} more`);
  }

  console.log('\n🚀 Starting upload in 5 seconds...');
  console.log('   Press Ctrl+C to cancel\n');
  
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Upload each file
  for (let i = 0; i < files.length; i++) {
    await uploadSong(files[i], i + 1, files.length);
    
    if (i < files.length - 1) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  printFinalStats();
  process.exit(0);
}

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Upload cancelled by user');
  printFinalStats();
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('\n❌ Error:', error.message);
  printFinalStats();
  process.exit(1);
});

main();