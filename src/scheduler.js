const { Cron } = require('croner');
const logger = require('./utils/logger');
const { soldoutOrchestrate } = require('./core/orchestrator');
const { cronJobs } = require('./config/schedules');

/**
 * Register all cron jobs & return active job list
 */
function registerCronJobs() {
  return cronJobs.map(({ schedule, label, config, type }) => {
    const job = new Cron(schedule, async () => {
      logger.info(`[SCHEDULE] [START] ${label} — ${new Date().toLocaleString()}`);
      try {
        await soldoutOrchestrate(config, type);
        logger.info(`[SCHEDULE] [DONE] ${label}`);
        const next = job.nextRun();
        logger.info(`Next run: ${next ? next.toLocaleString() : 'none'}`);
      } catch (err) {
        logger.error(`[SCHEDULE] [ERROR] ${label} — ${err.message}`);
      }
    });

    const next = job.nextRun();
    logger.info(`Registered: ${label} (${schedule}), next: ${next ? next.toLocaleString() : 'none'}`);
    return { label, job };
  });
}

function showActiveCrons(runningCrons) {
  logger.info('=== Active Cron Jobs ===');
  runningCrons.forEach(({ label, job }) => {
    logger.info(`• ${label} — Next: ${job.nextRun()?.toLocaleString() || 'none'}`);
  });
}

module.exports = { registerCronJobs, showActiveCrons };
