"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const jsonExportService_1 = require("./jsonExportService");
class EmailService {
    static transporter = nodemailer_1.default.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true
    });
    static async sendJsonExport(request) {
        try {
            const { supabaseService } = await Promise.resolve().then(() => __importStar(require('./supabaseService')));
            const response = await supabaseService.getQuestionnaireResponse(request.responseId);
            if (!response) {
                throw new Error('Questionnaire response not found');
            }
            if (!jsonExportService_1.JsonExportService.isExportSupported(response.implementation_mode || '')) {
                throw new Error(`Email export is not supported for ${response.implementation_mode} mode`);
            }
            const exportedJson = jsonExportService_1.JsonExportService.exportToClientFormat(response);
            if (!exportedJson) {
                throw new Error('Failed to generate JSON export');
            }
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
            const info = await this.transporter.sendMail(mailOptions);
            console.log('📧 EMAIL SENT (MOCK MODE)');
            console.log('From:', mailOptions.from);
            console.log('To:', mailOptions.to);
            console.log('Subject:', mailOptions.subject);
            console.log('Attachment:', filename);
            console.log('Message ID:', info.messageId);
            if (process.env.NODE_ENV === 'development') {
                console.log('Email content preview:', mailOptions.text.substring(0, 200) + '...');
            }
        }
        catch (error) {
            console.error('Failed to send email:', error);
            throw error;
        }
    }
    static formatEmailHtml(message, organizationName, implementationMode) {
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
    static async testEmailConfig() {
        try {
            await this.transporter.verify();
            return true;
        }
        catch (error) {
            console.error('Email configuration test failed:', error);
            return false;
        }
    }
}
exports.EmailService = EmailService;
//# sourceMappingURL=emailService.js.map