"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabaseService_1 = require("../services/supabaseService");
const testRecommendationService_1 = require("../services/testRecommendationService");
const router = (0, express_1.Router)();
router.get('/payers', async (req, res) => {
    try {
        const submissions = await supabaseService_1.supabaseService.getQuestionnaireResponses({
            status: 'submitted'
        });
        const payerMap = new Map();
        submissions.forEach((submission) => {
            if (submission.organizations && submission.organizations.name) {
                const orgId = submission.organization_id;
                const orgName = submission.organizations.name;
                if (!payerMap.has(orgId)) {
                    const responses = submission.responses || {};
                    const payerId = extractPayerId(responses);
                    payerMap.set(orgId, {
                        id: orgId,
                        name: orgName,
                        payerId: payerId,
                        organizationId: orgId,
                        implementationMode: submission.implementation_mode,
                        submissionCount: 1
                    });
                }
                else {
                    const existing = payerMap.get(orgId);
                    existing.submissionCount += 1;
                }
            }
        });
        const payers = Array.from(payerMap.values()).sort((a, b) => a.name.localeCompare(b.name));
        res.json({
            success: true,
            data: payers,
            count: payers.length
        });
    }
    catch (error) {
        console.error('Error getting payers:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get payers'
        });
    }
});
router.get('/payers/:payerId/configuration', async (req, res) => {
    try {
        const { payerId } = req.params;
        const submissions = await supabaseService_1.supabaseService.getQuestionnaireResponses({
            organization_id: payerId,
            status: 'submitted'
        });
        if (submissions.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No configuration found for this payer'
            });
        }
        const latestSubmission = submissions[0];
        if (!latestSubmission) {
            return res.status(404).json({
                success: false,
                error: 'No configuration found for this payer'
            });
        }
        const responses = latestSubmission.responses || {};
        const configuration = extractPayerConfiguration(responses, latestSubmission.implementation_mode);
        return res.json({
            success: true,
            data: configuration
        });
    }
    catch (error) {
        console.error('Error getting payer configuration:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get payer configuration'
        });
    }
});
function extractPayerId(responses) {
    return responses['2100a-nm109-270'] ||
        responses['2100a-nm109-271'] ||
        responses['payer-id'] ||
        responses['receiver-id'] ||
        undefined;
}
function extractPayerConfiguration(responses, implementationMode) {
    const config = {
        implementationMode: implementationMode || undefined
    };
    config.testUrl = responses['test-url-web'] || responses['test-url-b2b'] || responses['test-url'];
    config.validMemberRecordsRequired = responses['test-files-require-valid-membership-records'] === 'yes';
    config.validProviderDataRequired = responses['test-files-require-valid-provider-data'] === 'yes';
    config.testUserId = responses['test-user-id-web'] || responses['test-user-id-b2b'];
    config.prodUrl = responses['prod-url-web'] || responses['prod-url-b2b'];
    config.testFilePreparationDate = responses['test-file-preparation-date'];
    config.specificTestingRequirements = responses['specific-testing-requirements'] === 'yes';
    config.testingRequirementsDetails = responses['testing-requirements-details'];
    config.otherTestingRestrictions = responses['other-testing-restrictions'] === 'yes';
    config.otherTestingRestrictionsDetails = responses['other-testing-restrictions-details'];
    const testVolume = responses['minimum-maximum-test-transactions'];
    if (testVolume && typeof testVolume === 'string') {
        const match = testVolume.match(/(\d+)\s*-\s*(\d+)/);
        if (match && match[1] && match[2]) {
            config.testVolumeMin = parseInt(match[1]);
            config.testVolumeMax = parseInt(match[2]);
        }
    }
    config.xmlWrapper = responses['xml-wrapper-required'] === 'yes' ||
        responses['xml-wrapper-required-b2b'] === 'yes' ||
        responses['xml-envelope-structure'] === 'yes';
    config.systemHours = responses['system-hours-availability'] || responses['system-hours-availability-b2b'] || '24/7';
    config.maxThreads = 10;
    const supportsAllServiceTypes = responses['support-all-service-type-codes'] === 'yes' ||
        responses['benefit-service-type-support'] === 'yes';
    if (supportsAllServiceTypes) {
        config.supportedServiceTypes = [
            '30',
            '12',
            '13',
            '35',
            '88',
            'AL',
            'MH'
        ];
        config.supportsAllServiceTypes = true;
    }
    else if (responses['supported-service-types'] && Array.isArray(responses['supported-service-types'])) {
        config.supportedServiceTypes = responses['supported-service-types'];
        config.supportsAllServiceTypes = false;
    }
    config.memberIdFormat = responses['member-id-format'] || responses['member-id-format-requirements'];
    config.envelopingRequirements = {
        isa05_270: responses['isa05-270'] || responses['isa05-270-custom'],
        isa05_271: responses['isa05-271'] || responses['isa05-271-custom'],
        isa06_270: responses['isa06-270'] === 'custom' ? responses['isa06-270-custom'] : responses['isa06-270'],
        isa06_271: responses['isa06-271'] === 'custom' ? responses['isa06-271-custom'] : responses['isa06-271'],
        isa07_270: responses['isa07-270'] || responses['isa07-270-custom'],
        isa07_271: responses['isa07-271'] === 'custom' ? responses['isa07-271-custom'] : responses['isa07-271'],
        isa08_270: responses['isa08-270'] === 'custom' ? responses['isa08-270-custom'] : responses['isa08-270'],
        isa08_271: responses['isa08-271'] || responses['isa08-271-custom'],
        isa11_270: responses['isa11-270'],
        isa11_271: responses['isa11-271'],
        isa16_270: responses['isa16-270'],
        isa16_271: responses['isa16-271'],
        gs02_270: responses['gs02-270'] === 'custom' ? responses['gs02-270-custom'] : responses['gs02-270'],
        gs02_271: responses['gs02-271'] === 'custom' ? responses['gs02-271-custom'] : responses['gs02-271'],
        gs03_270: responses['gs03-270'] === 'custom' ? responses['gs03-270-custom'] : responses['gs03-270'],
        gs03_271: responses['gs03-271'] === 'custom' ? responses['gs03-271-custom'] : responses['gs03-271'],
        payerName_270: responses['2100a-nm103-270-custom'] || responses['2100a-nm103-270'],
        payerName_271: responses['2100a-nm103-271-custom'] || responses['2100a-nm103-271'],
        payerId_270: responses['2100a-nm109-270-custom'] || responses['2100a-nm109-270'],
        payerId_271: responses['2100a-nm109-271-custom'] || responses['2100a-nm109-271']
    };
    if (responses['supported-search-options'] && Array.isArray(responses['supported-search-options'])) {
        config.supportedSearchOptions = responses['supported-search-options'].map((option) => {
            const optionMap = {
                'patient_id_dob': 'Patient Id Dob',
                'patient_id_first_last_name': 'Patient Id Name Dob',
                'patient_id_first_last_name_dob': 'Patient Id First Last',
                'patient_last_name_dob': 'Patient Last Name & DOB',
                'patient_first_last_name_dob': 'Patient First Name, Last Name, & DOB',
                'ssn': 'SSN',
                'ssn_dob': 'SSN & DOB'
            };
            return optionMap[option] || option;
        });
    }
    config.uppercaseCharacters = responses['uppercase-characters'] === 'yes';
    config.x12BasicCharacterSpaces = responses['x12-basic-character-spaces'] === 'yes';
    config.extendedCharacterSetSupport = responses['extended-character-set-support'] === 'yes';
    config.returnAdditionalData = responses['return-additional-data'] === 'yes';
    config.additionalDataDetails = responses['additional-data-details'];
    return config;
}
router.post('/payers/:payerId/test-recommendations', async (req, res) => {
    try {
        const { payerId } = req.params;
        const submissions = await supabaseService_1.supabaseService.getQuestionnaireResponses({
            organization_id: payerId,
            status: 'submitted'
        });
        if (submissions.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No configuration found for this payer'
            });
        }
        const latestSubmission = submissions[0];
        if (!latestSubmission) {
            return res.status(404).json({
                success: false,
                error: 'No configuration found for this payer'
            });
        }
        const responses = latestSubmission.responses || {};
        const baseConfiguration = extractPayerConfiguration(responses, latestSubmission.implementation_mode);
        const payerInfo = {
            id: payerId,
            name: latestSubmission.organization_id || 'Unknown Payer',
            implementationMode: latestSubmission.implementation_mode || 'real_time_b2b'
        };
        const serviceConfiguration = {
            implementationMode: latestSubmission.implementation_mode || 'real_time_b2b',
            xmlWrapper: baseConfiguration.xmlWrapper,
            systemHours: baseConfiguration.systemHours,
            maxThreads: baseConfiguration.maxThreads || 10,
            serviceTypes: baseConfiguration.serviceTypes,
            memberIdFormat: baseConfiguration.memberIdFormat,
            supportedSearchOptions: baseConfiguration.supportedSearchOptions,
            supportedServiceTypes: baseConfiguration.supportedServiceTypes,
            supportsAllServiceTypes: baseConfiguration.supportsAllServiceTypes,
            testUrl: baseConfiguration.testUrl,
            validMemberRecordsRequired: baseConfiguration.validMemberRecordsRequired,
            validProviderDataRequired: baseConfiguration.validProviderDataRequired
        };
        const testRecommendations = await testRecommendationService_1.TestRecommendationService.generateTestRecommendations(payerInfo, serviceConfiguration);
        return res.json({
            success: true,
            data: testRecommendations
        });
    }
    catch (error) {
        console.error('Error generating test recommendations:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate test recommendations'
        });
    }
});
router.post('/payers/:payerId/generate-test-data', async (req, res) => {
    try {
        const { payerId } = req.params;
        const { selectedTestCases } = req.body;
        if (!selectedTestCases || !Array.isArray(selectedTestCases)) {
            return res.status(400).json({
                success: false,
                error: 'selectedTestCases array is required'
            });
        }
        const submissions = await supabaseService_1.supabaseService.getQuestionnaireResponses({
            organization_id: payerId,
            status: 'submitted'
        });
        if (submissions.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No configuration found for this payer'
            });
        }
        const latestSubmission = submissions[0];
        if (!latestSubmission) {
            return res.status(404).json({
                success: false,
                error: 'No configuration found for this payer'
            });
        }
        const responses = latestSubmission.responses || {};
        const baseConfiguration = extractPayerConfiguration(responses, latestSubmission.implementation_mode);
        const payerInfo = {
            id: payerId,
            name: latestSubmission.organization_id || 'Unknown Payer',
            implementationMode: latestSubmission.implementation_mode || 'real_time_b2b'
        };
        const serviceConfiguration = {
            implementationMode: latestSubmission.implementation_mode || 'real_time_b2b',
            xmlWrapper: baseConfiguration.xmlWrapper,
            systemHours: baseConfiguration.systemHours,
            maxThreads: baseConfiguration.maxThreads || 10,
            serviceTypes: baseConfiguration.serviceTypes,
            memberIdFormat: baseConfiguration.memberIdFormat,
            supportedSearchOptions: baseConfiguration.supportedSearchOptions,
            supportedServiceTypes: baseConfiguration.supportedServiceTypes,
            supportsAllServiceTypes: baseConfiguration.supportsAllServiceTypes,
            testUrl: baseConfiguration.testUrl,
            validMemberRecordsRequired: baseConfiguration.validMemberRecordsRequired,
            validProviderDataRequired: baseConfiguration.validProviderDataRequired
        };
        const testData = await testRecommendationService_1.TestRecommendationService.generateTestData(payerInfo, serviceConfiguration, selectedTestCases);
        return res.json({
            success: true,
            data: testData
        });
    }
    catch (error) {
        console.error('Error generating test data:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate test data'
        });
    }
});
exports.default = router;
//# sourceMappingURL=payers.js.map