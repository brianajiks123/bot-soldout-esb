# Program Structure

Bot automatic to manage soldout/unsoldout menu status in ESB ERP via Puppeteer, with notification & manual controll via Telegram.

```
├── index.js                        ← Main Entry point (scheduler + bot)
├── manualTrigger.js                ← CLI trigger manual
├── ecosystem.config.js             ← Configuration PM2
├── .env                            ← Environment variable
│
└── src/
    ├── config/
    │   ├── credentials.js          ← Username/password per brand
    │   ├── schedules.js            ← Setting cron jobs
    │   ├── orchestrationConfigs.js ← Build config from menus + credentials
    │   └── menus/
    │       ├── menuIdeo.js         ← Menu MAIN COURSE & Ramadhan Ideologis+
    │       ├── menuMaari.js        ← Menu FOOD - MAARI
    │       ├── menuPromo.js        ← Menu Promo
    │       └── menuBurjo.js        ← Menu Burjo Ngegas (3 cabang)
    │
    ├── core/
    │   ├── browser.js              ← Puppeteer singleton (launch/close/getPage)
    │   ├── puppeteerActions.js     ← All DOM actions (click, type, read, dll)
    │   ├── esbServices.js          ← Specific service of ESB ERP
    │   └── orchestrator.js         ← Main Logic processing soldout/unsoldout
    │
    ├── telegram/
    │   ├── telegramClient.js       ← HTTP client to Telegram API
    │   ├── notifications.js        ← Notification message template
    │   └── bot.js                  ← Polling loop & command handler
    │
    ├── utils/
    │   ├── logger.js               ← Winston logger (WIB timezone)
    │   ├── delay.js                ← Helper delay/sleep
    │   └── retry.js                ← Retry wrapper to failed operation
    │
    └── errors/
        ├── ClientError.js          ← Base error class
        └── InvariantError.js       ← Error to input validation
```
