# Bot Soldout ESB

## 1. Setup

```bash
# Install dependencies
npm install

# Copy & add konfigurasi environment
cp .env.example .env
```

Add file `.env`:
```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# ESB ERP
ESB_BASE_URL=erp_base_url

# Credentials ESB ERP
ESB_IDEO_USERNAME=your_ideo_username
ESB_IDEO_PASSWORD=your_ideo_password
ESB_BURJO_USERNAME=your_burjo_username
ESB_BURJO_PASSWORD=your_burjo_password

# Logger (default: debug)
LOG_LEVEL=debug
NODE_ENV=development
```

Create files inside "src/config/menus":
- menuBurjo.js
- menuIdeo.js
- menuMaari.js
- menuPromo.js

For templates of new menu, you can see poin 5 in below.

## 2. Running Bot

```bash
# Running scheduler + Telegram bot
npm start

# Or with PM2 (production)
pm2 start ecosystem.config.js
pm2 logs SOLDOUT-AUTOMATION
```

## 3. Trigger Manual via CLI

```bash
# Soldout all menu reguler
npm run soldout

# Unsoldout all menu reguler
npm run unsoldout
```

## 4. Controll via Telegram

Send message to bot:
- `/start` or `/menu` — showing controll panel
- `/status` — check bot status
- `/help`

## 5. Add New Menu

Edit file in `src/config/menus/` based on category:

```js
// Example: add new menu in menuIdeo.js
const menuMainCourseIdeo = [
  // ... exist menu
  {
    menuKeyword: 'Keyword Pencarian',
    menu: [{ name: 'Nama Menu Persis di ESB', soldout: true }],
  },
];
```

## 6. Add New Schedule

Edit `src/config/schedules.js`:

```js
const cronJobs = [
  // ... exist schedule
  {
    schedule: '0 9 * * *',           // cron expression
    label: 'NAMA JADWAL (09:00)',
    config: configMenuRegulerSoldout, // config from orchestrationConfigs.js
    type: 'SOLDOUT',                  // 'SOLDOUT' or 'UNSOLDOUT'
  },
];
```

## 7. Monitoring Log

```bash
# Log real-time
tail -f logs/combined.log

# Log error
tail -f logs/error.log
```
