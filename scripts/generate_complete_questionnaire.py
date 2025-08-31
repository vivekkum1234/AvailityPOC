#!/usr/bin/env python3
"""
Complete Questionnaire Generator for X12 270/271 Implementation

This script generates a comprehensive questionnaire structure that includes:
1. All extracted PDF fields with proper types and options
2. Transaction mode conditional logic
3. Field dependencies and validation rules
4. X12 mapping information
5. Proper sectioning and organization

Usage:
    python generate_complete_questionnaire.py
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Any

class QuestionnaireGenerator:
    def __init__(self):
        self.questionnaire = {
            "id": "x12-270-271-complete",
            "title": "X12 270/271 Implementation Questionnaire - Complete",
            "description": "Comprehensive digital questionnaire for X12 270/271 HIPAA transaction implementation with all PDF fields",
            "version": "2.0.0",
            "transactionType": "270/271",
            "sections": []
        }
        
        self.implementation_modes = [
            {"value": "real_time_web", "label": "Real-time Web"},
            {"value": "real_time_b2b", "label": "Real-time B2B"},
            {"value": "edi_batch", "label": "EDI Batch"}
        ]

    def generate_complete_questionnaire(self):
        """Generate the complete questionnaire from extracted data"""
        
        print("🔧 Generating complete questionnaire structure...")
        
        # Load extracted data
        fields_data = self._load_extracted_fields()
        form_controls = self._load_form_controls()
        transaction_analysis = self._load_transaction_analysis()
        
        # Generate sections
        self._add_organization_info_section(fields_data)
        self._add_implementation_mode_section()
        self._add_contact_information_section(fields_data)
        self._add_enveloping_requirements_section(fields_data)
        self._add_patient_information_section(fields_data)
        self._add_provider_information_section(fields_data)
        self._add_service_information_section(fields_data)
        self._add_testing_requirements_section(fields_data)
        self._add_connectivity_section(fields_data)
        self._add_edi_batch_specific_section(fields_data)
        self._add_production_approval_section(fields_data)
        
        # Save the questionnaire
        self._save_questionnaire()
        
        return self.questionnaire

    def _load_extracted_fields(self) -> Dict:
        """Load extracted fields data"""
        try:
            with open('extracted_fields/fields_raw.json', 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print("❌ fields_raw.json not found")
            return {}

    def _load_form_controls(self) -> Dict:
        """Load form controls analysis"""
        try:
            with open('extracted_fields/form_controls_analysis.json', 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print("❌ form_controls_analysis.json not found")
            return {}

    def _load_transaction_analysis(self) -> Dict:
        """Load transaction mode analysis"""
        try:
            with open('extracted_fields/transaction_modes_analysis.json', 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print("❌ transaction_modes_analysis.json not found")
            return {}

    def _add_organization_info_section(self, fields_data: Dict):
        """Add organization information section"""
        
        section = {
            "id": "organization-info",
            "title": "Organization Information",
            "description": "Basic information about your organization",
            "order": 1,
            "questions": []
        }
        
        # Organization name
        if "Organization name" in fields_data:
            field = fields_data["Organization name"]
            section["questions"].append({
                "id": "organization-name",
                "type": "text",
                "title": "Organization Name",
                "required": field.get("required", True),
                "validation": {"maxLength": 100}
            })
        
        # Required return date
        if "Required return date" in fields_data:
            section["questions"].append({
                "id": "required-return-date",
                "type": "date",
                "title": "Required Return Date",
                "description": "When do you need this implementation completed?",
                "required": True
            })
        
        self.questionnaire["sections"].append(section)

    def _add_implementation_mode_section(self):
        """Add implementation mode selection section"""
        
        section = {
            "id": "implementation-mode",
            "title": "Implementation Mode Selection",
            "description": "Select the transaction mode you are implementing",
            "order": 2,
            "questions": [
                {
                    "id": "implementation-mode-selection",
                    "type": "radio",
                    "title": "Please indicate the mode type you are implementing for the 270/271 transaction:",
                    "description": "Please only complete the sections relevant to your selected mode",
                    "required": True,
                    "options": self.implementation_modes
                }
            ]
        }
        
        self.questionnaire["sections"].append(section)

    def _add_contact_information_section(self, fields_data: Dict):
        """Add contact information section with proper PDF structure"""

        print(f"🔍 Contact section: Found {len(fields_data)} total fields")
        contact_fields = [k for k, v in fields_data.items() if v.get('section') == 'contact_information']
        print(f"🔍 Contact fields in contact_information section: {len(contact_fields)}")

        section = {
            "id": "contact-information",
            "title": "Contact Information",
            "description": "Primary and secondary contacts for this implementation",
            "order": 3,
            "questions": []
        }

        # Define contact types matching the PDF exactly
        contact_types = [
            {
                "id": "trading-partner-technical",
                "title": "Trading Partner Technical Contact",
                "description": "Technical contact from your organization",
                "name_field": "Name1",
                "phone_field": "Phone1",
                "email_field": "Email1",
                "required": True
            },
            {
                "id": "availity-technical",
                "title": "Availity Technical Contact",
                "description": "Technical contact from Availity (to be completed by Availity)",
                "name_field": "AVName1",
                "phone_field": "AVPhone1",
                "email_field": "AVEmail1",
                "required": False,
                "readonly": True
            },
            {
                "id": "trading-partner-account-manager",
                "title": "Trading Partner Account/Program Manager",
                "description": "Account or program manager from your organization",
                "name_field": "Name2",
                "phone_field": "Phone2",
                "email_field": "Email2",
                "required": False
            },
            {
                "id": "availity-account-manager",
                "title": "Availity Account/Program Manager",
                "description": "Account or program manager from Availity",
                "name_field": "AVName2",
                "phone_field": "AVPhone2",
                "email_field": "AVEmail2",
                "required": False,
                "readonly": True
            },
            {
                "id": "trading-partner-escalation",
                "title": "Trading Partner Escalation Contact",
                "description": "Escalation contact from your organization",
                "name_field": "Name3",
                "phone_field": "Phone3",
                "email_field": "Email3",
                "required": False
            },
            {
                "id": "availity-escalation",
                "title": "Availity Escalation Contact",
                "description": "Escalation contact from Availity",
                "name_field": "AVName3",
                "phone_field": "AVPhone3",
                "email_field": "AVEmail3",
                "required": False,
                "readonly": True
            },
            {
                "id": "additional-trading-partner",
                "title": "Additional Trading Partner Contact",
                "description": "Additional contact from your organization",
                "name_field": "Name4",
                "phone_field": "Phone4",
                "email_field": "Email4",
                "required": False
            },
            {
                "id": "other-availity",
                "title": "Other Availity Contact",
                "description": "Other contact from Availity",
                "name_field": "AVName4",
                "phone_field": "AVPhone4",
                "email_field": "AVEmail4",
                "required": False,
                "readonly": True
            }
        ]

        # Create questions for each contact type
        for contact_type in contact_types:
            print(f"🔍 Processing contact type: {contact_type['title']}")
            print(f"🔍 Looking for fields: {contact_type['name_field']}, {contact_type['phone_field']}, {contact_type['email_field']}")

            # Check if the contact fields exist
            name_exists = contact_type["name_field"] in fields_data
            phone_exists = contact_type["phone_field"] in fields_data
            email_exists = contact_type["email_field"] in fields_data
            print(f"🔍 Fields exist: name={name_exists}, phone={phone_exists}, email={email_exists}")

            # Only add contact type if at least one field exists
            if not (name_exists or phone_exists or email_exists):
                print(f"⚠️ Skipping {contact_type['title']} - no fields found")
                continue

            # Add a section header (as a display-only question)
            section["questions"].append({
                "id": f"{contact_type['id']}-header",
                "type": "display",
                "title": contact_type["title"],
                "description": contact_type["description"],
                "required": False,
                "attachmentRequired": False,
                "isHeader": True
            })

            # Get field data from raw fields
            name_data = fields_data.get(contact_type["name_field"], {})
            phone_data = fields_data.get(contact_type["phone_field"], {})
            email_data = fields_data.get(contact_type["email_field"], {})

            # Name field
            section["questions"].append({
                "id": f"{contact_type['id']}-name",
                "type": "text",
                "title": name_data.get("name", "Name"),
                "required": contact_type["required"],
                "attachmentRequired": False,
                "readonly": contact_type.get("readonly", False),
                "validation": {"maxLength": 100},
                "originalField": contact_type["name_field"],
                "defaultValue": name_data.get("value", "")
            })

            # Phone field
            section["questions"].append({
                "id": f"{contact_type['id']}-phone",
                "type": "text",
                "title": phone_data.get("name", "Phone"),
                "required": contact_type["required"],
                "attachmentRequired": False,
                "readonly": contact_type.get("readonly", False),
                "validation": {"pattern": "^[\\d\\s\\-\\(\\)\\+]+$"},
                "x12Field": {"segment": "PER*IC*{ContactName}*TE*{PhoneNumber}"},
                "originalField": contact_type["phone_field"],
                "defaultValue": phone_data.get("value", "")
            })

            # Email field
            section["questions"].append({
                "id": f"{contact_type['id']}-email",
                "type": "email",
                "title": email_data.get("name", "Email"),
                "required": contact_type["required"],
                "attachmentRequired": False,
                "readonly": contact_type.get("readonly", False),
                "x12Field": {"segment": "PER*IC*{ContactName}*EM*{EmailAddress}"},
                "originalField": contact_type["email_field"],
                "defaultValue": email_data.get("value", "")
            })

        print(f"🔍 Contact section final: {len(section['questions'])} questions")
        for q in section["questions"][:5]:  # Show first 5 questions
            print(f"  - {q['id']}: {q['title']}")
        self.questionnaire["sections"].append(section)

    def _add_enveloping_requirements_section(self, fields_data: Dict):
        """Add enveloping requirements section"""

        section = {
            "id": "enveloping-requirements",
            "title": "Enveloping Requirements",
            "description": "ISA and GS segment configuration requirements",
            "order": 4,
            "questions": []
        }

        # ISA segment fields
        isa_fields = [
            ("ISA06_270", "ISA06 - Interchange Sender ID (270)"),
            ("ISA06_271", "ISA06 - Interchange Sender ID (271)"),
            ("ISA07_271", "ISA07 - Interchange Receiver ID (271)"),
            ("ISA08_270", "ISA08 - Interchange Receiver ID (270)")
        ]

        for field_key, title in isa_fields:
            if field_key in fields_data:
                field = fields_data[field_key]
                section["questions"].append({
                    "id": field_key.lower().replace("_", "-"),
                    "type": "radio",
                    "title": title,
                    "required": False,
                    "options": [
                        {"value": "030240928", "label": "030240928 (Availity defines)"},
                        {"value": "01", "label": "01"},
                        {"value": "custom", "label": "Other (please specify)"}
                    ]
                })

                # Add custom value field
                section["questions"].append({
                    "id": f"{field_key.lower().replace('_', '-')}-custom",
                    "type": "text",
                    "title": f"{title} - Custom Value",
                    "required": False,
                    "conditionalLogic": {
                        "dependsOn": field_key.lower().replace("_", "-"),
                        "showWhen": ["custom"]
                    }
                })

        # GS segment fields
        gs_fields = [
            ("GS02_270", "GS02 - Application Sender's Code (270)"),
            ("GS02_271", "GS02 - Application Sender's Code (271)"),
            ("GS03_270", "GS03 - Application Receiver's Code (270)"),
            ("GS03_271", "GS03 - Application Receiver's Code (271)")
        ]

        for field_key, title in gs_fields:
            if field_key in fields_data:
                section["questions"].append({
                    "id": field_key.lower().replace("_", "-"),
                    "type": "radio",
                    "title": title,
                    "required": False,
                    "options": [
                        {"value": "030240928", "label": "030240928 (Availity defines)"},
                        {"value": "availity_defines", "label": "Availity defines"},
                        {"value": "custom", "label": "Other (please specify)"}
                    ]
                })

        # Character set questions
        section["questions"].extend([
            {
                "id": "uppercase-characters-acceptable",
                "type": "radio",
                "title": "Availity's standard is to send uppercase characters. Is this acceptable?",
                "required": True,
                "options": [
                    {"value": "yes", "label": "Yes"},
                    {"value": "no", "label": "No"}
                ]
            },
            {
                "id": "x12-basic-character-set",
                "type": "radio",
                "title": "A space is part of the X12 basic character set. Does your system accept spaces?",
                "required": True,
                "options": [
                    {"value": "yes", "label": "Yes"},
                    {"value": "no", "label": "No"}
                ]
            },
            {
                "id": "x12-extended-character-set",
                "type": "radio",
                "title": "Do you accept characters from the X12 extended character set?",
                "required": True,
                "options": [
                    {"value": "yes", "label": "Yes"},
                    {"value": "no", "label": "No"}
                ]
            }
        ])

        self.questionnaire["sections"].append(section)

    def _add_patient_information_section(self, fields_data: Dict):
        """Add patient information requirements section"""

        section = {
            "id": "patient-information",
            "title": "Patient Information Requirements",
            "description": "Requirements for patient identification and data formatting",
            "order": 5,
            "questions": [
                {
                    "id": "patient-id-formatting-requirements",
                    "type": "textarea",
                    "title": "Please describe the requirements for the formatting of the patient ID on the 270 request",
                    "required": False,
                    "x12Field": {"segment": "NM1*IL*1*{LastName}*{FirstName}***MI*{MemberID}"}
                },
                {
                    "id": "patient-last-name-requirements",
                    "type": "textarea",
                    "title": "Patient last name requirements",
                    "required": False
                },
                {
                    "id": "patient-first-name-requirements",
                    "type": "textarea",
                    "title": "Patient first name requirements",
                    "required": False
                },
                {
                    "id": "date-of-birth-requirements",
                    "type": "textarea",
                    "title": "Date of birth requirements",
                    "required": False,
                    "x12Field": {"segment": "DMG*D8*{DateOfBirth}"}
                },
                {
                    "id": "gender-code-requirements",
                    "type": "textarea",
                    "title": "Gender code requirements",
                    "required": False
                },
                {
                    "id": "test-files-valid-membership",
                    "type": "radio",
                    "title": "Do test files require valid membership records?",
                    "required": True,
                    "options": [
                        {"value": "yes", "label": "Yes"},
                        {"value": "no", "label": "No"}
                    ]
                }
            ]
        }

        self.questionnaire["sections"].append(section)

    def _add_provider_information_section(self, fields_data: Dict):
        """Add provider information requirements section"""

        section = {
            "id": "provider-information",
            "title": "Provider Information Requirements",
            "description": "Requirements for provider identification and data",
            "order": 6,
            "questions": [
                {
                    "id": "provider-express-entry-requirements",
                    "type": "textarea",
                    "title": "Provider Express Entry requirements",
                    "required": False
                },
                {
                    "id": "provider-identifiers-nm108-requirements",
                    "type": "textarea",
                    "title": "Provider Identifiers NM108 requirements",
                    "required": False
                },
                {
                    "id": "provider-identifiers-nm109-requirements",
                    "type": "textarea",
                    "title": "Provider Identifiers NM109 requirements",
                    "required": False
                },
                {
                    "id": "test-files-valid-provider-data",
                    "type": "radio",
                    "title": "Do test files require valid provider data?",
                    "required": True,
                    "options": [
                        {"value": "yes", "label": "Yes"},
                        {"value": "no", "label": "No"}
                    ]
                },
                {
                    "id": "availity-essentials-state-dropdown",
                    "type": "radio",
                    "title": "In Availity Essentials, providers select payers by first selecting their state in a dropdown list. Is your payer ID the same for all states?",
                    "required": True,
                    "options": [
                        {"value": "yes", "label": "Yes"},
                        {"value": "no", "label": "No"}
                    ],
                    "x12Field": {"segment": "REF*EI*{TaxID}"}
                }
            ]
        }

        self.questionnaire["sections"].append(section)

    def _add_service_information_section(self, fields_data: Dict):
        """Add service information section"""

        section = {
            "id": "service-information",
            "title": "Service Information",
            "description": "Service type codes and benefit information",
            "order": 7,
            "questions": [
                {
                    "id": "support-all-service-type-codes",
                    "type": "radio",
                    "title": "Can you support all service type codes?",
                    "required": True,
                    "options": [
                        {"value": "yes", "label": "Yes"},
                        {"value": "no", "label": "No"}
                    ]
                },
                {
                    "id": "exclude-eb-benefit-types-testing",
                    "type": "radio",
                    "title": "Do you exclude any E&B benefit types from testing?",
                    "required": True,
                    "options": [
                        {"value": "yes", "label": "Yes"},
                        {"value": "no", "label": "No"}
                    ]
                },
                {
                    "id": "excluded-eb-benefit-types-specify",
                    "type": "textarea",
                    "title": "If yes, please specify which E&B benefit types you exclude from testing:",
                    "required": False,
                    "conditionalLogic": {
                        "dependsOn": "exclude-eb-benefit-types-testing",
                        "showWhen": ["yes"]
                    }
                }
            ]
        }

        self.questionnaire["sections"].append(section)

    def _add_testing_requirements_section(self, fields_data: Dict):
        """Add testing requirements section"""

        section = {
            "id": "testing-requirements",
            "title": "Testing Requirements",
            "description": "Testing environment and requirements",
            "order": 8,
            "questions": [
                {
                    "id": "specific-testing-requirements",
                    "type": "radio",
                    "title": "Does your organization have specific testing requirements?",
                    "required": True,
                    "options": [
                        {"value": "yes", "label": "Yes"},
                        {"value": "no", "label": "No"}
                    ]
                },
                {
                    "id": "specific-testing-requirements-details",
                    "type": "textarea",
                    "title": "If yes, please specify your testing requirements:",
                    "required": False,
                    "conditionalLogic": {
                        "dependsOn": "specific-testing-requirements",
                        "showWhen": ["yes"]
                    }
                },
                {
                    "id": "designated-payer-id-testing",
                    "type": "radio",
                    "title": "Do you have a designated payer ID you would like Availity to use in testing?",
                    "required": True,
                    "options": [
                        {"value": "yes", "label": "Yes"},
                        {"value": "no", "label": "No"}
                    ]
                },
                {
                    "id": "designated-payer-id-specify",
                    "type": "textarea",
                    "title": "If yes, please specify the payer ID (include separate attachment if you require different IDs for different lines of business):",
                    "required": False,
                    "conditionalLogic": {
                        "dependsOn": "designated-payer-id-testing",
                        "showWhen": ["yes"]
                    }
                },
                {
                    "id": "min-max-test-transactions",
                    "type": "radio",
                    "title": "Do you have a minimum or maximum number of test transactions you will accept?",
                    "required": True,
                    "options": [
                        {"value": "yes", "label": "Yes"},
                        {"value": "no", "label": "No"}
                    ]
                },
                {
                    "id": "min-max-test-transactions-specify",
                    "type": "textarea",
                    "title": "If yes, please specify the minimum/maximum number:",
                    "required": False,
                    "conditionalLogic": {
                        "dependsOn": "min-max-test-transactions",
                        "showWhen": ["yes"]
                    }
                },
                {
                    "id": "other-testing-restrictions",
                    "type": "radio",
                    "title": "Do you have any other testing or test transaction restrictions?",
                    "required": True,
                    "options": [
                        {"value": "yes", "label": "Yes"},
                        {"value": "no", "label": "No"}
                    ]
                },
                {
                    "id": "other-testing-restrictions-specify",
                    "type": "textarea",
                    "title": "If yes, please specify the restrictions:",
                    "required": False,
                    "conditionalLogic": {
                        "dependsOn": "other-testing-restrictions",
                        "showWhen": ["yes"]
                    }
                },
                {
                    "id": "test-file-ready-date",
                    "type": "date",
                    "title": "When will you be prepared to receive a test file?",
                    "description": "Please specify a date or date range",
                    "required": False
                }
            ]
        }

        self.questionnaire["sections"].append(section)

    def _add_connectivity_section(self, fields_data: Dict):
        """Add connectivity requirements section"""

        section = {
            "id": "connectivity-requirements",
            "title": "Connectivity Requirements",
            "description": "Technical connectivity and system requirements",
            "order": 9,
            "questions": [
                {
                    "id": "xml-envelope-structure",
                    "type": "radio",
                    "title": "Availity supports XML envelope structure. Do you require an XML wrapper?",
                    "required": True,
                    "options": [
                        {"value": "yes", "label": "Yes"},
                        {"value": "no", "label": "No"}
                    ]
                },
                {
                    "id": "differing-connectivity-by-state",
                    "type": "radio",
                    "title": "Do you have differing connectivity requirements for each state?",
                    "required": True,
                    "options": [
                        {"value": "yes", "label": "Yes"},
                        {"value": "no", "label": "No"}
                    ]
                },
                {
                    "id": "test-url",
                    "type": "url",
                    "title": "Test URL",
                    "required": False
                },
                {
                    "id": "test-user-ids",
                    "type": "textarea",
                    "title": "Test User IDs",
                    "required": False
                },
                {
                    "id": "prod-url",
                    "type": "url",
                    "title": "Production URL",
                    "required": False
                },
                {
                    "id": "prod-user-ids",
                    "type": "textarea",
                    "title": "Production User IDs",
                    "required": False
                },
                {
                    "id": "system-hours-availability",
                    "type": "textarea",
                    "title": "What are your system's hours of availability?",
                    "required": False
                },
                {
                    "id": "continuous-threads-support",
                    "type": "number",
                    "title": "How many continuous threads can you support?",
                    "required": False
                }
            ]
        }

        self.questionnaire["sections"].append(section)

    def _add_edi_batch_specific_section(self, fields_data: Dict):
        """Add EDI batch specific section"""

        section = {
            "id": "edi-batch-specific",
            "title": "EDI Batch Specific Requirements",
            "description": "Requirements specific to EDI batch processing",
            "order": 10,
            "questions": [
                {
                    "id": "naming-convention-inbound-files",
                    "type": "textarea",
                    "title": "Please define your naming convention for inbound files",
                    "required": False
                },
                {
                    "id": "separate-test-environment-edi",
                    "type": "radio",
                    "title": "Does your organization have a separate test environment for EDI transactions?",
                    "required": True,
                    "options": [
                        {"value": "yes", "label": "Yes"},
                        {"value": "no", "label": "No"}
                    ]
                },
                {
                    "id": "separate-test-environment-describe",
                    "type": "textarea",
                    "title": "If yes, please describe your separate test environment:",
                    "required": False,
                    "conditionalLogic": {
                        "dependsOn": "separate-test-environment-edi",
                        "showWhen": ["yes"]
                    }
                }
            ],
            "conditionalLogic": {
                "dependsOn": "implementation-mode-selection",
                "showWhen": ["edi_batch"]
            }
        }

        self.questionnaire["sections"].append(section)

    def _add_production_approval_section(self, fields_data: Dict):
        """Add production approval section"""

        section = {
            "id": "production-approval",
            "title": "Production Approval Process",
            "description": "Production approval and go-live requirements",
            "order": 11,
            "questions": [
                {
                    "id": "production-approval-process",
                    "type": "textarea",
                    "title": "Please describe your production approval process",
                    "required": False
                },
                {
                    "id": "test-environment-continue-available",
                    "type": "radio",
                    "title": "After you receive production approval, will your test environment continue to be available?",
                    "required": True,
                    "options": [
                        {"value": "yes", "label": "Yes"},
                        {"value": "no", "label": "No"}
                    ]
                }
            ]
        }

        self.questionnaire["sections"].append(section)

    def _convert_field_to_question(self, field_name: str, field_data: Dict, form_control_data: Dict = None) -> Dict:
        """Convert a PDF field to a questionnaire question"""
        
        question = {
            "id": self._sanitize_id(field_name),
            "title": self._clean_title(field_name),
            "required": field_data.get("required", False)
        }
        
        # Determine question type based on field analysis
        field_type = field_data.get("field_type", "unknown")
        
        if form_control_data and "options" in form_control_data:
            options = form_control_data["options"]
            if len(options) > 0:
                question["type"] = "radio"
                question["options"] = [
                    {"value": opt["value"], "label": opt["label"]}
                    for opt in options
                ]
            else:
                question["type"] = "text"
        elif field_type == "signature":
            question["type"] = "radio"
            question["options"] = [
                {"value": "yes", "label": "Yes"},
                {"value": "no", "label": "No"}
            ]
        elif "email" in field_name.lower():
            question["type"] = "email"
        elif "phone" in field_name.lower():
            question["type"] = "text"
            question["validation"] = {"pattern": "^[\\d\\s\\-\\(\\)\\+]+$"}
        elif "date" in field_name.lower():
            question["type"] = "date"
        elif "url" in field_name.lower():
            question["type"] = "url"
        else:
            question["type"] = "text"
        
        # Add X12 mapping if available
        if field_data.get("x12_mapping"):
            question["x12Field"] = {"segment": field_data["x12_mapping"]}
        
        # Add conditional logic for "If Yes" fields
        if "if yes" in field_name.lower():
            base_field = re.sub(r'\s*if\s+yes.*', '', field_name, flags=re.IGNORECASE)
            question["conditionalLogic"] = {
                "dependsOn": self._sanitize_id(base_field),
                "showWhen": ["yes"]
            }
        
        return question

    def _sanitize_id(self, text: str) -> str:
        """Convert text to a valid ID"""
        return re.sub(r'[^a-zA-Z0-9]+', '-', text.lower()).strip('-')

    def _clean_title(self, text: str) -> str:
        """Clean up field name for display"""
        # Remove common suffixes
        text = re.sub(r'_\d+$', '', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    def _save_questionnaire(self):
        """Save the generated questionnaire"""
        
        output_dir = Path("extracted_fields")
        output_dir.mkdir(exist_ok=True)
        
        # Save complete questionnaire
        with open(output_dir / "complete_questionnaire.json", 'w') as f:
            json.dump(self.questionnaire, f, indent=2, default=str)
        
        # Generate summary
        total_questions = sum(len(section["questions"]) for section in self.questionnaire["sections"])
        
        print(f"✅ Complete questionnaire generated!")
        print(f"📊 {len(self.questionnaire['sections'])} sections")
        print(f"📋 {total_questions} total questions")
        print(f"💾 Saved to: {output_dir / 'complete_questionnaire.json'}")

if __name__ == "__main__":
    generator = QuestionnaireGenerator()
    questionnaire = generator.generate_complete_questionnaire()
