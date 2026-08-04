require('dotenv').config();
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);
const CHANNEL_ID = process.env.CHANNEL_ID;

async function testConnection() {
  try {
    console.log('🔧 Testing Telegram Bot Connection...\n');
    console.log(`Bot Token: ${process.env.BOT_TOKEN.substring(0, 20)}...`);
    console.log(`Channel ID: ${CHANNEL_ID}\n`);

    // Send test message to channel
    const message = await bot.telegram.sendMessage(
      CHANNEL_ID,
      '🎵 Test from MP3 Uploader Bot!\n\n✅ Connection successful!'
    );

    console.log('✅ Test message sent successfully!');
    console.log(`Message ID: ${message.message_id}`);
    console.log('\n🎉 Bot is working correctly!');
    console.log('👉 Check your Telegram channel to see the test message');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔍 Possible Issues:');
    console.log('1. Wrong Bot Token');
    console.log('2. Wrong Channel ID');
    console.log('3. Bot not added as admin');
    console.log('4. Bot has no permissions');
    process.exit(1);
  }
}

testConnection();