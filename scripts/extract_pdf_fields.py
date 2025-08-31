#!/usr/bin/env python3
"""
PDF Form Field Extractor

This script extracts all form fields from a PDF document including:
- Field names and types
- Options for dropdown/radio fields
- Default values
- Required/optional status
- Field positions and properties
- Validation rules

Usage:
    python extract_pdf_fields.py <pdf_file> [--output <output_file>]
"""

import sys
import json
import argparse
from pathlib import Path
from typing import Dict, List, Any, Optional

try:
    import PyPDF2
    from PyPDF2 import PdfReader
except ImportError:
    print("PyPDF2 not found. Installing...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "PyPDF2"])
    import PyPDF2
    from PyPDF2 import PdfReader

try:
    import fitz  # PyMuPDF
except ImportError:
    print("PyMuPDF not found. Installing...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "PyMuPDF"])
    import fitz


class PDFFieldExtractor:
    def __init__(self, pdf_path: str):
        self.pdf_path = Path(pdf_path)
        self.fields = {}
        
    def extract_with_pypdf2(self) -> Dict[str, Any]:
        """Extract fields using PyPDF2"""
        fields = {}
        
        try:
            with open(self.pdf_path, 'rb') as file:
                reader = PdfReader(file)
                
                if reader.is_encrypted:
                    print("Warning: PDF is encrypted. Attempting to decrypt...")
                    reader.decrypt("")
                
                # Get form fields
                if "/AcroForm" in reader.trailer["/Root"]:
                    form = reader.trailer["/Root"]["/AcroForm"]
                    if "/Fields" in form:
                        for field_ref in form["/Fields"]:
                            field = field_ref.get_object()
                            self._extract_field_pypdf2(field, fields)
                            
        except Exception as e:
            print(f"PyPDF2 extraction failed: {e}")
            
        return fields
    
    def _extract_field_pypdf2(self, field: Any, fields: Dict, parent_name: str = "") -> None:
        """Recursively extract field information using PyPDF2"""
        try:
            # Get field name
            field_name = field.get("/T", "")
            if isinstance(field_name, bytes):
                field_name = field_name.decode('utf-8', errors='ignore')
            
            full_name = f"{parent_name}.{field_name}" if parent_name else field_name
            
            # Get field type
            field_type = field.get("/FT", "")
            if isinstance(field_type, bytes):
                field_type = field_type.decode('utf-8', errors='ignore')
            
            # Get field value
            field_value = field.get("/V", "")
            if isinstance(field_value, bytes):
                field_value = field_value.decode('utf-8', errors='ignore')
            
            # Get field options (for choice fields)
            options = []
            if "/Opt" in field:
                opt_array = field["/Opt"]
                for opt in opt_array:
                    if isinstance(opt, list) and len(opt) >= 2:
                        # [export_value, display_value]
                        options.append({
                            "value": str(opt[0]),
                            "label": str(opt[1])
                        })
                    else:
                        options.append({
                            "value": str(opt),
                            "label": str(opt)
                        })
            
            # Get field flags
            flags = field.get("/Ff", 0)
            is_required = bool(flags & 2)  # Required flag
            is_readonly = bool(flags & 1)  # ReadOnly flag
            
            # Store field information
            if field_name:
                fields[full_name] = {
                    "name": field_name,
                    "full_name": full_name,
                    "type": self._normalize_field_type(field_type),
                    "value": field_value,
                    "options": options,
                    "required": is_required,
                    "readonly": is_readonly,
                    "flags": flags
                }
            
            # Process child fields (for hierarchical forms)
            if "/Kids" in field:
                for kid_ref in field["/Kids"]:
                    kid = kid_ref.get_object()
                    self._extract_field_pypdf2(kid, fields, full_name)
                    
        except Exception as e:
            print(f"Error extracting field: {e}")
    
    def extract_with_pymupdf(self) -> Dict[str, Any]:
        """Extract fields using PyMuPDF (more comprehensive)"""
        fields = {}

        try:
            doc = fitz.open(self.pdf_path)

            for page_num in range(len(doc)):
                page = doc[page_num]

                # Get form fields on this page
                widgets = page.widgets()

                for widget in widgets:
                    field_name = widget.field_name or f"field_{len(fields)}"

                    # Enhanced field type detection
                    field_type, control_type = self._get_enhanced_field_type(widget)

                    # Get field value and handle different types
                    field_value = self._get_field_value(widget, field_type)

                    # Get options for choice fields with enhanced detection
                    options = self._get_field_options(widget, field_type)

                    # Enhanced flags detection
                    flags_info = self._analyze_field_flags(widget.field_flags)

                    field_info = {
                        "name": field_name,
                        "full_name": field_name,
                        "type": field_type,
                        "control_type": control_type,
                        "widget_type_code": widget.field_type,
                        "value": field_value,
                        "options": options,
                        "required": flags_info["required"],
                        "readonly": flags_info["readonly"],
                        "multiline": flags_info["multiline"],
                        "password": flags_info["password"],
                        "page": page_num + 1,
                        "rect": list(widget.rect),
                        "flags": widget.field_flags,
                        "flags_info": flags_info
                    }

                    # Additional properties for specific field types
                    if field_type == "button":
                        field_info["button_style"] = self._get_button_style(widget)

                    fields[field_name] = field_info

            doc.close()

        except Exception as e:
            print(f"PyMuPDF extraction failed: {e}")

        return fields
    
    def _normalize_field_type(self, field_type: str) -> str:
        """Normalize PyPDF2 field types"""
        type_mapping = {
            "/Tx": "text",
            "/Ch": "choice",
            "/Btn": "button",
            "/Sig": "signature"
        }
        return type_mapping.get(field_type, "unknown")
    
    def _normalize_widget_type(self, widget_type: int) -> str:
        """Normalize PyMuPDF widget types"""
        type_mapping = {
            0: "unknown",
            1: "button",
            2: "text",
            3: "listbox",
            4: "combobox",
            5: "signature"
        }
        return type_mapping.get(widget_type, "unknown")

    def _get_enhanced_field_type(self, widget) -> tuple:
        """Get enhanced field type and control type"""
        widget_type = widget.field_type

        # Base type mapping
        type_mapping = {
            0: ("unknown", "unknown"),
            1: ("button", "button"),
            2: ("text", "textbox"),
            3: ("choice", "listbox"),
            4: ("choice", "combobox"),
            5: ("signature", "signature")
        }

        base_type, control_type = type_mapping.get(widget_type, ("unknown", "unknown"))

        # Enhanced detection for button types
        if widget_type == 1:  # Button type
            flags = widget.field_flags
            if flags & 32768:  # Radio button flag
                return ("radio", "radio")
            elif flags & 65536:  # Pushbutton flag
                return ("button", "pushbutton")
            else:  # Checkbox
                return ("checkbox", "checkbox")

        # Enhanced detection for text types
        elif widget_type == 2:  # Text type
            flags = widget.field_flags
            if flags & 4096:  # Multiline flag
                return ("text", "textarea")
            elif flags & 8192:  # Password flag
                return ("text", "password")
            else:
                return ("text", "textbox")

        return (base_type, control_type)

    def _get_field_value(self, widget, field_type: str) -> str:
        """Get field value with type-specific handling"""
        try:
            value = widget.field_value or ""

            # Handle different value types
            if isinstance(value, (list, tuple)):
                return str(value[0]) if value else ""
            elif isinstance(value, bool):
                return "Yes" if value else "No"
            else:
                return str(value)
        except:
            return ""

    def _get_field_options(self, widget, field_type: str) -> list:
        """Get field options with enhanced detection"""
        options = []

        try:
            # For choice fields (listbox, combobox)
            if hasattr(widget, 'choice_values') and widget.choice_values:
                for i, val in enumerate(widget.choice_values):
                    options.append({
                        "value": str(val),
                        "label": str(val),
                        "index": i
                    })

            # For radio buttons and checkboxes
            elif field_type in ['radio', 'checkbox']:
                # Try to get button states
                if hasattr(widget, 'button_states') and widget.button_states:
                    for state in widget.button_states:
                        options.append({
                            "value": str(state),
                            "label": str(state).title()
                        })
                else:
                    # Default checkbox/radio options
                    if field_type == 'checkbox':
                        options = [
                            {"value": "Yes", "label": "Yes"},
                            {"value": "No", "label": "No"}
                        ]
                    elif field_type == 'radio':
                        current_value = self._get_field_value(widget, field_type)
                        if current_value:
                            options.append({
                                "value": current_value,
                                "label": current_value
                            })
        except Exception as e:
            print(f"Error getting options for field: {e}")

        return options

    def _analyze_field_flags(self, flags: int) -> dict:
        """Analyze field flags to determine properties"""
        return {
            "required": bool(flags & 2),        # Required flag
            "readonly": bool(flags & 1),        # ReadOnly flag
            "multiline": bool(flags & 4096),    # Multiline flag
            "password": bool(flags & 8192),     # Password flag
            "no_export": bool(flags & 4),       # NoExport flag
            "radio": bool(flags & 32768),       # Radio button flag
            "pushbutton": bool(flags & 65536),  # Pushbutton flag
            "combo": bool(flags & 131072),      # Combo flag
            "edit": bool(flags & 262144),       # Edit flag
            "sort": bool(flags & 524288),       # Sort flag
        }

    def _get_button_style(self, widget) -> str:
        """Determine button style"""
        flags = widget.field_flags
        if flags & 32768:
            return "radio"
        elif flags & 65536:
            return "pushbutton"
        else:
            return "checkbox"
    
    def extract_all_fields(self) -> Dict[str, Any]:
        """Extract fields using both libraries and merge results"""
        print(f"Extracting fields from: {self.pdf_path}")
        
        # Try PyMuPDF first (usually more comprehensive)
        pymupdf_fields = self.extract_with_pymupdf()
        print(f"PyMuPDF found {len(pymupdf_fields)} fields")
        
        # Try PyPDF2 as backup/supplement
        pypdf2_fields = self.extract_with_pypdf2()
        print(f"PyPDF2 found {len(pypdf2_fields)} fields")
        
        # Merge results (PyMuPDF takes precedence)
        all_fields = {**pypdf2_fields, **pymupdf_fields}
        
        return all_fields
    
    def generate_markdown_report(self, fields: Dict[str, Any]) -> str:
        """Generate a comprehensive markdown report of all fields"""
        report = []
        report.append("# PDF Form Fields Analysis")
        report.append(f"\n**Source:** {self.pdf_path.name}")
        report.append(f"**Total Fields:** {len(fields)}")
        report.append(f"**Generated:** {self._get_timestamp()}")
        
        # Group fields by type
        by_type = {}
        for field in fields.values():
            field_type = field.get("type", "unknown")
            if field_type not in by_type:
                by_type[field_type] = []
            by_type[field_type].append(field)
        
        report.append("\n## Field Summary by Type")
        for field_type, type_fields in by_type.items():
            report.append(f"- **{field_type.title()}:** {len(type_fields)} fields")
        
        # Detailed field listing
        report.append("\n## Detailed Field Information")
        
        for field_name, field in sorted(fields.items()):
            report.append(f"\n### {field_name}")
            report.append(f"- **Type:** {field.get('type', 'unknown')}")
            report.append(f"- **Required:** {'Yes' if field.get('required') else 'No'}")
            report.append(f"- **Read-only:** {'Yes' if field.get('readonly') else 'No'}")
            
            if field.get('value'):
                report.append(f"- **Default Value:** `{field['value']}`")
            
            if field.get('page'):
                report.append(f"- **Page:** {field['page']}")
            
            if field.get('options'):
                report.append("- **Options:**")
                for option in field['options']:
                    report.append(f"  - `{option['value']}`: {option['label']}")
            
            if field.get('flags'):
                report.append(f"- **Flags:** {field['flags']} (binary: {bin(field['flags'])})")
        
        return "\n".join(report)
    
    def _get_timestamp(self) -> str:
        """Get current timestamp"""
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def main():
    parser = argparse.ArgumentParser(description="Extract form fields from PDF")
    parser.add_argument("pdf_file", help="Path to PDF file")
    parser.add_argument("--output", "-o", help="Output file (default: fields_extracted.md)")
    parser.add_argument("--format", choices=["markdown", "json"], default="markdown", 
                       help="Output format")
    
    args = parser.parse_args()
    
    if not Path(args.pdf_file).exists():
        print(f"Error: PDF file not found: {args.pdf_file}")
        sys.exit(1)
    
    # Extract fields
    extractor = PDFFieldExtractor(args.pdf_file)
    fields = extractor.extract_all_fields()
    
    if not fields:
        print("No form fields found in the PDF")
        sys.exit(1)
    
    # Generate output
    output_file = args.output or f"fields_extracted.{args.format.replace('markdown', 'md')}"
    
    if args.format == "json":
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(fields, f, indent=2, ensure_ascii=False)
        print(f"JSON output saved to: {output_file}")
    else:
        report = extractor.generate_markdown_report(fields)
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"Markdown report saved to: {output_file}")
    
    print(f"\nExtracted {len(fields)} fields successfully!")


if __name__ == "__main__":
    main()
