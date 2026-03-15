# Program Flow

## Automatic Flow (Scheduler)

```
index.js
  │
  ├─ registerCronJobs()         ← Register cron jobs
  ├─ sendStartNotification()    ← Send notification to Telegram
  └─ startBot()                 ← Start polling Telegram
        │
        └─ [Schedule is coming]
              │
              └─ soldoutOrchestrate(config, type)
                    │
                    ├─ sendConfigNotification('START')
                    ├─ checkLoginStatus()  → launch browser → open ESB
                    ├─ loginAction()       → if not login
                    ├─ gotoMasterMenu('branch-menu')
                    │
                    └─ [Loop each branch in config.menuSpecs]
                          │
                          ├─ gotoCategoryMenuByBranch()
                          ├─ sendBranchProcessingNotification()
                          │
                          └─ [Loop each menuConfig]
                                ├─ searchMenu(keyword)
                                ├─ getMenuRowCount()
                                ├─ processMenuRowForSoldout() × N rows
                                └─ clearSearchMenu()
                          │
                          └─ saveAndHandleAlert()
                    │
                    ├─ close browser
                    └─ sendConfigNotification('SUCCESS' | 'ERROR')
```

## Manual Flow via Telegram Bot

```
User send /start or /menu
  └─ sendMainMenu()  ← showing inline keyboard

User klik button (example: 🔴 SOLDOUT REGULER)
  └─ handleCallback('soldout_reguler')
        └─ runProcess('SOLDOUT REGULER', configMenuRegulerSoldout, 'SOLDOUT')
              └─ soldoutOrchestrate(...)  ← like automatic flow
```

## Manual Flow via CLI

```
node manualTrigger.js soldout
  └─ soldoutOrchestrate(configMenuRegulerSoldout, 'SOLDOUT')
```

## Automatic Schedule

| Time  | Action                  |
|-------|-------------------------|
| 11:00 | UNSOLDOUT Menu Promo    |
| 14:00 | SOLDOUT Menu Promo      |
| 15:50 | UNSOLDOUT Menu Ramadhan |
| 16:00 | SOLDOUT Menu Reguler    |
| 20:00 | UNSOLDOUT Menu Reguler  |
| 20:07 | SOLDOUT Menu Ramadhan   |

## Retry & Error Handling

- Orchestrator automatic retry to 2x if failed
- Each retry waiting `attempt × 5000ms` (exponential backoff)
- Error notification sent to Telegram if all retry is failed
- Browser always closed after each attempt (success or failed)
