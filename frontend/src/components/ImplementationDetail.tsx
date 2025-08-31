import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

interface ImplementationDetailProps {
  implementationId: string;
  onClose: () => void;
}

interface DetailedImplementation {
  id: string;
  organization_id: string;
  questionnaire_id: string;
  implementation_mode: string;
  status: string;
  responses: Record<string, any>;
  section_completion: Record<string, boolean>;
  created_at: string;
  updated_at: string;
  submitted_at: string;
  submitted_by: string;
  submitted_by_name?: string;
  created_by?: string;
  organizations: {
    id: string;
    name: string;
    email: string;
  };
  created_by_user?: {
    id: string;
    name: string;
    email: string;
    user_type: string;
  };
}

export const ImplementationDetail: React.FC<ImplementationDetailProps> = ({ 
  implementationId, 
  onClose 
}) => {
  const [implementation, setImplementation] = useState<DetailedImplementation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'responses' | 'raw' | 'export'>('overview');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportedJson, setExportedJson] = useState<any>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({
    recipients: '',
    subject: '',
    message: '',
    senderName: '',
    senderEmail: ''
  });

  const loadImplementationDetail = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getSubmission(implementationId);
      setImplementation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load implementation details');
    } finally {
      setLoading(false);
    }
  }, [implementationId]);

  useEffect(() => {
    loadImplementationDetail();
  }, [loadImplementationDetail]);

  const formatDate = (dateString: string | null, status?: string) => {
    // For drafts or if no date provided, show appropriate text
    if (!dateString || status === 'draft' || status === 'in_progress') {
      return status === 'draft' ? 'Draft (not submitted)' : 'In Progress (not submitted)';
    }

    try {
      const date = new Date(dateString);
      // Check if date is valid (not epoch time)
      if (date.getTime() === 0 || date.getFullYear() < 1970) {
        return status === 'draft' ? 'Draft (not submitted)' : 'In Progress (not submitted)';
      }

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return status === 'draft' ? 'Draft (not submitted)' : 'In Progress (not submitted)';
    }
  };

  const getModeLabel = (mode: string) => {
    const modeLabels = {
      real_time_web: 'Real-time Web',
      real_time_b2b: 'Real-time B2B',
      edi_batch: 'EDI Batch'
    };
    return modeLabels[mode as keyof typeof modeLabels] || mode;
  };

  const generateExportedJson = useCallback(async () => {
    if (!implementation || !isExportSupported()) {
      setExportedJson(null);
      return;
    }

    try {
      // Generate the mapped JSON for preview (without downloading)
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3002/api'}/submissions/submission/${implementation.id}/export-json`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const jsonData = await response.json();
        setExportedJson(jsonData);
      } else {
        setExportedJson(null);
      }
    } catch (error) {
      console.error('Failed to generate export preview:', error);
      setExportedJson(null);
    }
  }, [implementation]);

  const handleExportJson = async () => {
    if (!implementation) return;

    try {
      setExportLoading(true);
      await apiService.exportQuestionnaireJson(implementation.id);
    } catch (error) {
      console.error('Export failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to export JSON');
    } finally {
      setExportLoading(false);
    }
  };

  const isExportSupported = () => {
    return implementation?.implementation_mode === 'real_time_b2b';
  };

  const handleEmailJson = () => {
    if (!implementation) return;

    // Pre-populate form with default values
    const organizationName = implementation.responses?.['organization-name'] || 'Unknown Organization';
    const implementationMode = implementation.implementation_mode || 'unknown';

    setEmailForm({
      recipients: '',
      subject: `${organizationName} - ${implementationMode.toUpperCase()} Configuration Export`,
      message: `Hello,\n\nPlease find attached the JSON configuration export for ${organizationName}'s ${implementationMode.replace(/_/g, ' ').toUpperCase()} implementation.\n\nThis file contains the mapped configuration data ready for client integration.\n\nBest regards`,
      senderName: '',
      senderEmail: ''
    });

    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    if (!implementation) return;

    try {
      setEmailLoading(true);

      // Parse recipients (comma or semicolon separated)
      const recipients = emailForm.recipients
        .split(/[,;]/)
        .map(email => email.trim())
        .filter(email => email.length > 0);

      if (recipients.length === 0) {
        alert('Please enter at least one recipient email address');
        return;
      }

      await apiService.emailQuestionnaireJson(implementation.id, {
        recipients,
        subject: emailForm.subject || undefined,
        message: emailForm.message || undefined,
        senderName: emailForm.senderName || undefined,
        senderEmail: emailForm.senderEmail || undefined
      });

      alert(`Email sent successfully to ${recipients.length} recipient(s)!`);
      setShowEmailModal(false);

    } catch (error) {
      console.error('Email failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to send email');
    } finally {
      setEmailLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'export') {
      generateExportedJson();
    }
  }, [activeTab, generateExportedJson]);

  const getFieldLabel = (fieldId: string): string => {
    // Convert field IDs to human-readable labels matching UI format
    const fieldLabels: Record<string, string> = {
      // Organization Information
      'organization-name': 'Organization Name',
      'required-return-date': 'Required Return Date',

      // Trading Partner Documentation
      'implementation-mode-selection': 'Implementation Mode',
      'availity-enrollment-required': 'Availity Enrollment Required',

      // Contact Information
      'trading-partner-technical-name': 'Technical Contact Name',
      'trading-partner-technical-email': 'Technical Contact Email',
      'trading-partner-technical-phone': 'Technical Contact Phone',

      // Enveloping Requirements - ISA Segments
      'isa05-270': 'ISA05 - Sender ID Qualifier (270 Request)',
      'isa05-271': 'ISA05 - Sender ID Qualifier (271 Response)',
      'isa06-270': 'ISA06 - Sender ID (270 Request)',
      'isa06-271': 'ISA06 - Sender ID (271 Response)',
      'isa07-270': 'ISA07 - Receiver ID Qualifier (270 Request)',
      'isa07-271': 'ISA07 - Receiver ID Qualifier (271 Response)',
      'isa08-270': 'ISA08 - Receiver ID (270 Request)',
      'isa08-271': 'ISA08 - Receiver ID (271 Response)',
      'isa11-270': 'ISA11 - Repetition Separator (270 Request)',
      'isa11-271': 'ISA11 - Repetition Separator (271 Response)',
      'isa16-270': 'ISA16 - Component Element Separator (270 Request)',
      'isa16-271': 'ISA16 - Component Element Separator (271 Response)',

      // Enveloping Requirements - GS Segments
      'gs02-270': 'GS02 - Application Sender Code (270 Request)',
      'gs02-271': 'GS02 - Application Sender Code (271 Response)',
      'gs03-270': 'GS03 - Application Receiver Code (270 Request)',
      'gs03-271': 'GS03 - Application Receiver Code (271 Response)',

      // Enveloping Requirements - Payer Information
      '2100a-nm103-270': '2100A NM103 - Payer Name (270 Request)',
      '2100a-nm103-271': '2100A NM103 - Payer Name (271 Response)',
      '2100a-nm109-270': '2100A NM109 - Payer ID (270 Request)',
      '2100a-nm109-271': '2100A NM109 - Payer ID (271 Response)',

      // Custom fields for enveloping requirements
      'isa06-270-custom': 'ISA06 Custom Value (270 Request)',
      'isa06-271-custom': 'ISA06 Custom Value (271 Response)',
      'isa08-270-custom': 'ISA08 Custom Value (270 Request)',
      'isa08-271-custom': 'ISA08 Custom Value (271 Response)',
      'gs02-270-custom': 'GS02 Custom Value (270 Request)',
      'gs02-271-custom': 'GS02 Custom Value (271 Response)',
      'gs03-270-custom': 'GS03 Custom Value (270 Request)',
      'gs03-271-custom': 'GS03 Custom Value (271 Response)',
      '2100a-nm103-270-custom': 'Payer Name Custom Value (270 Request)',
      '2100a-nm103-271-custom': 'Payer Name Custom Value (271 Response)',
      '2100a-nm109-270-custom': 'Payer ID Custom Value (270 Request)',
      '2100a-nm109-271-custom': 'Payer ID Custom Value (271 Response)',

      // Search Options
      'supported-search-options': 'Supported Search Options',

      // Payer Enhancements
      'uppercase-characters-acceptable': 'Uppercase Characters Acceptable',
      'system-accept-spaces': 'System Accept Spaces',
      'accept-extended-character-set': 'Accept Extended Character Set',

      // B2B Connectivity
      'xml-wrapper-required-b2b': 'XML Wrapper Required',
      'production-approval-process-b2b': 'Production Approval Process',
      'test-url-b2b': 'Test URL',
      'prod-url-b2b': 'Production URL',
      'test-user-id-b2b': 'Test User ID',
      'prod-user-id-b2b': 'Production User ID',

      // B2B Testing
      'test-environment-availability-b2b': 'Test Environment Availability',
      'test-transaction-limits-b2b': 'Test Transaction Limits',
      'specific-testing-requirements-b2b': 'Specific Testing Requirements',
      'other-testing-restrictions-b2b': 'Other Testing Restrictions',
      'test-file-preparation-date-b2b': 'Test File Preparation Date',
      'test-files-valid-membership-b2b': 'Test Files Valid Membership',
      'test-files-valid-provider-data-b2b': 'Test Files Valid Provider Data',
      'designated-payer-id-testing-b2b': 'Designated Payer ID Testing',
      'exclude-eb-benefit-types-b2b': 'Exclude EB Benefit Types',

      // B2B Connectivity (additional)
      'system-hours-availability-b2b': 'System Hours Availability',
      'continuous-threads-support-b2b': 'Continuous Threads Support',
      'differing-connectivity-requirements-b2b': 'Differing Connectivity Requirements',

      // Payer Specific Processing Errors
      'ansi-translator-syntax-error-rejection': 'ANSI Translator Syntax Error Rejection',
      'ansi-translator-syntax-error-other-explanation': 'ANSI Translator Syntax Error Other Explanation',
      'support-ta1-response': 'Support TA1 Response',
      'ta1-response-driven-by-isa14': 'TA1 Response Driven by ISA14',
      'reject-not-used-segments': 'Reject Not Used Segments',

      // Search Options (additional)
      'support-all-service-type-codes': 'Support All Service Type Codes',
      'specific-patient-id-formatting': 'Specific Patient ID Formatting',

      // Response
      'return-additional-data': 'Return Additional Data',
      'response-notes': 'Response Notes',
      'additional-data-examples': 'Additional Data Examples',

      // Real-time Web specific fields
      // Payer ID and Name section
      'payer-id-organization': 'Payer ID for Organization',
      'publish-payer-id-permission': 'Permission to Publish Payer ID',
      'controlled-deployment-select-group': 'Controlled Deployment to Select Group',
      'payer-plan-name-essentials-dropdown': 'Payer/Plan Name for Essentials Dropdown',

      // Implementation States section
      'implementation-nationwide': 'Implementation Nationwide',
      'implementation-states-list': 'Implementation States List',

      // Payer Logo section
      'organization-logo-upload': 'Organization Logo Upload',

      // Connectivity section (Web)
      'xml-wrapper-required': 'XML Wrapper Required',
      'xml-envelope-requirements': 'XML Envelope Requirements',
      'differing-connectivity-requirements': 'Differing Connectivity Requirements',
      'connectivity-requirements-attachment': 'Connectivity Requirements Attachment',
      'test-url-info': 'Test URL Information',
      'prod-url-info': 'Production URL Information',
      'system-hours-availability': 'System Hours Availability',
      'continuous-threads-support': 'Continuous Threads Support',

      // Testing section (Web)
      'production-approval-process': 'Production Approval Process',
      'test-environment-availability': 'Test Environment Availability',
      'test-transaction-limits': 'Test Transaction Limits',
      'specific-testing-requirements': 'Specific Testing Requirements',
      'other-testing-restrictions': 'Other Testing Restrictions',

      // Essentials Page Fields section
      'payer-name-field': 'Payer Name Field',
      'payer-id-qualifier-support': 'Payer ID Qualifier Support',
      'payer-id-qualifier-requirements': 'Payer ID Qualifier Requirements',
      'payer-id-support': 'Payer ID Support',
      'provider-express-entry-requirements': 'Provider Express Entry Requirements',
      'provider-identifiers-nm108-nm109-requirements': 'Provider Identifiers NM108 & NM109 Requirements',
      'date-of-birth-requirements': 'Date Of Birth Requirements',
      'gender-code-requirements': 'Gender Code Requirements',
      'as-of-date-requirements': 'As Of Date Requirements',
      'benefit-service-type-support': 'Benefit Service Type Support',
      'benefit-service-type-requirements': 'Benefit Service Type Requirements',
      'exclude-e&b-benefit-types': 'Exclude E&B Benefit Types',
      'exclude-benefit-types-details': 'Exclude Benefit Types Details',
      'test-files-require-valid-provider-data': 'Test Files Require Valid Provider Data',
      'test-files-require-valid-membership-records': 'Test Files Require Valid Membership Records',
      'designated-payer-id-for-testing': 'Designated Payer Id For Testing',
      'designated-payer-id-details': 'Designated Payer Id Details',
      'minimum-maximum-test-transactions': 'Minimum Maximum Test Transactions',
      'minimum-maximum-test-details': 'Minimum Maximum Test Details',
      'test-file-preparation-date': 'Test File Preparation Date',

      // EDI Batch specific fields
      'sftp-host': 'SFTP Host',
      'sftp-port': 'SFTP Port',
      'sftp-username': 'SFTP Username',
      'file-naming-convention': 'File Naming Convention',
      'file-structure': 'File Structure',
      'aggregation-schedule': 'Aggregation Schedule'
    };

    return fieldLabels[fieldId] || fieldId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (value === null || value === undefined || value === '') {
      return 'Not specified';
    }
    return String(value);
  };

  // Special formatting for enveloping requirements to match UI layout
  const formatEnvelopingRequirements = (responses: Record<string, any>) => {
    const envelopingFields = [
      { field: 'ISA05', desc: 'Sender ID Qualifier', req270: 'isa05-270', res271: 'isa05-271' },
      { field: 'ISA06', desc: 'Sender ID', req270: 'isa06-270', res271: 'isa06-271' },
      { field: 'ISA07', desc: 'Receiver ID Qualifier', req270: 'isa07-270', res271: 'isa07-271' },
      { field: 'ISA08', desc: 'Receiver ID', req270: 'isa08-270', res271: 'isa08-271' },
      { field: 'ISA11', desc: 'Repetition Separator', req270: 'isa11-270', res271: 'isa11-271' },
      { field: 'ISA16', desc: 'Component Element Separator', req270: 'isa16-270', res271: 'isa16-271' },
      { field: 'GS02', desc: 'Application Sender Code', req270: 'gs02-270', res271: 'gs02-271' },
      { field: 'GS03', desc: 'Application Receiver Code', req270: 'gs03-270', res271: 'gs03-271' },
      { field: '2100A NM103', desc: 'Payer Name', req270: '2100a-nm103-270', res271: '2100a-nm103-271' },
      { field: '2100A NM109', desc: 'Payer ID', req270: '2100a-nm109-270', res271: '2100a-nm109-271' }
    ];

    return envelopingFields.map(item => ({
      field: item.field,
      description: item.desc,
      request270: formatValue(responses[item.req270]),
      response271: formatValue(responses[item.res271]),
      customRequest270: responses[`${item.req270}-custom`] ? formatValue(responses[`${item.req270}-custom`]) : null,
      customResponse271: responses[`${item.res271}-custom`] ? formatValue(responses[`${item.res271}-custom`]) : null
    }));
  };

  const groupResponsesBySection = (responses: Record<string, any>) => {
    const implementationMode = responses['implementation-mode-selection'];

    // Base sections that are always present
    const sections: Record<string, Record<string, any>> = {
      'Organization Information': {},
      'Trading Partner Documentation': {},
      'Contact Information': {},
      'Enveloping Requirements': {},
      'Payer Enhancements': {},
      'Payer Specific Processing Errors': {},
      'Search Options': {},
      'Response': {},
      'Other': {}
    };

    // Add mode-specific sections based on implementation mode
    if (implementationMode === 'real_time_b2b') {
      sections['Connectivity (B2B)'] = {};
      sections['Testing (B2B)'] = {};
    } else if (implementationMode === 'real_time_web') {
      sections['Payer ID and Name'] = {};
      sections['Implementation States'] = {};
      sections['Payer Logo'] = {};
      sections['Connectivity'] = {};
      sections['Testing'] = {};
      sections['Essentials Page Fields'] = {};
    } else if (implementationMode === 'edi_batch') {
      sections['Connectivity (EDI Batch)'] = {};
      sections['File Structure and Naming'] = {};
      sections['Standard Aggregation Schedule'] = {};
    }

    Object.entries(responses).forEach(([key, value]) => {
      // Organization Information
      if (key.includes('organization-name') || key.includes('required-return-date')) {
        sections['Organization Information'][key] = value;
      }
      // Trading Partner Documentation
      else if (key.includes('availity-enrollment') || key.includes('implementation-mode-selection')) {
        sections['Trading Partner Documentation'][key] = value;
      }
      // Contact Information
      else if (key.includes('trading-partner-technical')) {
        sections['Contact Information'][key] = value;
      }
      // Enveloping Requirements (ISA, GS, 2100A segments)
      else if (key.includes('isa') || key.includes('gs') || key.includes('2100a-nm')) {
        sections['Enveloping Requirements'][key] = value;
      }
      // Payer Enhancements
      else if (key.includes('uppercase-characters') || key.includes('system-accept-spaces') || key.includes('accept-extended-character-set')) {
        sections['Payer Enhancements'][key] = value;
      }
      // Payer Specific Processing Errors
      else if (key.includes('ansi-translator-syntax-error') || key.includes('support-ta1-response') ||
               key.includes('ta1-response-driven-by-isa14') || key.includes('reject-not-used-segments')) {
        sections['Payer Specific Processing Errors'][key] = value;
      }
      // Search Options
      else if (key.includes('supported-search-options') || key.includes('patient') || key.includes('search') ||
               key.includes('specific-patient-id-formatting') || key.includes('support-all-service-type-codes')) {
        sections['Search Options'][key] = value;
      }
      // Response section - basic response fields
      else if (key.includes('return-additional-data') || key.includes('response-notes') || key.includes('additional-data-examples')) {
        sections['Response'][key] = value;
      }
      // Mode-specific field mapping
      else if (implementationMode === 'real_time_b2b') {
        // B2B Connectivity
        if (key.includes('xml-wrapper') || key.includes('production-approval') ||
            key.includes('test-url-b2b') || key.includes('prod-url-b2b') ||
            key.includes('test-user-id-b2b') || key.includes('prod-user-id-b2b') ||
            key.includes('system-hours-availability-b2b') || key.includes('continuous-threads-support-b2b') ||
            key.includes('differing-connectivity-requirements-b2b')) {
          sections['Connectivity (B2B)'][key] = value;
        }
        // B2B Testing - all testing related fields
        else if (key.includes('test-environment') || key.includes('test-transaction') ||
                 key.includes('testing-requirements') || key.includes('testing-restrictions') ||
                 key.includes('test-file-preparation-date-b2b') || key.includes('test-files-valid-membership-b2b') ||
                 key.includes('test-files-valid-provider-data-b2b') || key.includes('designated-payer-id-testing-b2b') ||
                 key.includes('exclude-eb-benefit-types-b2b') || key.includes('b2b')) {
          sections['Testing (B2B)'][key] = value;
        }
        else {
          sections['Other'][key] = value;
        }
      }
      else if (implementationMode === 'real_time_web') {
        // Web-specific Payer ID and Name - using correct field IDs
        if (key.includes('payer-id-organization') || key.includes('publish-payer-id-permission') ||
            key.includes('controlled-deployment-select-group') || key.includes('payer-plan-name-essentials-dropdown')) {
          sections['Payer ID and Name'][key] = value;
        }
        // Implementation States
        else if (key.includes('implementation-nationwide') || key.includes('implementation-states-list')) {
          sections['Implementation States'][key] = value;
        }
        // Payer Logo
        else if (key.includes('organization-logo-upload')) {
          sections['Payer Logo'][key] = value;
        }
        // Web Connectivity - using correct field IDs
        else if (key.includes('xml-wrapper-required') || key.includes('xml-envelope-requirements') ||
                 key.includes('differing-connectivity-requirements') || key.includes('connectivity-requirements-attachment') ||
                 key.includes('test-url-info') || key.includes('prod-url-info') ||
                 key.includes('system-hours-availability') || key.includes('continuous-threads-support')) {
          sections['Connectivity'][key] = value;
        }
        // Web Testing - using correct field IDs
        else if (key.includes('production-approval-process') || key.includes('test-environment-availability') ||
                 key.includes('specific-testing-requirements') || key.includes('other-testing-restrictions')) {
          sections['Testing'][key] = value;
        }
        // Essentials Page Fields - using correct field IDs
        else if (key.includes('payer-name-field') || key.includes('payer-id-qualifier-support') ||
                 key.includes('payer-id-qualifier-requirements') || key.includes('payer-id-support') ||
                 key.includes('provider-express-entry-requirements') ||
                 key.includes('provider-identifiers-nm108-nm109-requirements') ||
                 key.includes('date-of-birth-requirements') || key.includes('gender-code-requirements') ||
                 key.includes('as-of-date-requirements') || key.includes('benefit-service-type-support') ||
                 key.includes('benefit-service-type-requirements') || key.includes('exclude-e&b-benefit-types') ||
                 key.includes('exclude-benefit-types-details') || key.includes('test-files-require-valid-provider-data') ||
                 key.includes('test-files-require-valid-membership-records') || key.includes('designated-payer-id-for-testing') ||
                 key.includes('designated-payer-id-details') || key.includes('minimum-maximum-test-transactions') ||
                 key.includes('minimum-maximum-test-details') || key.includes('test-file-preparation-date') ||
                 key.includes('essentials') || key.includes('page-fields')) {
          sections['Essentials Page Fields'][key] = value;
        }
        else {
          sections['Other'][key] = value;
        }
      }
      else if (implementationMode === 'edi_batch') {
        // EDI Batch Connectivity
        if (key.includes('sftp-host') || key.includes('sftp-port') || key.includes('sftp-username')) {
          sections['Connectivity (EDI Batch)'][key] = value;
        }
        // File Structure and Naming
        else if (key.includes('file-naming-convention') || key.includes('file-structure')) {
          sections['File Structure and Naming'][key] = value;
        }
        // Standard Aggregation Schedule
        else if (key.includes('aggregation-schedule')) {
          sections['Standard Aggregation Schedule'][key] = value;
        }
        else {
          sections['Other'][key] = value;
        }
      }
      // Everything else for unknown modes
      else {
        sections['Other'][key] = value;
      }
    });

    // Remove empty sections and maintain order based on implementation mode
    let orderedSections = [
      'Organization Information',
      'Trading Partner Documentation',
      'Contact Information',
      'Enveloping Requirements',
      'Payer Enhancements',
      'Payer Specific Processing Errors',
      'Search Options',
      'Response'
    ];

    // Add mode-specific sections in order
    if (implementationMode === 'real_time_b2b') {
      orderedSections.push('Connectivity (B2B)', 'Testing (B2B)');
    } else if (implementationMode === 'real_time_web') {
      orderedSections.push(
        'Payer ID and Name',
        'Implementation States',
        'Payer Logo',
        'Connectivity',
        'Testing',
        'Essentials Page Fields'
      );
    } else if (implementationMode === 'edi_batch') {
      orderedSections.push(
        'Connectivity (EDI Batch)',
        'File Structure and Naming',
        'Standard Aggregation Schedule'
      );
    }

    orderedSections.push('Other');

    return Object.fromEntries(
      orderedSections
        .map(sectionName => [sectionName, sections[sectionName]])
        .filter(([_, values]) => Object.keys(values as Record<string, any>).length > 0)
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-availity-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading implementation details...</p>
        </div>
      </div>
    );
  }

  if (error || !implementation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-error-50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load details</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex space-x-3 justify-center">
            <button onClick={loadImplementationDetail} className="btn-primary">
              Try Again
            </button>
            <button onClick={onClose} className="btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const groupedResponses = groupResponsesBySection(implementation.responses);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {implementation.organizations.name} - Implementation Details
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {getModeLabel(implementation.implementation_mode)} • {formatDate(implementation.submitted_at, implementation.status)}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'responses', label: 'Questionnaire Responses' },
              { id: 'raw', label: 'Raw Data' },
              { id: 'export', label: 'Export' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-availity-500 text-availity-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Organization Details</h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Name</dt>
                      <dd className="text-sm text-gray-900">{implementation.organizations.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="text-sm text-gray-900">{implementation.organizations.email || 'Not provided'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Implementation Mode</dt>
                      <dd className="text-sm text-gray-900">{getModeLabel(implementation.implementation_mode)}</dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Submission Details</h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="text-sm text-gray-900 capitalize">{implementation.status}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Submitted By</dt>
                      <dd className="text-sm text-gray-900">
                        {(implementation.status === 'draft' || implementation.status === 'in_progress') ? (
                          <span className="text-gray-500">—</span>
                        ) : implementation.submitted_by_name || implementation.created_by_user?.name ? (
                          <div>
                            <div className="font-medium">
                              {implementation.submitted_by_name || implementation.created_by_user?.name}
                            </div>
                            <div className="text-gray-600">
                              {implementation.submitted_by}
                            </div>
                            {implementation.created_by_user?.user_type && (
                              <div className="text-xs text-blue-600 mt-1">
                                {implementation.created_by_user.user_type.replace('_', ' ').toUpperCase()}
                              </div>
                            )}
                          </div>
                        ) : (
                          implementation.submitted_by || <span className="text-gray-500">—</span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Submitted At</dt>
                      <dd className="text-sm text-gray-900">{formatDate(implementation.submitted_at, implementation.status)}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Section Completion Status</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(implementation.section_completion).map(([section, completed]) => (
                    <div key={section} className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${completed ? 'bg-success-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm text-gray-700 capitalize">{section.replace(/-/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'responses' && (
            <div className="space-y-6">
              {Object.entries(groupedResponses).map(([sectionName, sectionResponses]) => (
                <div key={sectionName} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4">{sectionName}</h4>

                  {sectionName === 'Enveloping Requirements' ? (
                    // Special layout for enveloping requirements matching UI format
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg overflow-hidden">
                        <table className="min-w-full">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">270 Request</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">271 Response</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {formatEnvelopingRequirements(implementation.responses).map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.field}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{item.description}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {item.request270}
                                  {item.customRequest270 && (
                                    <div className="text-xs text-gray-500 mt-1">Custom: {item.customRequest270}</div>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {item.response271}
                                  {item.customResponse271 && (
                                    <div className="text-xs text-gray-500 mt-1">Custom: {item.customResponse271}</div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    // Regular grid layout for other sections
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(sectionResponses as Record<string, any>).map(([key, value]) => (
                        <div key={key} className="bg-white rounded p-3">
                          <dt className="text-sm font-medium text-gray-500 mb-1">{getFieldLabel(key)}</dt>
                          <dd className="text-sm text-gray-900">{formatValue(value)}</dd>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-4">Raw JSON Data</h4>
              <pre className="bg-white p-4 rounded border text-xs overflow-auto max-h-96">
                {JSON.stringify(implementation, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-900">Client JSON Export</h4>
                {isExportSupported() && exportedJson && (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleEmailJson}
                      disabled={emailLoading}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-availity-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email JSON
                    </button>
                    <button
                      onClick={handleExportJson}
                      disabled={exportLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-availity-600 hover:bg-availity-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-availity-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {exportLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download JSON
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {isExportSupported() ? (
                exportedJson ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-3">
                      This is the mapped JSON format ready for client integration. Fields are mapped from your questionnaire responses to the client's expected structure.
                    </p>
                    <pre className="bg-white p-4 rounded border text-xs overflow-auto max-h-96">
                      {JSON.stringify(exportedJson, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="animate-spin mx-auto h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">Generating export preview...</p>
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Export Not Available</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    JSON export is currently only available for <strong>Real-time B2B</strong> implementations.
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    Current mode: <span className="font-medium">{getModeLabel(implementation?.implementation_mode || '')}</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Email JSON Export</h3>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipients <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={emailForm.recipients}
                    onChange={(e) => setEmailForm({...emailForm, recipients: e.target.value})}
                    placeholder="email1@example.com, email2@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-availity-500 focus:border-availity-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-availity-500 focus:border-availity-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={emailForm.message}
                    onChange={(e) => setEmailForm({...emailForm, message: e.target.value})}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-availity-500 focus:border-availity-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sender Name</label>
                    <input
                      type="text"
                      value={emailForm.senderName}
                      onChange={(e) => setEmailForm({...emailForm, senderName: e.target.value})}
                      placeholder="Your Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-availity-500 focus:border-availity-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sender Email</label>
                    <input
                      type="email"
                      value={emailForm.senderEmail}
                      onChange={(e) => setEmailForm({...emailForm, senderEmail: e.target.value})}
                      placeholder="your.email@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-availity-500 focus:border-availity-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-availity-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={emailLoading || !emailForm.recipients.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-availity-600 hover:bg-availity-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-availity-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {emailLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Send Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
