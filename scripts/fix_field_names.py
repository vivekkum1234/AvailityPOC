#!/usr/bin/env python3
"""
Fix Field Names for User-Friendly Display

This script converts technical field names to user-readable names
that match what users would expect to see in a professional questionnaire.
"""

import json
import re
from pathlib import Path

def fix_field_names():
    """Fix field names to be user-readable"""
    
    # Load the complete questionnaire
    questionnaire_path = Path("extracted_fields/complete_questionnaire.json")
    if not questionnaire_path.exists():
        print("❌ complete_questionnaire.json not found")
        return
    
    with open(questionnaire_path, 'r') as f:
        questionnaire = json.load(f)
    
    # Field name mappings for better user experience
    field_name_mappings = {
        # Contact fields - matching PDF structure exactly
        # Trading Partner contacts (Name1-4, Phone1-4, Email1-4)
        "Name1": "Trading Partner Technical Contact - Name",
        "Phone1": "Trading Partner Technical Contact - Phone",
        "Email1": "Trading Partner Technical Contact - Email",
        "Name2": "Trading Partner Account/Program Manager - Name",
        "Phone2": "Trading Partner Account/Program Manager - Phone",
        "Email2": "Trading Partner Account/Program Manager - Email",
        "Name3": "Trading Partner Escalation Contact - Name",
        "Phone3": "Trading Partner Escalation Contact - Phone",
        "Email3": "Trading Partner Escalation Contact - Email",
        "Name4": "Additional Trading Partner Contact - Name",
        "Phone4": "Additional Trading Partner Contact - Phone",
        "Email4": "Additional Trading Partner Contact - Email",

        # Availity contacts (AVName1-4, AVPhone1-4, AVEmail1-4)
        "AVName1": "Availity Technical Contact - Name",
        "AVPhone1": "Availity Technical Contact - Phone",
        "AVEmail1": "Availity Technical Contact - Email",
        "AVName2": "Availity Account/Program Manager - Name",
        "AVPhone2": "Availity Account/Program Manager - Phone",
        "AVEmail2": "Availity Account/Program Manager - Email",
        "AVName3": "Availity Escalation Contact - Name",
        "AVPhone3": "Availity Escalation Contact - Phone",
        "AVEmail3": "Availity Escalation Contact - Email",
        "AVName4": "Other Availity Contact - Name",
        "AVPhone4": "Other Availity Contact - Phone",
        "AVEmail4": "Other Availity Contact - Email",

        # Generated contact fields (if any)
        "contact-1-name": "Trading Partner Technical Contact - Name",
        "contact-1-phone": "Trading Partner Technical Contact - Phone",
        "contact-1-email": "Trading Partner Technical Contact - Email",
        "contact-2-name": "Availity Technical Contact - Name",
        "contact-2-phone": "Availity Technical Contact - Phone",
        "contact-2-email": "Availity Technical Contact - Email",
        "contact-3-name": "Trading Partner Account/Program Manager - Name",
        "contact-3-phone": "Trading Partner Account/Program Manager - Phone",
        "contact-3-email": "Trading Partner Account/Program Manager - Email",
        "contact-4-name": "Availity Account/Program Manager - Name",
        "contact-4-phone": "Availity Account/Program Manager - Phone",
        "contact-4-email": "Availity Account/Program Manager - Email",
        
        # ISA fields
        "isa06-270": "ISA06 - Interchange Sender ID (270 Request)",
        "isa06-270-custom": "ISA06 - Custom Sender ID (270)",
        "isa06-271": "ISA06 - Interchange Sender ID (271 Response)",
        "isa06-271-custom": "ISA06 - Custom Sender ID (271)",
        "isa07-271": "ISA07 - Interchange Receiver ID (271 Response)",
        "isa07-271-custom": "ISA07 - Custom Receiver ID (271)",
        "isa08-270": "ISA08 - Interchange Receiver ID (270 Request)",
        "isa08-270-custom": "ISA08 - Custom Receiver ID (270)",
        
        # GS fields
        "gs02-270": "GS02 - Application Sender's Code (270 Request)",
        "gs02-271": "GS02 - Application Sender's Code (271 Response)",
        "gs03-270": "GS03 - Application Receiver's Code (270 Request)",
        "gs03-271": "GS03 - Application Receiver's Code (271 Response)",
        
        # Character set questions
        "uppercase-characters-acceptable": "Do you accept uppercase characters?",
        "x12-basic-character-set": "Do you accept spaces (X12 basic character set)?",
        "x12-extended-character-set": "Do you accept X12 extended character set characters?",
        
        # Patient information
        "patient-id-formatting-requirements": "Patient ID Formatting Requirements",
        "patient-last-name-requirements": "Patient Last Name Requirements",
        "patient-first-name-requirements": "Patient First Name Requirements", 
        "date-of-birth-requirements": "Date of Birth Requirements",
        "gender-code-requirements": "Gender Code Requirements",
        "test-files-valid-membership": "Do test files require valid membership records?",
        
        # Provider information
        "provider-express-entry-requirements": "Provider Express Entry Requirements",
        "provider-identifiers-nm108-requirements": "Provider Identifiers (NM108) Requirements",
        "provider-identifiers-nm109-requirements": "Provider Identifiers (NM109) Requirements",
        "test-files-valid-provider-data": "Do test files require valid provider data?",
        "availity-essentials-state-dropdown": "Is your payer ID the same for all states?",
        
        # Service information
        "support-all-service-type-codes": "Can you support all service type codes?",
        "exclude-eb-benefit-types-testing": "Do you exclude any E&B benefit types from testing?",
        "excluded-eb-benefit-types-specify": "Which E&B benefit types do you exclude?",
        
        # Testing requirements
        "specific-testing-requirements": "Do you have specific testing requirements?",
        "specific-testing-requirements-details": "Please specify your testing requirements",
        "designated-payer-id-testing": "Do you have a designated payer ID for testing?",
        "designated-payer-id-specify": "Please specify the payer ID for testing",
        "min-max-test-transactions": "Do you have min/max test transaction limits?",
        "min-max-test-transactions-specify": "Please specify the min/max limits",
        "other-testing-restrictions": "Do you have other testing restrictions?",
        "other-testing-restrictions-specify": "Please specify the restrictions",
        "test-file-ready-date": "When will you be ready to receive test files?",
        
        # Connectivity
        "xml-envelope-structure": "Do you require an XML wrapper?",
        "differing-connectivity-by-state": "Do you have different connectivity requirements by state?",
        "test-url": "Test Environment URL",
        "test-user-ids": "Test User IDs",
        "prod-url": "Production Environment URL", 
        "prod-user-ids": "Production User IDs",
        "system-hours-availability": "System Hours of Availability",
        "continuous-threads-support": "How many continuous threads can you support?",
        
        # EDI Batch specific
        "naming-convention-inbound-files": "Naming Convention for Inbound Files",
        "separate-test-environment-edi": "Do you have a separate test environment for EDI?",
        "separate-test-environment-describe": "Please describe your separate test environment",
        
        # Production approval
        "production-approval-process": "Production Approval Process",
        "test-environment-continue-available": "Will test environment remain available after production approval?"
    }
    
    # Apply field name fixes
    for section in questionnaire["sections"]:
        for question in section["questions"]:
            original_id = question["id"]
            
            # Check if we have a mapping for this field
            if original_id in field_name_mappings:
                question["title"] = field_name_mappings[original_id]
            else:
                # Apply general formatting rules
                question["title"] = format_field_name(question["title"])
    
    # Save the updated questionnaire
    with open(questionnaire_path, 'w') as f:
        json.dump(questionnaire, f, indent=2)
    
    # Regenerate the backend TypeScript file
    regenerate_backend_questionnaire(questionnaire)
    
    print("✅ Field names updated to be user-friendly!")
    print(f"📝 Updated {sum(len(s['questions']) for s in questionnaire['sections'])} field names")

def format_field_name(name: str) -> str:
    """Apply general formatting rules to make field names user-friendly"""
    
    # Remove technical prefixes/suffixes
    name = re.sub(r'^(contact-\d+-|isa\d+-|gs\d+-)', '', name)
    
    # Convert kebab-case to title case
    name = name.replace('-', ' ').title()
    
    # Fix common abbreviations
    replacements = {
        'Id': 'ID',
        'Url': 'URL',
        'Xml': 'XML',
        'Edi': 'EDI',
        'B2b': 'B2B',
        'Api': 'API',
        'Hipaa': 'HIPAA',
        'X12': 'X12',
        'Nm108': 'NM108',
        'Nm109': 'NM109',
        'Isa': 'ISA',
        'Gs': 'GS'
    }
    
    for old, new in replacements.items():
        name = re.sub(rf'\b{old}\b', new, name)
    
    return name

def regenerate_backend_questionnaire(questionnaire):
    """Regenerate the backend TypeScript file with updated names"""
    
    # This is a simplified regeneration - in a real scenario you'd want
    # to run the full conversion script again
    print("📝 Backend TypeScript file should be regenerated...")
    print("💡 Run: python3 scripts/convert_questionnaire_to_backend.py")

if __name__ == "__main__":
    fix_field_names()
