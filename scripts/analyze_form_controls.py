#!/usr/bin/env python3
"""
Advanced PDF Form Control Analyzer

This script provides detailed analysis of PDF form controls including:
- Exact field types (checkbox, radio, dropdown, etc.)
- All possible values and options
- Field groupings and relationships
- Visual properties and layout

Usage:
    python analyze_form_controls.py <pdf_file>
"""

import sys
import json
from pathlib import Path
import fitz  # PyMuPDF

def analyze_pdf_form_controls(pdf_path):
    """Analyze PDF form controls in detail"""
    
    print(f"🔍 Analyzing form controls in: {pdf_path}")
    
    try:
        doc = fitz.open(pdf_path)
        analysis = {
            "total_pages": len(doc),
            "total_fields": 0,
            "field_types": {},
            "fields_by_page": {},
            "field_details": {}
        }
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            widgets = page.widgets()
            
            page_fields = []
            
            for widget in widgets:
                field_name = widget.field_name or f"unnamed_field_{len(analysis['field_details'])}"
                
                # Detailed widget analysis
                widget_info = analyze_widget_detailed(widget, page_num + 1)
                
                analysis['field_details'][field_name] = widget_info
                page_fields.append(field_name)
                
                # Count field types
                field_type = widget_info['control_type']
                analysis['field_types'][field_type] = analysis['field_types'].get(field_type, 0) + 1
                
                analysis['total_fields'] += 1
            
            analysis['fields_by_page'][f"page_{page_num + 1}"] = page_fields
        
        doc.close()
        
        # Analyze radio button groups
        analysis['radio_groups'] = analyze_radio_button_groups(analysis['field_details'])

        # Generate summary report
        generate_control_analysis_report(analysis, pdf_path)

        return analysis
        
    except Exception as e:
        print(f"❌ Error analyzing PDF: {e}")
        return None

def analyze_widget_detailed(widget, page_num):
    """Perform detailed analysis of a single widget"""
    
    # Basic widget properties
    widget_type = widget.field_type
    field_name = widget.field_name or "unnamed"
    field_value = widget.field_value or ""
    field_flags = widget.field_flags
    
    # Determine precise control type
    control_type, control_subtype = determine_precise_control_type(widget)
    
    # Get all possible values/options
    options = extract_all_field_options(widget, control_type)



    # Analyze field flags in detail
    flags_analysis = analyze_field_flags_detailed(field_flags)
    
    # Get visual properties
    visual_props = get_visual_properties(widget)
    
    widget_info = {
        "field_name": field_name,
        "page": page_num,
        "widget_type_code": widget_type,
        "control_type": control_type,
        "control_subtype": control_subtype,
        "current_value": field_value,
        "options": options,
        "flags": field_flags,
        "flags_analysis": flags_analysis,
        "visual_properties": visual_props,
        "rect": list(widget.rect) if widget.rect else [],
    }
    
    return widget_info

def determine_precise_control_type(widget):
    """Determine the precise control type and subtype"""
    
    widget_type = widget.field_type
    flags = widget.field_flags
    
    # Widget type constants from PyMuPDF
    type_mapping = {
        0: ("unknown", "unknown"),
        1: ("button", "button"),
        2: ("text", "textbox"),
        3: ("choice", "listbox"),
        4: ("choice", "combobox"),
        5: ("signature", "signature")
    }
    
    base_type, base_subtype = type_mapping.get(widget_type, ("unknown", "unknown"))
    
    # Refine button types based on flags
    if widget_type == 1:  # Button
        if flags & 32768:  # Radio button flag (0x8000)
            return ("radio", "radio_button")
        elif flags & 65536:  # Pushbutton flag (0x10000)
            return ("button", "push_button")
        else:  # Default to checkbox
            return ("checkbox", "checkbox")
    
    # Refine text types based on flags
    elif widget_type == 2:  # Text
        if flags & 4096:  # Multiline flag (0x1000)
            return ("text", "textarea")
        elif flags & 8192:  # Password flag (0x2000)
            return ("text", "password")
        else:
            return ("text", "textbox")
    
    # Choice types
    elif widget_type == 3:
        return ("choice", "listbox")
    elif widget_type == 4:
        return ("choice", "combobox")
    
    return (base_type, base_subtype)

def extract_all_field_options(widget, control_type):
    """Extract all possible options for a field"""

    options = []

    try:
        # For choice fields (dropdown, listbox, combobox)
        if control_type == "choice":
            if hasattr(widget, 'choice_values') and widget.choice_values:
                for i, value in enumerate(widget.choice_values):
                    options.append({
                        "index": i,
                        "value": str(value),
                        "label": str(value),
                        "type": "choice_option"
                    })

        # For radio buttons and signature fields
        elif control_type in ["radio", "signature"]:
            current_value = widget.field_value or ""



            # Analyze the current value to infer possible options
            if current_value:
                # Check if it's a numbered option (like "No_3", "Yes_2")
                if "_" in current_value:
                    base_value = current_value.split("_")[0]
                    options.extend([
                        {
                            "value": f"{base_value}_1",
                            "label": f"{base_value} (Option 1)",
                            "type": "radio_option",
                            "selected": current_value == f"{base_value}_1"
                        },
                        {
                            "value": f"{base_value}_2",
                            "label": f"{base_value} (Option 2)",
                            "type": "radio_option",
                            "selected": current_value == f"{base_value}_2"
                        },
                        {
                            "value": f"{base_value}_3",
                            "label": f"{base_value} (Option 3)",
                            "type": "radio_option",
                            "selected": current_value == f"{base_value}_3"
                        }
                    ])
                else:
                    # Add the current value as selected
                    options.append({
                        "value": current_value,
                        "label": current_value,
                        "type": "radio_option",
                        "selected": True
                    })

            # Add common Yes/No options for signature/radio fields
            common_values = ["Yes", "No", "On", "Off"]
            for val in common_values:
                if not any(opt["value"] == val for opt in options):
                    options.append({
                        "value": val,
                        "label": val,
                        "type": "radio_option",
                        "selected": current_value == val
                    })

        # For checkboxes
        elif control_type == "checkbox":
            current_value = widget.field_value or "Off"
            options = [
                {
                    "value": "On",
                    "label": "Checked",
                    "type": "checkbox_state",
                    "selected": current_value not in ["Off", "", "No"]
                },
                {
                    "value": "Off",
                    "label": "Unchecked",
                    "type": "checkbox_state",
                    "selected": current_value in ["Off", "", "No"]
                }
            ]

    except Exception as e:
        print(f"Warning: Error extracting options for field: {e}")

    return options

def analyze_radio_button_groups(field_details):
    """Analyze radio button groups to identify related fields and their options"""

    radio_groups = {}

    # Group fields by similar names (likely radio button groups)
    for field_name, details in field_details.items():
        if details['control_type'] in ['radio', 'signature']:
            # Try to identify the base question
            base_question = field_name

            # Remove common suffixes that might indicate duplicates
            for suffix in ['_2', '_3', '2', '3']:
                if base_question.endswith(suffix):
                    base_question = base_question[:-len(suffix)]
                    break

            if base_question not in radio_groups:
                radio_groups[base_question] = {
                    'base_question': base_question,
                    'fields': [],
                    'all_values': set(),
                    'question_type': 'yes_no' if any(word in base_question.lower()
                                                   for word in ['do you', 'will you', 'can you', 'is', 'are']) else 'other'
                }

            radio_groups[base_question]['fields'].append({
                'field_name': field_name,
                'current_value': details['current_value'],
                'page': details['page']
            })

            # Collect all possible values
            if details['current_value']:
                radio_groups[base_question]['all_values'].add(details['current_value'])

    # Convert sets to lists for JSON serialization
    for group in radio_groups.values():
        group['all_values'] = list(group['all_values'])

        # Infer likely options based on question type
        if group['question_type'] == 'yes_no':
            group['likely_options'] = ['Yes', 'No']
        else:
            group['likely_options'] = list(group['all_values'])

    return radio_groups

def analyze_field_flags_detailed(flags):
    """Provide detailed analysis of field flags"""
    
    flag_meanings = {
        1: "ReadOnly",
        2: "Required", 
        4: "NoExport",
        8: "Multiline",
        16: "Password",
        32: "NoToggleToOff",
        64: "Radio",
        128: "Pushbutton",
        256: "Combo",
        512: "Edit",
        1024: "Sort",
        2048: "FileSelect",
        4096: "Multiline",
        8192: "Password",
        16384: "DoNotScroll",
        32768: "Radio",
        65536: "Pushbutton",
        131072: "Combo",
        262144: "Edit",
        524288: "Sort"
    }
    
    active_flags = []
    for flag_value, meaning in flag_meanings.items():
        if flags & flag_value:
            active_flags.append({
                "flag_value": flag_value,
                "meaning": meaning,
                "hex": f"0x{flag_value:X}"
            })
    
    return {
        "raw_flags": flags,
        "hex_flags": f"0x{flags:X}",
        "active_flags": active_flags,
        "is_required": bool(flags & 2),
        "is_readonly": bool(flags & 1),
        "is_multiline": bool(flags & 4096),
        "is_password": bool(flags & 8192),
        "is_radio": bool(flags & 32768),
        "is_pushbutton": bool(flags & 65536),
        "is_combo": bool(flags & 131072)
    }

def get_visual_properties(widget):
    """Extract visual properties of the widget"""
    
    try:
        return {
            "rect": list(widget.rect) if widget.rect else [],
            "width": widget.rect.width if widget.rect else 0,
            "height": widget.rect.height if widget.rect else 0,
            "border_color": getattr(widget, 'border_color', None),
            "fill_color": getattr(widget, 'fill_color', None),
            "text_color": getattr(widget, 'text_color', None),
            "border_width": getattr(widget, 'border_width', None)
        }
    except:
        return {}

def generate_control_analysis_report(analysis, pdf_path):
    """Generate a comprehensive report of form controls"""
    
    output_dir = Path("extracted_fields")
    output_dir.mkdir(exist_ok=True)
    
    # Save detailed JSON
    with open(output_dir / "form_controls_analysis.json", 'w') as f:
        json.dump(analysis, f, indent=2)
    
    # Generate markdown report
    report_path = output_dir / "form_controls_report.md"
    
    with open(report_path, 'w') as f:
        f.write(f"# Form Controls Analysis: {Path(pdf_path).name}\n\n")
        f.write(f"**Total Fields:** {analysis['total_fields']}\n")
        f.write(f"**Total Pages:** {analysis['total_pages']}\n\n")
        
        f.write("## Field Type Distribution\n\n")
        for field_type, count in sorted(analysis['field_types'].items()):
            f.write(f"- **{field_type}**: {count} fields\n")
        
        f.write("\n## Detailed Field Analysis\n\n")
        
        for field_name, details in analysis['field_details'].items():
            f.write(f"### {field_name}\n")
            f.write(f"- **Page:** {details['page']}\n")
            f.write(f"- **Control Type:** {details['control_type']} ({details['control_subtype']})\n")
            f.write(f"- **Current Value:** `{details['current_value']}`\n")
            f.write(f"- **Required:** {details['flags_analysis']['is_required']}\n")
            f.write(f"- **ReadOnly:** {details['flags_analysis']['is_readonly']}\n")
            
            if details['options']:
                f.write(f"- **Options:** {len(details['options'])} available\n")
                for opt in details['options']:
                    selected = " ✓" if opt.get('selected', False) else ""
                    f.write(f"  - `{opt['value']}` ({opt['label']}){selected}\n")
            
            f.write("\n")
    
    print(f"📊 Analysis complete! Reports saved to:")
    print(f"   - {output_dir / 'form_controls_analysis.json'}")
    print(f"   - {output_dir / 'form_controls_report.md'}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python analyze_form_controls.py <pdf_file>")
        sys.exit(1)
    
    pdf_file = sys.argv[1]
    if not Path(pdf_file).exists():
        print(f"❌ File not found: {pdf_file}")
        sys.exit(1)
    
    analysis = analyze_pdf_form_controls(pdf_file)
    if analysis:
        print(f"✅ Found {analysis['total_fields']} form fields across {analysis['total_pages']} pages")
        
        print("\n📋 Field Type Summary:")
        for field_type, count in sorted(analysis['field_types'].items()):
            print(f"   {field_type}: {count}")
