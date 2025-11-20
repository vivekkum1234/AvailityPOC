import twilio from 'twilio';
import nodemailer from 'nodemailer';

interface NotificationConfig {
  // Twilio SMS
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
  alertPhoneNumber?: string;
  
  // Email (Gmail)
  emailUser?: string;
  emailPassword?: string;
  alertEmail?: string;
}

export class NotificationService {
  private twilioClient: any;
  private emailTransporter: any;
  private config: NotificationConfig;

  constructor() {
    this.config = {
      // Twilio Configuration
      twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
      twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
      twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
      alertPhoneNumber: process.env.ALERT_PHONE_NUMBER,
      
      // Email Configuration (Gmail)
      emailUser: process.env.NOTIFICATION_EMAIL_USER,
      emailPassword: process.env.NOTIFICATION_EMAIL_PASSWORD,
      alertEmail: process.env.ALERT_EMAIL,
    };

    // Initialize Twilio client
    if (this.config.twilioAccountSid && this.config.twilioAuthToken) {
      this.twilioClient = twilio(
        this.config.twilioAccountSid,
        this.config.twilioAuthToken
      );
    }

    // Initialize Email transporter (Gmail)
    if (this.config.emailUser && this.config.emailPassword) {
      this.emailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: this.config.emailUser,
          pass: this.config.emailPassword,
        },
      });
    }
  }

  /**
   * Send SMS notification about the error
   */
  async sendSMS(message: string): Promise<boolean> {
    try {
      if (!this.twilioClient) {
        console.log('⚠️  Twilio not configured - SMS notification skipped');
        return false;
      }

      if (!this.config.alertPhoneNumber) {
        console.log('⚠️  Alert phone number not configured - SMS notification skipped');
        return false;
      }

      const result = await this.twilioClient.messages.create({
        body: message,
        from: this.config.twilioPhoneNumber,
        to: this.config.alertPhoneNumber,
      });

      console.log('✅ SMS sent successfully:', result.sid);
      return true;
    } catch (error) {
      console.error('❌ Failed to send SMS:', error);
      return false;
    }
  }

  /**
   * Send email notification about the error
   */
  async sendEmail(subject: string, htmlContent: string): Promise<boolean> {
    try {
      if (!this.emailTransporter) {
        console.log('⚠️  Email not configured - Email notification skipped');
        return false;
      }

      if (!this.config.alertEmail) {
        console.log('⚠️  Alert email not configured - Email notification skipped');
        return false;
      }

      const mailOptions = {
        from: this.config.emailUser,
        to: this.config.alertEmail,
        subject: subject,
        html: htmlContent,
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send both SMS and Email notifications about a bug
   */
  async notifyBugDetected(bugDetails: {
    issue: string;
    file: string;
    section: string;
    timestamp: string;
  }): Promise<{ sms: boolean; email: boolean }> {
    const { issue, file, section, timestamp } = bugDetails;

    // SMS Message (short and concise)
    const smsMessage = `🚨 APOC Bug Detected!\n\nIssue: ${issue}\nFile: ${file}\nSection: ${section}\nTime: ${timestamp}\n\nAI Agent is analyzing...`;

    // Email HTML (detailed and formatted)
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; }
          .detail { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #667eea; }
          .detail strong { color: #667eea; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .badge { background: #ff4444; color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Bug Detected in APOC</h1>
            <p><span class="badge">URGENT</span> AI Agent Triggered</p>
          </div>
          <div class="content">
            <h2>Bug Details</h2>
            <div class="detail">
              <strong>Issue:</strong><br/>
              ${issue}
            </div>
            <div class="detail">
              <strong>File:</strong><br/>
              <code>${file}</code>
            </div>
            <div class="detail">
              <strong>Section:</strong><br/>
              ${section}
            </div>
            <div class="detail">
              <strong>Detected At:</strong><br/>
              ${timestamp}
            </div>
            <h3>🤖 AI Agent Status</h3>
            <p>The AI Agent has been automatically triggered and is currently:</p>
            <ul>
              <li>✅ Analyzing the code</li>
              <li>⏳ Generating a fix</li>
              <li>⏳ Creating a pull request</li>
            </ul>
            <p>You will receive another notification once the PR is created.</p>
          </div>
          <div class="footer">
            <p>This is an automated notification from APOC Agentic Mode</p>
            <p>Powered by OpenAI GPT-4 & GitHub API</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send both notifications in parallel
    const [smsResult, emailResult] = await Promise.all([
      this.sendSMS(smsMessage),
      this.sendEmail('🚨 APOC Bug Detected - AI Agent Triggered', emailHtml),
    ]);

    return {
      sms: smsResult,
      email: emailResult,
    };
  }
}

export const notificationService = new NotificationService();

