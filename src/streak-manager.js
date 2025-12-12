// Streak Manager - handles the logic for maintaining Duolingo streaks

import {
  DuolingoAuthError,
  DuolingoAPIError,
  InsufficientGemsError,
  AlreadyHaveFreezeError,
} from './duolingo-api.js';

const LOW_GEMS_THRESHOLD = 600;
const MIN_GEMS_REQUIRED = 200;

export class StreakManager {
  constructor(api, notifier = null, options = {}) {
    this.api = api;
    this.notifier = notifier;
    this.lowGemsThreshold = options.lowGemsThreshold || LOW_GEMS_THRESHOLD;
    this.minGemsRequired = options.minGemsRequired || MIN_GEMS_REQUIRED;
    this.notifiedLowGems = false;
    this.notifiedBrokenStreak = false;
  }

  async checkAndMaintainStreak(dryRun = false) {
    console.log('\n=== Checking Streak Status ===\n');

    try {
      await this.api.refreshData();
      const gems = await this.api.getGemBalance();
      const streakInfo = await this.api.getStreakInfo();

      console.log(`Current Streak: ${streakInfo.currentStreak} days`);
      console.log(`Gem Balance: ${gems}`);
      console.log(`Has Streak Freeze: ${streakInfo.hasStreakFreeze ? 'Yes' : 'No'}`);

      if (streakInfo.currentStreak === 0 && !this.notifiedBrokenStreak) {
        await this._handleBrokenStreak();
      }

      await this._checkGemBalanceWarnings(gems);

      if (streakInfo.hasStreakFreeze) {
        console.log('\nStreak freeze already active. No action needed.');
        return { success: true, action: 'none', message: 'Streak freeze already active', gems, streak: streakInfo.currentStreak };
      }

      return await this._purchaseFreezeIfPossible(gems, dryRun);
    } catch (error) {
      return this._handleError(error);
    }
  }

  async _purchaseFreezeIfPossible(gems, dryRun) {
    if (gems < this.minGemsRequired) {
      const message = `Not enough gems. Have ${gems}, need ${this.minGemsRequired}`;
      console.log(`\n${message}`);
      if (this.notifier) await this.notifier.sendLowGemsAlert(gems, this.minGemsRequired);
      return { success: false, action: 'none', message, gems };
    }

    if (dryRun) {
      console.log('\n[DRY RUN] Would purchase streak freeze for 200 gems');
      return { success: true, action: 'dry-run', message: 'Would purchase streak freeze (dry run)', gems };
    }

    console.log('\nPurchasing streak freeze...');
    await this.api.purchaseStreakFreeze();
    const newGems = await this.api.getGemBalance();
    const message = `Streak freeze purchased! Gems: ${gems} -> ${newGems}`;
    console.log(message);

    if (this.notifier) await this.notifier.sendPurchaseSuccess(newGems);
    return { success: true, action: 'purchased', message, gems: newGems };
  }

  async _checkGemBalanceWarnings(gems) {
    if (gems < this.lowGemsThreshold && !this.notifiedLowGems) {
      console.log(`\nWarning: Gem balance (${gems}) is below threshold (${this.lowGemsThreshold})`);
      if (this.notifier && gems >= this.minGemsRequired) {
        await this.notifier.sendLowGemsWarning(gems, this.lowGemsThreshold);
      }
      this.notifiedLowGems = true;
    } else if (gems >= this.lowGemsThreshold) {
      this.notifiedLowGems = false;
    }
  }

  async _handleBrokenStreak() {
    console.log('\nWarning: Streak appears to be broken (0 days)');
    if (this.notifier) await this.notifier.sendBrokenStreakAlert();
    this.notifiedBrokenStreak = true;
  }

  _handleError(error) {
    const isAlreadyHave = error instanceof AlreadyHaveFreezeError;
    if (isAlreadyHave) {
      return { success: true, action: 'none', message: error.message };
    }

    let errorType = 'unknown';
    if (error instanceof DuolingoAuthError) errorType = 'auth';
    else if (error instanceof InsufficientGemsError) errorType = 'gems';
    else if (error instanceof DuolingoAPIError) errorType = 'api';

    console.error(`\nError: ${error.message}`);
    if (this.notifier) this.notifier.sendErrorAlert(error.message, errorType).catch(() => {});

    return { success: false, action: 'error', message: error.message, errorType };
  }

  async getStatusReport() {
    try {
      await this.api.refreshData();
      const gems = await this.api.getGemBalance();
      const streakInfo = await this.api.getStreakInfo();

      return {
        success: true,
        streak: streakInfo.currentStreak,
        longestStreak: streakInfo.longestStreak,
        gems,
        hasStreakFreeze: streakInfo.hasStreakFreeze,
        streakFreezeUsedToday: streakInfo.streakFreezeUsedToday,
        lowGemsWarning: gems < this.lowGemsThreshold,
        canAffordFreeze: gems >= this.minGemsRequired,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
