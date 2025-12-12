#!/usr/bin/env node

// Duo Streak Keeper - auto-purchase streak freezes for Duolingo
// Uses unofficial API - may break or violate ToS. Use at own risk.

import { program } from 'commander';
import dotenv from 'dotenv';
import { DuolingoAPI, DuolingoAuthError } from './src/duolingo-api.js';
import { StreakManager } from './src/streak-manager.js';
import { EmailNotifier } from './src/notifications.js';

dotenv.config();

const config = {
  username: process.env.DUOLINGO_USERNAME,
  password: process.env.DUOLINGO_PASSWORD,
  lowGemsThreshold: parseInt(process.env.LOW_GEMS_THRESHOLD) || 600,
  minGemsRequired: parseInt(process.env.MIN_GEMS_REQUIRED) || 200,
  email: {
    enabled: !!process.env.SMTP_HOST,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: parseInt(process.env.SMTP_PORT) || 587,
    smtpSecure: process.env.SMTP_SECURE === 'true',
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    fromAddress: process.env.FROM_ADDRESS,
    recipientEmail: process.env.NOTIFICATION_EMAIL,
  },
};

program
  .name('duo-streak-keeper')
  .description('Automatically protect your Duolingo streak')
  .version('1.0.0')
  .option('-d, --dry-run', 'Preview actions without making purchases')
  .option('-s, --status', 'Show current streak status only')
  .option('--no-email', 'Disable email notifications')
  .parse();

const options = program.opts();

async function main() {
  if (!config.username || !config.password) {
    console.error('Error: Missing credentials. Set DUOLINGO_USERNAME and DUOLINGO_PASSWORD in .env');
    process.exit(1);
  }

  const api = new DuolingoAPI(config.username, config.password);
  const notifier = options.email !== false ? new EmailNotifier(config.email) : null;
  const manager = new StreakManager(api, notifier, {
    lowGemsThreshold: config.lowGemsThreshold,
    minGemsRequired: config.minGemsRequired,
  });

  try {
    await api.login();

    if (options.status) {
      const status = await manager.getStatusReport();
      if (!status.success) {
        console.error(`Failed to get status: ${status.error}`);
        process.exit(1);
      }

      console.log('\n=== Duolingo Streak Status ===\n');
      console.log(`Current Streak:     ${status.streak} days`);
      console.log(`Longest Streak:     ${status.longestStreak} days`);
      console.log(`Gem Balance:        ${status.gems}`);
      console.log(`Streak Freeze:      ${status.hasStreakFreeze ? 'Active' : 'Not Active'}`);
      console.log(`Freeze Used Today:  ${status.streakFreezeUsedToday ? 'Yes' : 'No'}`);
      console.log(`Can Afford Freeze:  ${status.canAffordFreeze ? 'Yes' : 'No'}`);
      if (status.lowGemsWarning) console.log('\n[Warning] Gem balance is low!');
    } else {
      if (options.dryRun) console.log('[DRY RUN MODE]\n');

      const result = await manager.checkAndMaintainStreak(options.dryRun);
      console.log('\n=== Result ===');
      console.log(`Success: ${result.success}`);
      console.log(`Action: ${result.action}`);
      console.log(`Message: ${result.message}`);

      if (!result.success) process.exit(1);
    }
  } catch (error) {
    if (error instanceof DuolingoAuthError) {
      console.error(`\nAuth failed: ${error.message}`);
    } else {
      console.error(`\nError: ${error.message}`);
    }
    if (notifier) await notifier.sendErrorAlert(error.message, error.name || 'UnknownError');
    process.exit(1);
  }
}

main();
