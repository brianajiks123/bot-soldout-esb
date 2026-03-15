/**
 * CLI trigger for soldout/unsoldout manual
 * Usage:
 *   node manualTrigger.js soldout
 *   node manualTrigger.js unsoldout
 */
require('dotenv').config();
const { soldoutOrchestrate } = require('./src/core/orchestrator');
const { configMenuRegulerSoldout, configMenuRegulerUnSoldout } = require('./src/config/orchestrationConfigs');

const command = process.argv[2]?.toLowerCase();

if (!command || !['soldout', 'unsoldout'].includes(command)) {
  console.log('Usage:');
  console.log('  node manualTrigger.js soldout');
  console.log('  node manualTrigger.js unsoldout');
  process.exit(1);
}

const isSoldout = command === 'soldout';
const config = isSoldout ? configMenuRegulerSoldout : configMenuRegulerUnSoldout;
const type = isSoldout ? 'SOLDOUT' : 'UNSOLDOUT';

console.log(`\nRunning ${type} manually...\n`);

soldoutOrchestrate(config, type)
  .then(() => { console.log(`\n✅ ${type} selesai!\n`); process.exit(0); })
  .catch((err) => { console.error(`\n❌ ${type} gagal: ${err.message}\n`); process.exit(1); });
