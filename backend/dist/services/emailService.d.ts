export interface EmailExportRequest {
    responseId: string;
    recipients: string[];
    subject?: string;
    message?: string;
    senderName?: string;
    senderEmail?: string;
}
export declare class EmailService {
    private static transporter;
    static sendJsonExport(request: EmailExportRequest): Promise<void>;
    private static formatEmailHtml;
    static testEmailConfig(): Promise<boolean>;
}
//# sourceMappingURL=emailService.d.ts.map