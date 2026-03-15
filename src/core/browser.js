const puppeteer = require('puppeteer');
const path = require('path');
const logger = require('../utils/logger');

let browser = null;
let page = null;

/**
 * Open browser & navigate to URL
 * @param {string} pageUrl
 */
async function launch(pageUrl) {
  const userDataDir = path.resolve(__dirname, '../../UserData');
  browser = await puppeteer.launch({
    headless: false,
    userDataDir,
    args: ['--start-maximized'],
    defaultViewport: null,
  });
  page = await browser.newPage();
  await page.goto(pageUrl, { waitUntil: 'networkidle2' });
  logger.info(`Browser launched and navigated to ${pageUrl}`);
}

/**
 * Close browser
 */
async function close() {
  if (browser) {
    await browser.close();
    browser = null;
    page = null;
    logger.debug('Browser closed');
  }
}

/**
 * Get active instance page
 * @returns {import('puppeteer').Page}
 */
function getPage() {
  if (!page) throw new Error('Browser belum diinisialisasi. Panggil launch() terlebih dahulu.');
  return page;
}

module.exports = { launch, close, getPage };
