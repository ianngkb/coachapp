import nodemailer from 'nodemailer';

// Development email service for local testing with Mailpit
export class DevEmailService {
  private transporter: any;

  constructor() {
    // Create Mailpit SMTP transporter for development
    this.transporter = nodemailer.createTransport({
      host: 'localhost',
      port: 1025,
      secure: false,
      auth: null,
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendMagicLink(email: string, magicLink: string, isSignUp: boolean = false) {
    try {
      console.log('📧 [DEV] Sending magic link email via Mailpit:', { email, isSignUp });

      const subject = isSignUp
        ? 'Complete your Coach App registration'
        : 'Sign in to Coach App';

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin: 0;">Coach App</h1>
          </div>

          <h2 style="color: #333; margin-bottom: 20px;">
            ${isSignUp ? 'Complete your registration' : 'Sign in to your account'}
          </h2>

          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            ${isSignUp
              ? 'Welcome! Click the button below to complete your Coach App registration and access your account.'
              : 'Click the button below to securely sign in to your Coach App account.'
            }
          </p>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${magicLink}"
               style="background-color: #000; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
               ${isSignUp ? 'Complete Registration' : 'Sign In'}
            </a>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 14px; margin-bottom: 10px;">
              <strong>Security Note:</strong> This link will expire in 1 hour for your security.
            </p>
            <p style="color: #999; font-size: 14px; margin-bottom: 10px;">
              If you didn't request this email, you can safely ignore it.
            </p>
            <p style="color: #999; font-size: 14px;">
              <strong>Development Mode:</strong> This email was sent via Mailpit for local testing.
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #ccc; font-size: 12px;">
              Coach App • Local Development Environment
            </p>
          </div>
        </div>
      `;

      const info = await this.transporter.sendMail({
        from: '"Coach App" <auth@coachapp.local>',
        to: email,
        subject: subject,
        html: html
      });

      console.log('✅ [DEV] Magic link email sent successfully!');
      console.log(`📧 [DEV] Message ID: ${info.messageId}`);
      console.log(`🔗 [DEV] Magic link: ${magicLink}`);

      return {
        success: true,
        messageId: info.messageId,
        magicLink: magicLink
      };

    } catch (error: any) {
      console.error('❌ [DEV] Failed to send magic link email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendTestEmail(email: string) {
    try {
      const info = await this.transporter.sendMail({
        from: '"Coach App Test" <test@coachapp.local>',
        to: email,
        subject: 'Coach App - Email Service Test',
        html: `
          <h2>Email Service Test</h2>
          <p>This is a test email to verify the development email service is working correctly.</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <p>If you can see this email in Mailpit, the integration is working! 🎉</p>
        `
      });

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance for development
export const devEmailService = new DevEmailService();