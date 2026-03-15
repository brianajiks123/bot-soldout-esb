const { sendMessage, answerCallbackQuery, getUpdates, validateToken, isConfigured } = require('./telegramClient');
const { soldoutOrchestrate } = require('../core/orchestrator');
const {
  configMenuRegulerSoldout,
  configMenuRegulerUnSoldout,
  configMenuRamadhanSoldout,
  configMenuRamadhanUnSoldout,
} = require('../config/orchestrationConfigs');
const logger = require('../utils/logger');
const { delay } = require('../utils/delay');

let isProcessing = false;
let currentProcess = null;

// ─── Keyboard ─────────────────────────────────────────────────────────────────

const MAIN_KEYBOARD = {
  inline_keyboard: [
    [
      { text: '🔴 SOLDOUT REGULER',   callback_data: 'soldout_reguler' },
      { text: '🟢 UNSOLDOUT REGULER', callback_data: 'unsoldout_reguler' },
    ],
    [
      { text: '🔴 SOLDOUT RAMADHAN',   callback_data: 'soldout_ramadhan' },
      { text: '🟢 UNSOLDOUT RAMADHAN', callback_data: 'unsoldout_ramadhan' },
    ],
    [
      { text: '📊 Status', callback_data: 'status' },
      { text: '❓ Help',   callback_data: 'help' },
    ],
  ],
};

async function sendMainMenu() {
  const message = `🤖 *IDEO Bot - Manual Control*

Pilih aksi yang ingin dijalankan:

🔴 *SOLDOUT* - Menu tidak tersedia
🟢 *UNSOLDOUT* - Menu tersedia kembali
📊 *Status* - Cek status bot
❓ *Help* - Bantuan penggunaan`;

  return sendMessage(message, MAIN_KEYBOARD);
}

// ─── Process Runner ───────────────────────────────────────────────────────────

async function runProcess(label, config, type) {
  if (isProcessing) {
    await sendMessage(`⚠️ *Proses sedang berjalan*\n\nSaat ini: ${currentProcess}\nMohon tunggu.`);
    return;
  }

  isProcessing = true;
  currentProcess = label;
  const icon = type === 'SOLDOUT' ? '🔴' : '🟢';
  await sendMessage(`${icon} *Memulai ${label}...*\n\nMohon tunggu beberapa menit.`);

  try {
    await soldoutOrchestrate(config, type);
  } catch (err) {
    await sendMessage(`❌ *${label} gagal!*\n\nError: ${err.message}`);
    await sendMainMenu();
  } finally {
    isProcessing = false;
    currentProcess = null;
  }
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

const CALLBACK_HANDLERS = {
  soldout_reguler:   () => runProcess('SOLDOUT REGULER',   configMenuRegulerSoldout,   'SOLDOUT'),
  unsoldout_reguler: () => runProcess('UNSOLDOUT REGULER', configMenuRegulerUnSoldout, 'UNSOLDOUT'),
  soldout_ramadhan:  () => runProcess('SOLDOUT RAMADHAN',  configMenuRamadhanSoldout,  'SOLDOUT'),
  unsoldout_ramadhan:() => runProcess('UNSOLDOUT RAMADHAN',configMenuRamadhanUnSoldout,'UNSOLDOUT'),
  status: async () => {
    const status = isProcessing ? '🔄 Sedang berjalan' : '✅ Siap';
    await sendMessage(`📊 *Status Bot*\n\nStatus: ${status}\nProses: ${currentProcess || 'Tidak ada'}\nWaktu: ${new Date().toLocaleString('id-ID')}`);
    await sendMainMenu();
  },
  help: async () => {
    await sendMessage(`
      
      ❓ *Bantuan Penggunaan*

      *Button yang Tersedia:*
      🔴 SOLDOUT - Aktifkan soldout (menu tidak tersedia)
      🟢 UNSOLDOUT - Nonaktifkan soldout (menu tersedia)
      📊 Status - Cek status bot

      *Catatan:*
      • Proses memakan waktu 3-5 menit
      • Hanya 1 proses yang bisa berjalan bersamaan
      • Notifikasi dikirim otomatis

      *Jadwal Otomatis:*
      • 11:00 - UNSOLDOUT PROMO
      • 14:00 - SOLDOUT PROMO
      • 15:50 - UNSOLDOUT RAMADHAN
      • 16:00 - SOLDOUT REGULER
      • 20:00 - UNSOLDOUT REGULER
      • 20:07 - SOLDOUT RAMADHAN`
    );
    
    await sendMainMenu();
  },
};

async function handleCallback(callbackQuery) {
  await answerCallbackQuery(callbackQuery.id);
  const handler = CALLBACK_HANDLERS[callbackQuery.data];
  if (handler) await handler();
  else await sendMessage('❌ Unknown command');
}

async function handleMessage(message) {
  const text = message.text?.toLowerCase() || '';
  if (text === '/start' || text === '/menu') await sendMainMenu();
  else if (text === '/status') await CALLBACK_HANDLERS.status();
  else if (text === '/help') await CALLBACK_HANDLERS.help();
}

// ─── Polling Loop ─────────────────────────────────────────────────────────────

async function startBot() {
  logger.info('Starting Telegram Bot...');

  if (!isConfigured()) {
    logger.warn('Telegram tidak dikonfigurasi. Bot tidak berjalan.');
    return;
  }

  const isValid = await validateToken();
  if (!isValid) {
    logger.warn('Bot token tidak valid. Bot tidak berjalan.');
    return;
  }

  logger.info('Telegram bot siap. Menunggu perintah...');
  let offset = 0;

  while (true) {
    try {
      const updates = await getUpdates(offset);
      for (const update of updates) {
        offset = update.update_id + 1;
        if (update.callback_query) await handleCallback(update.callback_query);
        if (update.message?.text) await handleMessage(update.message);
      }
    } catch (err) {
      logger.error(`Bot loop error: ${err.message}`);
      await delay(5000);
    }
  }
}

module.exports = { startBot, sendMainMenu };
