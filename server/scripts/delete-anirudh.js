require('dotenv').config({ path: '../.env' });
const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
const Song = require('../models/Song');

const bot = new Telegraf(process.env.BOT_TOKEN);
const CHANNEL_ID = process.env.CHANNEL_ID;

// ⚠️ Delete songs where musicDirector = "Anirudh"
const DIRECTOR_TO_DELETE = 'Anirudh';

async function main() {
  console.log('\n' + '═'.repeat(60));
  console.log(`🗑️  DELETE ALL "${DIRECTOR_TO_DELETE}" SONGS`);
  console.log('═'.repeat(60));

  // Connect MongoDB
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB Connected\n');

  // Find all Anirudh songs
  const songsToDelete = await Song.find({ 
    musicDirector: DIRECTOR_TO_DELETE 
  });

  console.log(`📊 Found ${songsToDelete.length} songs to delete`);
  console.log(`📁 Director: ${DIRECTOR_TO_DELETE}\n`);

  if (songsToDelete.length === 0) {
    console.log('✅ No songs to delete');
    process.exit(0);
  }

  // Show sample songs
  console.log('📝 Sample songs (first 5):');
  songsToDelete.slice(0, 5).forEach((song, i) => {
    console.log(`   ${i + 1}. ${song.title}`);
  });
  if (songsToDelete.length > 5) {
    console.log(`   ... and ${songsToDelete.length - 5} more`);
  }

  console.log('\n⚠️  Starting deletion in 5 seconds...');
  console.log('   Press Ctrl+C to cancel\n');
  await new Promise(resolve => setTimeout(resolve, 5000));

  let deletedFromDB = 0;
  let deletedFromTelegram = 0;
  let failed = 0;

  for (let i = 0; i < songsToDelete.length; i++) {
    const song = songsToDelete[i];
    console.log(`\n[${i + 1}/${songsToDelete.length}] ${song.title}`);

    try {
      // Delete from Telegram
      try {
        await bot.telegram.deleteMessage(CHANNEL_ID, song.telegramMessageId);
        console.log('  ✅ Deleted from Telegram');
        deletedFromTelegram++;
      } catch (err) {
        console.log('  ⚠️  Telegram delete failed:', err.message);
      }

      // Delete from MongoDB
      await Song.deleteOne({ _id: song._id });
      console.log('  ✅ Deleted from Database');
      deletedFromDB++;

      // Wait 500ms between deletions
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.log('  ❌ Error:', error.message);
      failed++;
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('📊 DELETION COMPLETE');
  console.log('═'.repeat(60));
  console.log(`📁 Total songs:      ${songsToDelete.length}`);
  console.log(`✅ Deleted from DB:  ${deletedFromDB}`);
  console.log(`✅ Deleted Telegram: ${deletedFromTelegram}`);
  console.log(`❌ Failed:           ${failed}`);
  console.log('═'.repeat(60));

  console.log('\n🎉 Cleanup complete!');
  console.log('👉 Now you can re-upload the Anirudh folder\n');

  process.exit(0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});