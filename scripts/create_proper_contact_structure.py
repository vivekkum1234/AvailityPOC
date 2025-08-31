#!/usr/bin/env python3
"""
Create Proper Contact Structure

This script creates a proper contact information section that matches
the PDF structure with Trading Partner and Availity contact categories.
"""

import json
from pathlib import Path

def create_proper_contact_structure():
    """Create proper contact structure matching the PDF"""

    # Load the raw fields to get the actual field data
    fields_path = Path("extracted_fields/fields_raw.json")
    if not fields_path.exists():
        print("❌ fields_raw.json not found")
        return

    with open(fields_path, 'r') as f:
        raw_fields = json.load(f)

    # First, update the section for all contact fields in the raw data
    contact_field_names = [
        "Name1", "Phone1", "Email1", "Name2", "Phone2", "Email2",
        "Name3", "Phone3", "Email3", "Name4", "Phone4", "Email4",
        "AVName1", "AVPhone1", "AVEmail1", "AVName2", "AVPhone2", "AVEmail2",
        "AVName3", "AVPhone3", "AVEmail3", "AVName4", "AVPhone4", "AVEmail4"
    ]

    # Update sections for contact fields
    for field_name in contact_field_names:
        if field_name in raw_fields:
            raw_fields[field_name]["section"] = "contact_information"

    # Save the updated raw fields
    with open(fields_path, 'w') as f:
        json.dump(raw_fields, f, indent=2)

    print(f"✅ Updated {len(contact_field_names)} contact fields to 'contact_information' section")
    
    # Create the contact information section with proper structure
    contact_section = {
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
        # Add a section header (as a display-only question)
        contact_section["questions"].append({
            "id": f"{contact_type['id']}-header",
            "type": "display",
            "title": contact_type["title"],
            "description": contact_type["description"],
            "required": False,
            "attachmentRequired": False,
            "isHeader": True
        })
        
        # Get field data from raw fields
        name_data = raw_fields.get(contact_type["name_field"], {})
        phone_data = raw_fields.get(contact_type["phone_field"], {})
        email_data = raw_fields.get(contact_type["email_field"], {})
        
        # Name field
        contact_section["questions"].append({
            "id": f"{contact_type['id']}-name",
            "type": "text",
            "title": "Name",
            "required": contact_type["required"],
            "attachmentRequired": False,
            "readonly": contact_type.get("readonly", False),
            "validation": {"maxLength": 100},
            "originalField": contact_type["name_field"],
            "defaultValue": name_data.get("value", "")
        })
        
        # Phone field
        contact_section["questions"].append({
            "id": f"{contact_type['id']}-phone",
            "type": "text", 
            "title": "Phone",
            "required": contact_type["required"],
            "attachmentRequired": False,
            "readonly": contact_type.get("readonly", False),
            "validation": {"pattern": "^[\\d\\s\\-\\(\\)\\+]+$"},
            "x12Field": {"segment": "PER*IC*{ContactName}*TE*{PhoneNumber}"},
            "originalField": contact_type["phone_field"],
            "defaultValue": phone_data.get("value", "")
        })
        
        # Email field
        contact_section["questions"].append({
            "id": f"{contact_type['id']}-email",
            "type": "email",
            "title": "Email",
            "required": contact_type["required"],
            "attachmentRequired": False,
            "readonly": contact_type.get("readonly", False),
            "x12Field": {"segment": "PER*IC*{ContactName}*EM*{EmailAddress}"},
            "originalField": contact_type["email_field"],
            "defaultValue": email_data.get("value", "")
        })
    
    # Save the contact section
    output_path = Path("extracted_fields/contact_section_proper.json")
    with open(output_path, 'w') as f:
        json.dump(contact_section, f, indent=2)
    
    print("✅ Created proper contact structure!")
    print(f"📋 {len(contact_section['questions'])} contact questions")
    print(f"👥 {len(contact_types)} contact types")
    print(f"💾 Saved to: {output_path}")
    
    # Also create a summary for review
    create_contact_summary(contact_types)

def create_contact_summary(contact_types):
    """Create a summary of the contact structure"""
    
    summary = "# Contact Information Structure\n\n"
    summary += "This matches the PDF structure exactly:\n\n"
    
    for i, contact_type in enumerate(contact_types, 1):
        summary += f"## {i}. {contact_type['title']}\n"
        summary += f"- **Description**: {contact_type['description']}\n"
        summary += f"- **Required**: {'Yes' if contact_type['required'] else 'No'}\n"
        summary += f"- **Read-only**: {'Yes' if contact_type.get('readonly') else 'No'}\n"
        summary += f"- **Fields**: {contact_type['name_field']}, {contact_type['phone_field']}, {contact_type['email_field']}\n\n"
    
    summary += "## Field Mapping\n\n"
    summary += "| PDF Field | Questionnaire Field | Type |\n"
    summary += "|-----------|-------------------|------|\n"
    
    for contact_type in contact_types:
        prefix = contact_type['id']
        summary += f"| {contact_type['name_field']} | {prefix}-name | Name |\n"
        summary += f"| {contact_type['phone_field']} | {prefix}-phone | Phone |\n" 
        summary += f"| {contact_type['email_field']} | {prefix}-email | Email |\n"
    
    # Save summary
    with open("extracted_fields/contact_structure_summary.md", 'w') as f:
        f.write(summary)
    
    print(f"📄 Contact summary saved to: extracted_fields/contact_structure_summary.md")

if __name__ == "__main__":
    create_proper_contact_structure()
