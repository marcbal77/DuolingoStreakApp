# Duo Streak Keeper (JavaScript)

Automatically protect your Duolingo streak by purchasing streak freezes when you need them.

> Looking for the Python version? Check out [duo-streak-keeper](https://github.com/marcbal77/duo-streak-keeper)

## Features

- **Automatic Protection** — Purchases streak freezes when you don't have one active
- **Email Notifications** — Get alerts for purchases, low gems, and errors
- **Dry Run Mode** — Preview actions without making actual purchases
- **Status Check** — Monitor your streak and gem balance without taking action

## Requirements

- Node.js 18.0.0 or higher
- A Duolingo account with sufficient gems (200 per streak freeze)

## Installation

```bash
git clone https://github.com/marcbal77/DuolingoStreakApp.git
cd DuolingoStreakApp
npm install
```

## Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your credentials:
   ```env
   DUOLINGO_USERNAME=your_username_or_email
   DUOLINGO_PASSWORD=your_password
   ```

3. (Optional) Configure email notifications for alerts:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   NOTIFICATION_EMAIL=your_email@gmail.com
   ```

   For Gmail, you'll need an [App Password](https://support.google.com/accounts/answer/185833).

## Usage

### Check and Maintain Streak

```bash
# Run the streak keeper
npm start

# Or directly
node index.js
```

### Preview Mode (Dry Run)

```bash
npm run dry-run

# Or
node index.js --dry-run
```

### Status Check Only

```bash
npm run status

# Or
node index.js --status
```

### Command Line Options

| Option | Description |
|--------|-------------|
| `-d, --dry-run` | Preview actions without making purchases |
| `-s, --status` | Show current streak status only |
| `--no-email` | Disable email notifications |
| `-V, --version` | Output version number |
| `-h, --help` | Display help |

## Automation

### Cron (Linux/macOS)

Run daily at 11 PM:

```bash
crontab -e
```

Add:
```
0 23 * * * cd /path/to/DuolingoStreakApp && /usr/bin/node index.js >> /var/log/duo-streak.log 2>&1
```

### Task Scheduler (Windows)

1. Open Task Scheduler
2. Create a new task to run `node index.js` daily
3. Set the working directory to the project folder

### GitHub Actions

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

Add your credentials as repository secrets.

## How It Works

1. Logs into your Duolingo account using the API
2. Checks if you have an active streak freeze
3. If no freeze is active and you have 200+ gems, purchases one
4. Sends email notification (if configured)

## Disclaimer

**This tool uses unofficial Duolingo API endpoints.** Using this tool:

- May violate Duolingo's Terms of Service
- Could result in account suspension
- Is at your own risk

The API endpoints may change without notice, which could break this tool.

## License

MIT License — see [LICENSE](LICENSE) for details.
