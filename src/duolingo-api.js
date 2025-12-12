// Duolingo API Client
// Uses unofficial endpoints - may break or violate ToS. Use at own risk.

const BASE_URL = 'https://www.duolingo.com';
const LOGIN_URL = `${BASE_URL}/login`;
const USER_DATA_URL = `${BASE_URL}/2017-06-30/users`;
const PURCHASE_URL = `${BASE_URL}/2017-06-30/users`;
const FREEZE_COST = 200;

export class DuolingoAuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DuolingoAuthError';
  }
}

export class DuolingoAPIError extends Error {
  constructor(message, statusCode = null) {
    super(message);
    this.name = 'DuolingoAPIError';
    this.statusCode = statusCode;
  }
}

export class InsufficientGemsError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InsufficientGemsError';
  }
}

export class AlreadyHaveFreezeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AlreadyHaveFreezeError';
  }
}

export class DuolingoAPI {
  constructor(username, password) {
    this.username = username;
    this.password = password;
    this.userId = null;
    this.jwt = null;
    this.userData = null;
    this.headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
    };
  }

  async login() {
    console.log('Logging in...');

    const response = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        login: this.username,
        password: this.password,
      }),
    });

    // Clear password from memory after use
    this.password = null;

    if (!response.ok) {
      if (response.status === 403) {
        throw new DuolingoAuthError('Login failed: Invalid credentials or account locked');
      }
      throw new DuolingoAuthError(`Login failed with status ${response.status}`);
    }

    const data = await response.json();

    const authHeader = response.headers.get('jwt');
    if (authHeader) {
      this.jwt = authHeader;
    }

    this.userId = data.sub || data.user_id;
    if (!this.userId) {
      throw new DuolingoAuthError('Login succeeded but no user ID found');
    }

    if (this.jwt) {
      this.headers['Authorization'] = `Bearer ${this.jwt}`;
    }

    console.log('Login successful!');
    return true;
  }

  async getUserData(fields = null) {
    if (!this.userId) {
      throw new DuolingoAPIError('Not logged in');
    }

    let url = `${USER_DATA_URL}/${this.userId}`;
    if (fields?.length) {
      url += `?fields=${fields.join(',')}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: this.headers,
    });

    if (!response.ok) {
      throw new DuolingoAPIError(`Failed to get user data: ${response.status}`, response.status);
    }

    this.userData = await response.json();
    return this.userData;
  }

  async getGemBalance() {
    await this.getUserData(['gems', 'lingots', 'totalXp', 'streak']);
    return this.userData.gems || this.userData.lingots || this.userData.gemConfig?.gems || 0;
  }

  async getStreakInfo() {
    await this.getUserData(['streak', 'streakData', 'xpGoal', 'inventory']);
    const streakData = this.userData.streakData || {};

    return {
      currentStreak: this.userData.streak || 0,
      hasStreakFreeze: this._checkHasStreakFreeze(),
      streakFreezeUsedToday: streakData.streakFreezeUsedToday || false,
      longestStreak: streakData.longestStreak?.length || 0,
    };
  }

  _checkHasStreakFreeze() {
    const streakData = this.userData?.streakData || {};
    if (streakData.currentStreakData?.streakProtection) {
      return true;
    }
    const freezeItem = this.userData?.inventory?.find(
      item => item.name === 'streak_freeze' || item.itemType === 'streak_freeze'
    );
    return freezeItem?.quantity > 0;
  }

  async purchaseStreakFreeze() {
    if (!this.userId) {
      throw new DuolingoAPIError('Not logged in');
    }

    const streakInfo = await this.getStreakInfo();
    if (streakInfo.hasStreakFreeze) {
      throw new AlreadyHaveFreezeError('Already have an active streak freeze');
    }

    const gems = await this.getGemBalance();
    if (gems < FREEZE_COST) {
      throw new InsufficientGemsError(`Not enough gems. Have ${gems}, need ${FREEZE_COST}`);
    }

    const response = await fetch(`${PURCHASE_URL}/${this.userId}/shop-items`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        name: 'streak_freeze',
        learningLanguage: this.userData.currentCourse?.learningLanguage || 'en',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.error === 'ALREADY_HAVE_STORE_ITEM') {
        throw new AlreadyHaveFreezeError('Already have an active streak freeze');
      }
      if (errorData.error === 'INSUFFICIENT_FUNDS') {
        throw new InsufficientGemsError('Not enough gems to purchase streak freeze');
      }
      throw new DuolingoAPIError(`Purchase failed: ${errorData.error || response.statusText}`, response.status);
    }

    console.log('Streak freeze purchased!');
    return response.json();
  }

  async refreshData() {
    return this.getUserData();
  }
}
