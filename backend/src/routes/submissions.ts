import { Router, Request, Response } from 'express';
import { supabaseService, Organization, QuestionnaireResponse } from '../services/supabaseService';
import { JsonExportService } from '../services/jsonExportService';
import { EmailService, EmailExportRequest } from '../services/emailService';

const router = Router();

// Submit a completed questionnaire
router.post('/submit', async (req: Request, res: Response) => {
  try {
    const {
      organizationInfo,
      questionnaireData,
      implementationMode,
      submittedBy,
      submittedByName
    } = req.body;

    // Validate required fields
    if (!organizationInfo?.name) {
      res.status(400).json({
        success: false,
        error: 'Organization name is required'
      });
      return;
    }

    if (!questionnaireData || Object.keys(questionnaireData).length === 0) {
      res.status(400).json({
        success: false,
        error: 'Questionnaire data is required'
      });
      return;
    }

    if (!implementationMode) {
      res.status(400).json({
        success: false,
        error: 'Implementation mode is required'
      });
      return;
    }

    // Step 1: Create or get organization
    const organization: Organization = await supabaseService.createOrganization({
      name: organizationInfo.name,
      email: organizationInfo.email,
      phone: organizationInfo.phone,
      address: organizationInfo.address
    });

    // Step 2: Calculate section completion status
    const sectionCompletion = calculateSectionCompletion(questionnaireData);

    // Step 3: Create questionnaire response with user tracking
    const questionnaireResponse: QuestionnaireResponse = {
      organization_id: organization.id!,
      questionnaire_id: 'x12-270-271-complete',
      implementation_mode: implementationMode,
      status: 'completed',
      responses: questionnaireData,
      section_completion: sectionCompletion,
      submitted_at: new Date().toISOString(),
      submitted_by: submittedBy || null,
      submitted_by_name: submittedByName || null,
      created_by: null, // TODO: Will be set to actual user ID when we implement user lookup
      updated_by: null  // TODO: Will be set to actual user ID when we implement user lookup
    };

    const savedResponse = await supabaseService.createQuestionnaireResponse(questionnaireResponse);

    // Step 4: Submit the questionnaire (mark as submitted)
    const submittedResponse = await supabaseService.submitQuestionnaire(
      savedResponse.id!,
      submittedBy
    );

    // Step 5: Create audit trail entry
    await supabaseService.createAuditEntry({
      response_id: submittedResponse.id!,
      action: 'questionnaire_submitted',
      new_value: { status: 'submitted', implementation_mode: implementationMode },
      user_identifier: submittedBy || 'anonymous'
    });

    // Return success response
    res.status(201).json({
      success: true,
      data: {
        submissionId: submittedResponse.id,
        organizationId: organization.id,
        status: submittedResponse.status,
        submittedAt: submittedResponse.submitted_at,
        message: 'Questionnaire submitted successfully'
      }
    });

  } catch (error) {
    console.error('Error submitting questionnaire:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit questionnaire'
    });
  }
});

// Get submission by ID
router.get('/submission/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Submission ID is required'
      });
      return;
    }

    const submission = await supabaseService.getQuestionnaireResponse(id);

    if (!submission) {
      res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
      return;
    }

    res.json({
      success: true,
      data: submission
    });

  } catch (error) {
    console.error('Error getting submission:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get submission'
    });
  }
});

// Get all submissions with optional filters
router.get('/submissions', async (req: Request, res: Response) => {
  try {
    const { organization_id, status, implementation_mode } = req.query;

    const filters: any = {};
    if (organization_id) filters.organization_id = organization_id as string;
    if (status) filters.status = status as string;
    if (implementation_mode) filters.implementation_mode = implementation_mode as string;

    const submissions = await supabaseService.getQuestionnaireResponses(filters);

    res.json({
      success: true,
      data: submissions,
      count: submissions.length
    });

  } catch (error) {
    console.error('Error getting submissions:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get submissions'
    });
  }
});

// Save draft (auto-save functionality)
router.post('/draft', async (req: Request, res: Response) => {
  try {
    const {
      organizationInfo,
      questionnaireData,
      implementationMode,
      responseId,
      submittedBy,
      submittedByName
    } = req.body;

    let organization: Organization | undefined;
    let response: QuestionnaireResponse;

    // If responseId provided, update existing draft
    if (responseId) {
      const existingResponse = await supabaseService.getQuestionnaireResponse(responseId);
      if (!existingResponse) {
        res.status(404).json({
          success: false,
          error: 'Draft not found'
        });
        return;
      }

      // Update the existing response
      const updates: Partial<QuestionnaireResponse> = {
        responses: questionnaireData,
        implementation_mode: implementationMode,
        status: 'draft',
        submitted_at: new Date().toISOString(),
        submitted_by: submittedBy || 'anonymous',
        submitted_by_name: submittedByName || 'Anonymous User'
      };

      if (organizationInfo) {
        updates.section_completion = calculateSectionCompletion(questionnaireData);
      }

      response = await supabaseService.updateQuestionnaireResponse(responseId, updates);
    } else {
      // Create new draft
      if (organizationInfo?.name) {
        organization = await supabaseService.createOrganization(organizationInfo);
      }

      const draftResponse: QuestionnaireResponse = {
        organization_id: organization?.id,
        questionnaire_id: 'x12-270-271-complete',
        implementation_mode: implementationMode,
        status: 'draft',
        responses: questionnaireData,
        section_completion: calculateSectionCompletion(questionnaireData),
        submitted_at: new Date().toISOString(),
        submitted_by: submittedBy || 'anonymous',
        submitted_by_name: submittedByName || 'Anonymous User'
      };

      response = await supabaseService.createQuestionnaireResponse(draftResponse);
    }

    res.json({
      success: true,
      data: {
        responseId: response.id,
        status: response.status,
        message: 'Draft saved successfully'
      }
    });

  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save draft'
    });
  }
});

// Get submission data for editing
router.get('/submission/:responseId/edit', async (req: Request, res: Response) => {
  try {
    const { responseId } = req.params;

    if (!responseId) {
      return res.status(400).json({
        success: false,
        error: 'Response ID is required'
      });
    }

    // Get the submission data
    const submission = await supabaseService.getQuestionnaireResponse(responseId);
    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    // Format the data for editing
    const editData = {
      responseId: submission.id,
      organizationInfo: {
        name: submission.responses?.['organization-name'] || '',
        email: submission.responses?.['organization-email'] || '',
        phone: submission.responses?.['organization-phone'] || '',
        address: submission.responses?.['organization-address'] || ''
      },
      questionnaireData: submission.responses || {},
      implementationMode: submission.implementation_mode || 'real-time-b2b',
      status: submission.status,
      submittedAt: submission.submitted_at,
      submittedBy: submission.submitted_by,
      submittedByName: submission.submitted_by_name
    };

    return res.status(200).json({
      success: true,
      data: editData
    });

  } catch (error) {
    console.error('Error fetching submission for edit:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch submission'
    });
  }
});

// Update existing submission (for edit flow)
router.put('/submission/:responseId', async (req: Request, res: Response) => {
  try {
    const { responseId } = req.params;
    const {
      organizationInfo,
      questionnaireData,
      implementationMode,
      submittedBy,
      submittedByName
    } = req.body;

    if (!responseId) {
      return res.status(400).json({
        success: false,
        error: 'Response ID is required'
      });
    }

    // Get the existing submission
    const existingSubmission = await supabaseService.getQuestionnaireResponse(responseId);
    if (!existingSubmission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    // Update organization if provided
    let organizationId = existingSubmission.organization_id;
    if (organizationInfo && organizationInfo.name) {
      const organization = await supabaseService.createOrUpdateOrganization(organizationInfo);
      organizationId = organization.id;
    }

    // Update the submission
    const updates: Partial<QuestionnaireResponse> = {
      organization_id: organizationId,
      responses: questionnaireData,
      implementation_mode: implementationMode,
      status: 'submitted', // Keep as submitted since 'modified' is not allowed by DB constraint
      section_completion: calculateSectionCompletion(questionnaireData),
      updated_at: new Date().toISOString(),
      // Preserve original submission timestamp and user
      // submitted_at and submitted_by remain unchanged
    };

    const updatedResponse = await supabaseService.updateQuestionnaireResponse(responseId, updates);

    // Create audit trail entry
    if (responseId) {
      await supabaseService.createAuditEntry({
        response_id: responseId,
        action: 'submission_updated',
        new_value: {
          status: 'submitted',
          implementation_mode: implementationMode,
          updated_by: submittedBy
        },
        user_identifier: submittedBy || 'anonymous'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        submissionId: updatedResponse.id,
        status: updatedResponse.status,
        message: 'Implementation updated successfully'
      }
    });

  } catch (error) {
    console.error('Error updating submission:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update submission'
    });
  }
});

// Helper function to calculate section completion
function calculateSectionCompletion(responses: Record<string, any>): Record<string, boolean> {
  // Get the implementation mode to determine which sections to check
  const implementationMode = responses['implementation-mode-selection'];

  // Standard sections (always present)
  const sections: Record<string, string[]> = {
    'organization-info': ['organization-name', 'required-return-date'],
    'trading-partner-documentation': ['availity-enrollment-required', 'implementation-mode-selection'],
    'contact-information': [
      'trading-partner-technical-name', 'trading-partner-technical-phone', 'trading-partner-technical-email'
    ],
    'enveloping-requirements': [
      // ISA segments
      'isa05-270', 'isa05-271', 'isa06-270', 'isa06-271',
      'isa07-270', 'isa07-271', 'isa08-270', 'isa08-271',
      'isa11-270', 'isa11-271', 'isa16-270', 'isa16-271',
      // GS segments
      'gs02-270', 'gs02-271', 'gs03-270', 'gs03-271',
      // Payer information
      '2100a-nm103-270', '2100a-nm103-271', '2100a-nm109-270', '2100a-nm109-271'
    ],
    'payer-enhancements': ['uppercase-characters-acceptable', 'system-accept-spaces', 'accept-extended-character-set'],
    'payer-specific-processing-errors': ['ansi-translator-syntax-error-rejection', 'support-ta1-response', 'ta1-response-driven-by-isa14', 'reject-not-used-segments'],
    'search-options': ['supported-search-options'],
    'response': ['return-additional-data']
  };

  // Add mode-specific sections based on implementation mode
  if (implementationMode === 'real_time_b2b') {
    sections['connectivity-b2b'] = [
      'xml-wrapper-required-b2b', 'production-approval-process-b2b',
      'test-url-b2b', 'prod-url-b2b', 'test-user-id-b2b', 'prod-user-id-b2b'
    ];
    sections['testing-b2b'] = [
      'test-environment-availability-b2b', 'test-transaction-limits-b2b',
      'specific-testing-requirements-b2b', 'other-testing-restrictions-b2b'
    ];
  } else if (implementationMode === 'real_time_web') {
    // Real-time Web specific sections with correct field mappings
    sections['payer-id-and-name'] = [
      'payer-id-organization',
      'publish-payer-id-permission',
      'payer-plan-name-essentials-dropdown'
    ];
    sections['implementation-states'] = [
      'implementation-nationwide'
      // Note: implementation-states-list is conditional based on implementation-nationwide
    ];
    sections['payer-logo'] = [
      'organization-logo-upload'
    ];
    sections['connectivity'] = [
      'xml-wrapper-required',
      'differing-connectivity-requirements',
      'test-url-web',
      'test-user-id-web',
      'prod-url-web',
      'prod-user-id-web',
      'system-hours-availability',
      'continuous-threads-support'
    ];
    sections['testing'] = [
      'production-approval-process',
      'test-environment-availability',
      'specific-testing-requirements',
      'other-testing-restrictions'
    ];
    sections['essentials-page-fields'] = [
      'payer-name-field',  // This was incorrectly in "Other" before
      'payer-id-qualifier-support',
      'payer-id-support',
      'provider-express-entry-requirements',
      'provider-identifiers-nm108-nm109-requirements',
      'date-of-birth-requirements',
      'gender-code-requirements',
      'as-of-date-requirements',
      'benefit-service-type-support',
      'exclude-e&b-benefit-types',
      'test-files-require-valid-provider-data',
      'test-files-require-valid-membership-records',
      'designated-payer-id-for-testing',
      'minimum-maximum-test-transactions',
      'test-file-preparation-date'
    ];
  } else if (implementationMode === 'edi_batch') {
    sections['connectivity-edi-batch'] = ['sftp-host', 'sftp-port', 'sftp-username'];
    sections['file-structure-naming-edi-batch'] = ['file-naming-convention', 'file-structure'];
    sections['standard-aggregation-schedule-edi-batch'] = ['aggregation-schedule'];
    // Add other batch-specific sections as needed
  }

  const completion: Record<string, boolean> = {};

  for (const [sectionId, requiredFields] of Object.entries(sections)) {
    completion[sectionId] = requiredFields.every(field => {
      const value = responses[field];
      return value !== undefined && value !== null && value !== '';
    });
  }

  return completion;
}

// Fix section completion for existing records
router.post('/fix-completion/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Response ID is required'
      });
      return;
    }

    const existingResponse = await supabaseService.getQuestionnaireResponse(id);
    if (!existingResponse) {
      res.status(404).json({
        success: false,
        error: 'Response not found'
      });
      return;
    }

    // Recalculate section completion with fixed logic
    const updatedCompletion = calculateSectionCompletion(existingResponse.responses);

    const updated = await supabaseService.updateQuestionnaireResponse(id, {
      section_completion: updatedCompletion
    });

    res.json({
      success: true,
      data: {
        responseId: updated.id,
        section_completion: updated.section_completion,
        message: 'Section completion recalculated successfully'
      }
    });

  } catch (error) {
    console.error('Error fixing completion:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fix completion'
    });
  }
});

// Export questionnaire response to client JSON format
router.get('/submission/:responseId/export-json', async (req: Request, res: Response) => {
  try {
    const { responseId } = req.params;

    if (!responseId) {
      return res.status(400).json({
        success: false,
        error: 'Response ID is required'
      });
    }

    // Get the questionnaire response
    const response = await supabaseService.getQuestionnaireResponse(responseId);
    if (!response) {
      return res.status(404).json({
        success: false,
        error: 'Questionnaire response not found'
      });
    }

    // Check if export is supported for this mode
    if (!JsonExportService.isExportSupported(response.implementation_mode || '')) {
      return res.status(400).json({
        success: false,
        error: `JSON export is not yet supported for ${response.implementation_mode} mode. Currently only supports real_time_b2b mode.`
      });
    }

    // Export to client JSON format
    const exportedJson = JsonExportService.exportToClientFormat(response);
    if (!exportedJson) {
      return res.status(400).json({
        success: false,
        error: 'Failed to export questionnaire to JSON format'
      });
    }

    // Set headers for file download
    const organizationName = response.responses?.['organization-name'] || 'unknown';
    const filename = `${organizationName.replace(/[^a-zA-Z0-9]/g, '_')}_b2b_config.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    return res.json(exportedJson);

  } catch (error) {
    console.error('Error exporting JSON:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export JSON'
    });
  }
});

// Email questionnaire response as JSON
router.post('/submission/:responseId/email-json', async (req: Request, res: Response) => {
  try {
    const { responseId } = req.params;
    const { recipients, subject, message, senderName, senderEmail }: {
      recipients: string[];
      subject?: string;
      message?: string;
      senderName?: string;
      senderEmail?: string;
    } = req.body;

    if (!responseId) {
      return res.status(400).json({
        success: false,
        error: 'Response ID is required'
      });
    }

    // Validate required fields
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Recipients array is required and must contain at least one email address'
      });
    }

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = recipients.filter(email => !emailRegex.test(email));
    if (invalidEmails.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Invalid email addresses: ${invalidEmails.join(', ')}`
      });
    }

    // Get the questionnaire response to check if it exists and is exportable
    const response = await supabaseService.getQuestionnaireResponse(responseId);
    if (!response) {
      return res.status(404).json({
        success: false,
        error: 'Questionnaire response not found'
      });
    }

    // Check if export is supported for this mode
    if (!JsonExportService.isExportSupported(response.implementation_mode || '')) {
      return res.status(400).json({
        success: false,
        error: `Email export is not yet supported for ${response.implementation_mode} mode. Currently only supports real_time_b2b mode.`
      });
    }

    // Send email
    const emailRequest: EmailExportRequest = {
      responseId,
      recipients,
      ...(subject && { subject }),
      ...(message && { message }),
      ...(senderName && { senderName }),
      ...(senderEmail && { senderEmail })
    };

    await EmailService.sendJsonExport(emailRequest);

    return res.json({
      success: true,
      message: `JSON export emailed successfully to ${recipients.length} recipient(s)`,
      recipients: recipients
    });

  } catch (error) {
    console.error('Error emailing JSON export:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to email JSON export'
    });
  }
});

export default router;
