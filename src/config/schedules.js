const {
  configMenuRegulerSoldout,
  configMenuRegulerUnSoldout,
  configMenuRamadhanSoldout,
  configMenuRamadhanUnSoldout,
  configPromoSoldout,
  configPromoUnSoldout,
} = require('./orchestrationConfigs');

/**
 * All cron jobs will be running automaticly
 */
const cronJobs = [
  { schedule: '0 11 * * *',  label: 'PROMO UNSOLDOUT (11:00)',          config: configPromoUnSoldout,          type: 'UNSOLDOUT' },
  { schedule: '0 14 * * *',  label: 'PROMO SOLDOUT (14:00)',             config: configPromoSoldout,            type: 'SOLDOUT'   },
  { schedule: '50 15 * * *', label: 'MENU RAMADHAN UNSOLDOUT (15:50)',   config: configMenuRamadhanUnSoldout,   type: 'UNSOLDOUT' },
  { schedule: '0 16 * * *',  label: 'MENU REGULER SOLDOUT (16:00)',      config: configMenuRegulerSoldout,      type: 'SOLDOUT'   },
  { schedule: '0 20 * * *',  label: 'MENU REGULER UNSOLDOUT (20:00)',    config: configMenuRegulerUnSoldout,    type: 'UNSOLDOUT' },
  { schedule: '7 20 * * *',  label: 'MENU RAMADHAN SOLDOUT (20:07)',     config: configMenuRamadhanSoldout,     type: 'SOLDOUT'   },
];

module.exports = { cronJobs };
