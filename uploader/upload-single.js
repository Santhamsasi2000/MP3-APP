require('dotenv').config();
const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require('path');

const bot = new Telegraf(process.env.BOT_TOKEN);
const CHANNEL_ID = process.env.CHANNEL_ID;

const MP3_FILE_PATH = 'C:/Test-Songs/Vishwanath - Sons Teaser Theme.mp3';

async function uploadSingleSong() {
  try {
    console.log('🎵 Single Song Upload Test\n');
    
    // Check if file exists
    if (!fs.existsSync(MP3_FILE_PATH)) {
      console.error(`❌ File not found: ${MP3_FILE_PATH}`);
      console.log('👉 Please update MP3_FILE_PATH in the script');
      process.exit(1);
    }

    // Get file info
    const fileName = path.basename(MP3_FILE_PATH);
    const fileSize = fs.statSync(MP3_FILE_PATH).size;
    const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2);

    console.log(`📁 File: ${fileName}`);
    console.log(`📏 Size: ${fileSizeMB} MB`);
    console.log(`📤 Uploading to Telegram...\n`);

    // Upload to Telegram
    const message = await bot.telegram.sendAudio(
      CHANNEL_ID,
      { source: MP3_FILE_PATH },
      {
        title: 'Test Song',
        performer: 'Test Artist',
        caption: `🎵 Test Upload\n📁 ${fileName}\n📏 ${fileSizeMB} MB`,
      }
    );

    console.log('✅ Upload Successful!\n');
    console.log('📊 Details:');
    console.log(`   Message ID: ${message.message_id}`);
    console.log(`   File ID: ${message.audio.file_id}`);
    console.log(`   Duration: ${message.audio.duration}s`);
    console.log(`   Title: ${message.audio.title}`);
    console.log(`   Performer: ${message.audio.performer}`);
    console.log('\n🎉 Check your Telegram channel!');
    console.log('👉 Song should play in Telegram');

    // Save file_id for later use
    console.log('\n💾 IMPORTANT - Save this File ID:');
    console.log(`   ${message.audio.file_id}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Upload Error:', error.message);
    
    if (error.message.includes('file too big')) {
      console.log('\n⚠️ File is too large!');
      console.log('   Bot API limit: 50 MB');
      console.log('   Your file: ' + fileSizeMB + ' MB');
    }
    
    process.exit(1);
  }
}

uploadSingleSong();