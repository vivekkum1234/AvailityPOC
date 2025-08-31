import nodemailer from 'nodemailer';
import { QuestionnaireResponse } from './supabaseService';
import { JsonExportService } from './jsonExportService';

export interface EmailExportRequest {
  responseId: string;
  recipients: string[];
  subject?: string;
  message?: string;
  senderName?: string;
  senderEmail?: string;
}

export class EmailService {
  private static transporter = nodemailer.createTransport({
    // Mock email service for development
    streamTransport: true,
    newline: 'unix',
    buffer: true
  });

  /**
   * Send JSON export via email
   */
  static async sendJsonExport(request: EmailExportRequest): Promise<void> {
    try {
      // Get the questionnaire response
      const { supabaseService } = await import('./supabaseService');
      const response = await supabaseService.getQuestionnaireResponse(request.responseId);
      
      if (!response) {
        throw new Error('Questionnaire response not found');
      }

      // Check if export is supported
      if (!JsonExportService.isExportSupported(response.implementation_mode || '')) {
        throw new Error(`Email export is not supported for ${response.implementation_mode} mode`);
      }

      // Generate the JSON export
      const exportedJson = JsonExportService.exportToClientFormat(response);
      if (!exportedJson) {
        throw new Error('Failed to generate JSON export');
      }

      // Prepare email content
      const organizationName = response.responses?.['organization-name'] || 'Unknown Organization';
      const implementationMode = response.implementation_mode || 'unknown';
      const filename = `${organizationName.replace(/[^a-zA-Z0-9]/g, '_')}_${implementationMode}_config.json`;
      
      const defaultSubject = `${organizationName} - ${implementationMode.toUpperCase()} Configuration Export`;
      const defaultMessage = `
Hello,

Please find attached the JSON configuration export for ${organizationName}'s ${implementationMode.replace(/_/g, ' ').toUpperCase()} implementation.

This file contains the mapped configuration data ready for client integration.

Implementation Details:
- Organization: ${organizationName}
- Mode: ${implementationMode.replace(/_/g, ' ').toUpperCase()}
- Export Date: ${new Date().toLocaleDateString()}
- Submission Date: ${response.submitted_at ? new Date(response.submitted_at).toLocaleDateString() : 'N/A'}

Best regards,
APOC System
      `.trim();

      // Email options
      const mailOptions = {
        from: `"${request.senderName || 'APOC System'}" <${request.senderEmail || process.env.SMTP_FROM || 'noreply@apoc.com'}>`,
        to: request.recipients.join(', '),
        subject: request.subject || defaultSubject,
        text: request.message || defaultMessage,
        html: this.formatEmailHtml(request.message || defaultMessage, organizationName, implementationMode),
        attachments: [
          {
            filename: filename,
            content: JSON.stringify(exportedJson, null, 2),
            contentType: 'application/json'
          }
        ]
      };

      // Send email (mock for development)
      const info = await this.transporter.sendMail(mailOptions);

      // Log email details for development
      console.log('📧 EMAIL SENT (MOCK MODE)');
      console.log('From:', mailOptions.from);
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('Attachment:', filename);
      console.log('Message ID:', info.messageId);

      // In development, we can also log the email content
      if (process.env.NODE_ENV === 'development') {
        console.log('Email content preview:', mailOptions.text.substring(0, 200) + '...');
      }

    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  /**
   * Format email content as HTML
   */
  private static formatEmailHtml(message: string, organizationName: string, implementationMode: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Configuration Export</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .content { padding: 20px; }
          .footer { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px; font-size: 12px; color: #666; }
          .highlight { background-color: #e3f2fd; padding: 10px; border-radius: 3px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>🔧 Configuration Export - ${organizationName}</h2>
          <p><strong>Implementation Mode:</strong> ${implementationMode.replace(/_/g, ' ').toUpperCase()}</p>
        </div>
        
        <div class="content">
          <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${message}</pre>
          
          <div class="highlight">
            <strong>📎 Attachment:</strong> JSON configuration file ready for client integration
          </div>
        </div>
        
        <div class="footer">
          <p>This email was sent automatically by the APOC (Availity Payer Onboarding Configuration) system.</p>
          <p>Export generated on: ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Test email configuration
   */
  static async testEmailConfig(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email configuration test failed:', error);
      return false;
    }
  }
}
