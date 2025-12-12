```
    ____              _____ __                  __      __ __
   / __ \__  ______  / ___// /_________  ____ _/ /__   / //_/__  ___  ____  ___  _____
  / / / / / / / __ \ \__ \/ __/ ___/ _ \/ __ `/ //_/  / ,< / _ \/ _ \/ __ \/ _ \/ ___/
 / /_/ / /_/ / /_/ /___/ / /_/ /  /  __/ /_/ / ,<    / /| /  __/  __/ /_/ /  __/ /
/_____/\__,_/\____//____/\__/_/   \___/\__,_/_/|_|  /_/ |_\___/\___/ .___/\___/_/
                                                                  /_/    [JavaScript]
```

# 🔥 Duo Streak Keeper JS

### 🌍 Keep Your Language Learning Streak Alive 📚

> ⚠️ **Important:** This is an educational project demonstrating API integration with Node.js. It uses unofficial Duolingo endpoints that may change without notice. Use at your own risk — automated use may violate Duolingo's Terms of Service.

---

## 🦉 What Does This Do?

This tool automatically purchases streak freezes for your Duolingo account when needed, protecting your learning progress. Run it daily and it will:

1. ✅ Log into your Duolingo account
2. ✅ Check if you have an active streak freeze
3. ✅ Purchase one (200 gems) if you don't
4. ✅ Send you an email notification (optional)

**No more losing your streak because you forgot to practice!**

---

## 🎓 Quick Start (Non-Coders Welcome!)

### What You'll Need
- **Node.js 18+** — [Download here](https://nodejs.org/)
- **A Duolingo account** with 200+ gems
- **15 minutes** to set up

### Step-by-Step Setup

**1. Download the project**
```bash
git clone https://github.com/marcbal77/DuolingoStreakApp.git
cd DuolingoStreakApp
```

**2. Install dependencies**
```bash
npm install
```

**3. Create your config file**
```bash
cp .env.example .env
```

**4. Add your credentials**

Open `.env` in any text editor and fill in:
```env
DUOLINGO_USERNAME=your_email_or_username
DUOLINGO_PASSWORD=your_password
```

**5. Test it out**
```bash
npm run dry-run
```

**6. Run for real**
```bash
npm start
```

---

## 💻 For Developers

### Project Structure
```
duo-streak-keeper-js/
├── index.js              # CLI entry point
├── src/
│   ├── duolingo-api.js   # API client
│   ├── streak-manager.js # Business logic
│   └── notifications.js  # Email alerts
├── .env.example          # Config template
└── package.json
```

### CLI Options
```bash
node index.js              # Run streak keeper
node index.js --dry-run    # Preview without purchasing
node index.js --status     # Check current streak info
node index.js --no-email   # Disable email notifications
node index.js --help       # Show all options
```

### npm Scripts
```bash
npm start      # Run streak keeper
npm run dry-run   # Preview mode
npm run status    # Check status only
```

---

## 📧 Email Notifications

Get alerts when:
- ✅ Streak freeze purchased
- ⚠️ Gem balance running low
- ❌ Unable to purchase (not enough gems)
- 💔 Streak broken

**Gmail Setup:**
1. Enable [2-Step Verification](https://myaccount.google.com/security)
2. Create an [App Password](https://support.google.com/accounts/answer/185833)
3. Add to `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
NOTIFICATION_EMAIL=your_email@gmail.com
```

---

## ⏰ Automation

### Cron (Mac/Linux)
Run daily at 11 PM:
```bash
crontab -e
```
Add:
```
0 23 * * * cd /path/to/DuolingoStreakApp && node index.js >> /dev/null 2>&1
```

### GitHub Actions (Free & Serverless)
Create `.github/workflows/streak.yml`:
```yaml
name: Maintain Streak

on:
  schedule:
    - cron: '0 23 * * *'
  workflow_dispatch:

jobs:
  maintain:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: node index.js
        env:
          DUOLINGO_USERNAME: ${{ secrets.DUOLINGO_USERNAME }}
          DUOLINGO_PASSWORD: ${{ secrets.DUOLINGO_PASSWORD }}
```

---

## 🔒 Security & Privacy

- ✅ Credentials stored locally in `.env` (never committed)
- ✅ Password cleared from memory after login
- ✅ No data sent anywhere except Duolingo's servers
- ✅ Open source — inspect the code yourself

---

## ⚖️ Legal

**Disclaimer:** This software is provided "as is" without warranty. The author is not responsible for any consequences of using this tool, including but not limited to account suspension.

**Terms of Service:** Using automated tools with Duolingo may violate their ToS. Use at your own risk for educational/personal purposes only.

---

## 🐍 Looking for Python?

This is the **JavaScript/Node.js** version. There's also a Python version available:

| Version | Repository | Best For |
|---------|------------|----------|
| **JavaScript** (you are here) | [DuolingoStreakApp](https://github.com/marcbal77/DuolingoStreakApp) | Node.js users, web developers |
| **Python** | [duo-streak-keeper](https://github.com/marcbal77/duo-streak-keeper) | Python users, data scientists |

Both versions have the same features — pick whichever language you prefer!

---

## 📝 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

Found a bug? Have an idea? [Open an issue](https://github.com/marcbal77/DuolingoStreakApp/issues) or submit a PR!

---

<p align="center">
  <i>Built with ☕ to protect 🔥 streaks</i>
</p>
