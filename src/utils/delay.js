const logger = require('./logger');

/**
 * Delay execution until ms milidetik
 */
function delay(ms) {
  return new Promise((resolve) => {
    logger.debug(`Delaying for ${ms}ms...`);
    setTimeout(resolve, ms);
  });
}

module.exports = { delay };
