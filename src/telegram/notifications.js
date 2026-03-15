const { sendMessage } = require('./telegramClient');
const logger = require('../utils/logger');

const STATUS_ICONS = { START: '🔄', SUCCESS: '✅', ERROR: '❌' };
const STATUS_LABELS = { START: 'Dimulai', SUCCESS: 'Berhasil', ERROR: 'Gagal' };

/**
 * Notification when bot running first
 */
async function sendStartNotification() {
  const message = `
  
  🚀 *IDEO Bot Started*

  📅 Waktu: ${new Date().toLocaleString('id-ID')}
  🤖 Status: Bot berhasil dijalankan

  ⏰ *Jadwal Otomatis:*
  • 11:00 - UNSOLDOUT MENU PROMO
  • 14:00 - SOLDOUT MENU PROMO
  • 15:50 - UNSOLDOUT MENU RAMADHAN
  • 16:00 - SOLDOUT MENU REGULER
  • 20:00 - UNSOLDOUT MENU REGULER
  • 20:07 - SOLDOUT MENU RAMADHAN`;

  return sendMessage(message);
}

/**
 * Notification status process soldout/unsoldout
 */
async function sendConfigNotification(configType, config, status, errorMessage = null) {
  try {
    const icon = STATUS_ICONS[status] || '❓';
    const label = STATUS_LABELS[status] || status;

    const branches = (config.menuSpecs || [])
      .map((s) => `• ${s.branchName} — ${s.categoryName}`)
      .join('\n');

    let message = `${icon} *Ideo Bot ${configType} ${label}*\n\n📅 ${new Date().toLocaleString('id-ID')}\n🏪 Cabang:\n${branches}`;
    if (status === 'ERROR' && errorMessage) message += `\n\n❌ Error: ${errorMessage}`;

    return sendMessage(message);
  } catch (err) {
    logger.error(`sendConfigNotification error: ${err.message}`);
    return false;
  }
}

/**
 * Notification when processing spesific branch
 */
async function sendBranchProcessingNotification(configType, branchName, categoryName) {
  try {
    const message = `🏪 *Processing Branch*\n\n📅 ${new Date().toLocaleString('id-ID')}\n🔄 Proses: ${configType}\n🏢 Branch: ${branchName}\n📂 Kategori: ${categoryName}\n\n⏳ Sedang memproses menu...`;
    return sendMessage(message);
  } catch (err) {
    logger.error(`sendBranchProcessingNotification error: ${err.message}`);
    return false;
  }
}

module.exports = { sendStartNotification, sendConfigNotification, sendBranchProcessingNotification };
