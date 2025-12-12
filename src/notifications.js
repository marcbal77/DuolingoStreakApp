// Email notifications for streak freeze events

import nodemailer from 'nodemailer';

export class EmailNotifier {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.recipientEmail = options.recipientEmail;
    this.transporter = null;

    if (this.enabled && options.smtpHost) {
      this.transporter = nodemailer.createTransport({
        host: options.smtpHost,
        port: options.smtpPort || 587,
        secure: options.smtpSecure || false,
        auth: { user: options.smtpUser, pass: options.smtpPass },
      });
      this.fromAddress = options.fromAddress || options.smtpUser;
    }
  }

  async _sendEmail(subject, body) {
    if (!this.enabled || !this.transporter || !this.recipientEmail) {
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to: this.recipientEmail,
        subject: `[Duo Streak Keeper] ${subject}`,
        text: body,
      });
      console.log(`Email sent: ${subject}`);
      return true;
    } catch (error) {
      console.error(`Failed to send email: ${error.message}`);
      return false;
    }
  }

  async sendPurchaseSuccess(remainingGems) {
    return this._sendEmail('Streak Freeze Purchased',
      `A streak freeze has been automatically purchased.\n\nRemaining gems: ${remainingGems}\n\nYour streak is protected!`);
  }

  async sendLowGemsWarning(currentGems, threshold) {
    return this._sendEmail('Low Gems Warning',
      `Your gem balance is running low.\n\nCurrent: ${currentGems}\nThreshold: ${threshold}\n\nConsider earning more gems!`);
  }

  async sendLowGemsAlert(currentGems, required) {
    return this._sendEmail('Unable to Purchase Streak Freeze',
      `Cannot purchase streak freeze - not enough gems.\n\nCurrent: ${currentGems}\nRequired: ${required}\n\nYour streak is NOT protected!`);
  }

  async sendBrokenStreakAlert() {
    return this._sendEmail('Streak Broken',
      'Your Duolingo streak appears to have been broken (returned to 0 days).\n\nPlease check your account.');
  }

  async sendErrorAlert(errorMessage, errorType) {
    // Sanitize error message to avoid leaking sensitive info
    const safeMessage = errorMessage.replace(/Bearer\s+\S+/gi, '[REDACTED]');
    return this._sendEmail(`Error: ${errorType}`,
      `An error occurred:\n\nType: ${errorType}\nMessage: ${safeMessage}`);
  }
}
