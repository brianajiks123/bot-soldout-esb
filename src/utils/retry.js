const logger = require('./logger');
const { delay } = require('./delay');

const NAVIGATION_ERRORS = [
  'Execution context was destroyed',
  'Protocol error',
  'Session closed',
  'Target closed',
  'Navigation timeout',
];

/**
 * Running operation with automatic retry
 */
async function retryOperation(operation, maxRetries = 3, delayMs = 2000) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Attempt ${attempt}/${maxRetries}`);
      const result = await operation();
      logger.info(`Succeeded on attempt ${attempt}`);
      return result;
    } catch (error) {
      lastError = error;
      const msg = error.message || String(error);
      const isNavError = NAVIGATION_ERRORS.some((e) => msg.includes(e));

      if (attempt < maxRetries && (isNavError || true)) {
        logger.warn(`Attempt ${attempt} failed: ${msg}. Retrying in ${delayMs}ms...`);
        await delay(delayMs);
      } else {
        logger.error(`Failed after ${maxRetries} attempts: ${msg}`);
        throw error;
      }
    }
  }

  throw lastError;
}

module.exports = { retryOperation };
