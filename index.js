/**
 * Main entry point: Scheduler + Telegram Bot
 * Running with: node index.js
 */
require('dotenv').config();
const logger = require('./src/utils/logger');
const { sendStartNotification } = require('./src/telegram/notifications');
const { registerCronJobs, showActiveCrons } = require('./src/scheduler');
const { startBot } = require('./src/telegram/bot');

async function main() {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║     IDEO BOT - SCHEDULER + TELEGRAM      ║');
  console.log('╚══════════════════════════════════════════╝\n');

  const runningCrons = registerCronJobs();
  showActiveCrons(runningCrons);

  const notifSent = await sendStartNotification();
  logger.info(notifSent ? 'Notifikasi start terkirim' : 'Gagal kirim notifikasi start');

  console.log('\n📱 Starting Telegram Bot...');
  console.log('   Kirim /start atau /menu untuk panel kontrol\n');

  await startBot();
}

main().catch((err) => {
  logger.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
