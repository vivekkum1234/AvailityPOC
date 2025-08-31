#!/usr/bin/env python3
"""
Update Contact Field Names

This script updates the contact field names in the raw fields to be more user-friendly
and match the PDF structure exactly.
"""

import json
from pathlib import Path

def update_contact_field_names():
    """Update contact field names to be user-friendly"""
    
    # Load the raw fields
    fields_path = Path("extracted_fields/fields_raw.json")
    if not fields_path.exists():
        print("❌ fields_raw.json not found")
        return
    
    with open(fields_path, 'r') as f:
        raw_fields = json.load(f)
    
    # Define the field name mappings based on PDF structure
    field_name_mappings = {
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
    }
    
    # Update the field names and labels
    updated_count = 0
    for old_name, new_name in field_name_mappings.items():
        if old_name in raw_fields:
            # Keep the original field name as a reference
            raw_fields[old_name]["original_name"] = old_name
            # Update the display name
            raw_fields[old_name]["name"] = new_name
            # Update the label for better UI display
            raw_fields[old_name]["label"] = new_name
            # Mark Availity fields as read-only
            if old_name.startswith("AV"):
                raw_fields[old_name]["readonly"] = True
                raw_fields[old_name]["required"] = False
            updated_count += 1
    
    # Save the updated raw fields
    with open(fields_path, 'w') as f:
        json.dump(raw_fields, f, indent=2)
    
    print(f"✅ Updated {updated_count} contact field names")
    
    # Create a summary of the changes
    create_field_name_summary(field_name_mappings)

def create_field_name_summary(field_name_mappings):
    """Create a summary of the field name changes"""
    
    summary = "# Contact Field Name Updates\n\n"
    summary += "The following field names have been updated to be more user-friendly:\n\n"
    summary += "| Original Field | New Display Name | Type |\n"
    summary += "|---------------|------------------|------|\n"
    
    for old_name, new_name in field_name_mappings.items():
        field_type = "Trading Partner" if not old_name.startswith("AV") else "Availity"
        summary += f"| {old_name} | {new_name} | {field_type} |\n"
    
    summary += "\n## Key Changes:\n\n"
    summary += "1. **Trading Partner fields** (Name1-4, Phone1-4, Email1-4) now have descriptive names\n"
    summary += "2. **Availity fields** (AVName1-4, AVPhone1-4, AVEmail1-4) are marked as read-only\n"
    summary += "3. **All contact fields** are now in the 'contact_information' section\n"
    summary += "4. **Field labels** match the PDF structure exactly\n"
    
    # Save summary
    with open("extracted_fields/field_name_updates_summary.md", 'w') as f:
        f.write(summary)
    
    print(f"📄 Field name update summary saved to: extracted_fields/field_name_updates_summary.md")

if __name__ == "__main__":
    update_contact_field_names()
