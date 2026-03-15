const esb = require('./esbServices');
const actions = require('./puppeteerActions');
const { close } = require('./browser');
const { delay } = require('../utils/delay');
const logger = require('../utils/logger');
const { sendConfigNotification, sendBranchProcessingNotification } = require('../telegram/notifications');

const SEARCH_INPUT = "input[placeholder='Search Menu Name or Short Name']";
const MAX_RETRIES = 2;

/**
 * Process one branch: search keyword → set soldout → save
 */
async function processBranch(element, categoryId, configType) {
  await sendBranchProcessingNotification(configType, element.branchName, element.categoryName);

  for (const menuConfig of element.configMenu) {
    try {
      logger.info(`Searching keyword: "${menuConfig.menuKeyword}"`);
      await esb.searchMenu(menuConfig.menuKeyword);
      await delay(3000);

      const rowCount = await actions.getMenuRowCount(
        `#branch-menu-detail-table_${categoryId} > tbody tr`
      );

      if (rowCount === 0) {
        logger.warn(`No rows found for keyword "${menuConfig.menuKeyword}"`);
        continue;
      }

      for (let i = 0; i < rowCount; i++) {
        try {
          await actions.processMenuRowForSoldout(i, categoryId, menuConfig.menu);
        } catch (err) {
          logger.error(`Error on row ${i}: ${err.message}`);
        }
      }

      await esb.clearSearchMenu();
    } catch (err) {
      logger.error(`Error processing keyword "${menuConfig.menuKeyword}": ${err.message}`);
    }
  }
}

/**
 * Main orchestrator: login → navigate → process all branch → save
 */
async function soldoutOrchestrate(config, configType = 'UNKNOWN') {
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      logger.info(`[ATTEMPT ${attempt}/${MAX_RETRIES}] Starting ${configType}...`);
      await sendConfigNotification(configType, config, 'START');

      const isLoggedIn = await esb.checkLoginStatus();
      if (!isLoggedIn) await esb.loginAction(config.credentials);

      await esb.gotoMasterMenu('branch-menu');

      for (const element of config.menuSpecs) {
        try {
          await delay(2000);
          const categoryId = await esb.gotoCategoryMenuByBranch(element.branchName, element.categoryName, 'edit');
          logger.info(`Category ID: ${categoryId}`);
          await delay(3000);

          await processBranch(element, categoryId, configType);

          await delay(2000);
          await esb.saveAndHandleAlert();
          await delay(2000);
        } catch (err) {
          logger.error(`Error on branch "${element.branchName}": ${err.message}`);
        }
      }

      await close();
      await sendConfigNotification(configType, config, 'SUCCESS');
      logger.info(`[SUCCESS] ${configType} completed`);
      return;
    } catch (err) {
      lastError = err;
      logger.error(`[ATTEMPT ${attempt}/${MAX_RETRIES}] Error: ${err.message}`);
      try { await close(); } catch (_) {}

      if (attempt < MAX_RETRIES) {
        const wait = attempt * 5000;
        logger.info(`Waiting ${wait}ms before retry...`);
        await delay(wait);
      }
    }
  }

  await sendConfigNotification(configType, config, 'ERROR', lastError.message);
  throw lastError;
}

module.exports = { soldoutOrchestrate };
