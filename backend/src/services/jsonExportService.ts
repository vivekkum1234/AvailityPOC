import { QuestionnaireResponse } from './supabaseService';

export interface ExportedJsonData {
  id: string;
  template: string;
  transactionType: string;
  name: string;
  clearinghouse: string;
  versions: Array<{
    version: string;
    edifecs: object;
    edifecsProfilesByVersion: object;
    payerSpecificEdifecsProfilesByVersion: object;
    ace: {
      disabled: boolean;
      rcmId: string;
      overrides: object;
      parameters: object;
    };
    options: {
      GS02: string;
      GS03: string;
      ISA01: string;
      ISA03: string;
      ISA05: string;
      ISA06: string;
      ISA07: string;
      ISA08: string;
      ISA11: string;
      ISA14: string;
      guideline_270_5010A1: string;
      severity_270_5010A1: string;
      guideline_271_5010A1: string;
      severity_271_5010A1: string;
      connectorId: string;
    };
    payerIds: string[];
    settings: object;
  }>;
  inboxes: string[];
  payerAriesId: string;
  submissionModeCd: number;
  batch: string;
  lastUpdateUserId: string;
  lastUpdateFirstName: string;
  lastUpdateLastName: string;
}

export class JsonExportService {
  /**
   * Export questionnaire response to client JSON format
   * Currently only supports B2B mode
   */
  static exportToClientFormat(response: QuestionnaireResponse): ExportedJsonData | null {
    // Only support B2B mode for now
    if (response.implementation_mode !== 'real_time_b2b') {
      return null;
    }

    return this.exportB2BFormat(response);
  }

  /**
   * Export B2B mode questionnaire to client JSON format
   */
  private static exportB2BFormat(response: QuestionnaireResponse): ExportedJsonData {
    const responses = response.responses || {};
    
    // Format organization name for ID fields
    const organizationName = responses['organization-name'] || 'UNKNOWN_ORG';
    const formattedOrgName = this.formatOrganizationName(organizationName);

    return {
      id: formattedOrgName,
      template: 'b2b-default',
      transactionType: '1',
      name: organizationName,
      clearinghouse: formattedOrgName,
      versions: [
        {
          version: '005010X279A1',
          edifecs: {},
          edifecsProfilesByVersion: {},
          payerSpecificEdifecsProfilesByVersion: {},
          ace: {
            disabled: true,
            rcmId: '',
            overrides: {},
            parameters: {}
          },
          options: {
            GS02: this.getFieldValue(responses, 'gs02-270', '030240928'),
            GS03: this.getFieldValue(responses, 'gs03-270', 'A1BEN'),
            ISA01: '00',
            ISA03: '00',
            ISA05: this.getFieldValue(responses, 'isa05-270', '01'),
            ISA06: this.getFieldValue(responses, 'isa06-270', '030240928'),
            ISA07: this.getFieldValue(responses, 'isa07-270', 'ZZ'),
            ISA08: this.getFieldValue(responses, 'isa08-270', 'A1BEN'),
            ISA11: this.getFieldValue(responses, 'isa11-270', '^'),
            ISA14: '0',
            guideline_270_5010A1: '5010A1_AvailityStandard270.ecs',
            severity_270_5010A1: '5010A1_270Semantic_ClearingHouse.esf',
            guideline_271_5010A1: '5010A1_AvailityStandard271.ecs',
            severity_271_5010A1: '5010A1_271Semantic_ClearingHouse.esf',
            connectorId: `ARIES.RT.DATAPOWER.${formattedOrgName}`
          },
          payerIds: [],
          settings: {}
        }
      ],
      inboxes: [formattedOrgName],
      payerAriesId: 'DEFAULT',
      submissionModeCd: 2,
      batch: 'false',
      lastUpdateUserId: 'USER',
      lastUpdateFirstName: 'FNAME',
      lastUpdateLastName: 'LNAME'
    };
  }

  /**
   * Format organization name for use in ID fields
   */
  private static formatOrganizationName(orgName: string): string {
    return orgName
      .toUpperCase()
      .replace(/\s+/g, '_')
      .replace(/[^A-Z0-9_]/g, '')
      .substring(0, 15); // Limit length for ISA fields
  }

  /**
   * Get field value with fallback to default
   */
  private static getFieldValue(responses: Record<string, any>, fieldId: string, defaultValue: string): string {
    const value = responses[fieldId];
    
    // Handle custom values
    if (value === 'custom') {
      const customValue = responses[`${fieldId}-custom`];
      return customValue || defaultValue;
    }
    
    return value || defaultValue;
  }

  /**
   * Check if export is supported for the given mode
   */
  static isExportSupported(implementationMode: string): boolean {
    return implementationMode === 'real_time_b2b';
  }
}
