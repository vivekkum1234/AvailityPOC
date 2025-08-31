"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonExportService = void 0;
class JsonExportService {
    static exportToClientFormat(response) {
        if (response.implementation_mode !== 'real_time_b2b') {
            return null;
        }
        return this.exportB2BFormat(response);
    }
    static exportB2BFormat(response) {
        const responses = response.responses || {};
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
    static formatOrganizationName(orgName) {
        return orgName
            .toUpperCase()
            .replace(/\s+/g, '_')
            .replace(/[^A-Z0-9_]/g, '')
            .substring(0, 15);
    }
    static getFieldValue(responses, fieldId, defaultValue) {
        const value = responses[fieldId];
        if (value === 'custom') {
            const customValue = responses[`${fieldId}-custom`];
            return customValue || defaultValue;
        }
        return value || defaultValue;
    }
    static isExportSupported(implementationMode) {
        return implementationMode === 'real_time_b2b';
    }
}
exports.JsonExportService = JsonExportService;
//# sourceMappingURL=jsonExportService.js.map