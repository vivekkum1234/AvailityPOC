#!/usr/bin/env python3
"""
Advanced PDF Form Field Extractor with X12 Field Mapping

This script provides comprehensive PDF form field extraction with:
- Multiple extraction methods
- X12 field mapping detection
- Conditional logic identification
- Field relationship analysis
- Questionnaire structure generation

Usage:
    python advanced_pdf_extractor.py <pdf_file> [--generate-questionnaire]
"""

import sys
import json
import re
import argparse
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict

@dataclass
class FormField:
    name: str
    field_type: str
    label: str = ""
    value: str = ""
    options: List[Dict[str, str]] = None
    required: bool = False
    readonly: bool = False
    page: int = 1
    x12_mapping: str = ""
    validation_rules: List[str] = None
    conditional_logic: str = ""
    section: str = ""
    
    def __post_init__(self):
        if self.options is None:
            self.options = []
        if self.validation_rules is None:
            self.validation_rules = []


class AdvancedPDFExtractor:
    def __init__(self, pdf_path: str):
        self.pdf_path = Path(pdf_path)
        self.fields: Dict[str, FormField] = {}
        self.sections: Dict[str, List[str]] = {}
        self.x12_patterns = self._load_x12_patterns()
        
    def _load_x12_patterns(self) -> Dict[str, str]:
        """Load common X12 field patterns for automatic mapping"""
        return {
            # Common X12 270/271 patterns
            r'(?i)subscriber.*id|member.*id|patient.*id': 'NM1*IL*1*{LastName}*{FirstName}***MI*{MemberID}',
            r'(?i)provider.*npi|npi': 'NM1*PR*2*{ProviderName}***XX*{NPI}',
            r'(?i)date.*birth|dob|birth.*date': 'DMG*D8*{DateOfBirth}',
            r'(?i)service.*date|dos': 'DTP*472*D8*{ServiceDate}',
            r'(?i)diagnosis|icd': 'HI*BK:{DiagnosisCode}',
            r'(?i)procedure|cpt|hcpcs': 'SV1*HC:{ProcedureCode}',
            r'(?i)place.*service|pos': 'SV1*HC:{ProcedureCode}*{ChargeAmount}*UN*{Units}***{PlaceOfService}',
            r'(?i)insurance.*type|plan.*type': 'INS*{InsuranceType}',
            r'(?i)group.*number|group.*id': 'REF*1L*{GroupNumber}',
            r'(?i)authorization|auth.*number': 'REF*G1*{AuthorizationNumber}',
            r'(?i)claim.*number': 'REF*D9*{ClaimNumber}',
            r'(?i)tax.*id|ein|tin': 'REF*EI*{TaxID}',
            r'(?i)ssn|social.*security': 'REF*SY*{SSN}',
            r'(?i)address|street': 'N3*{AddressLine1}*{AddressLine2}',
            r'(?i)city': 'N4*{City}*{State}*{ZipCode}',
            r'(?i)state': 'N4*{City}*{State}*{ZipCode}',
            r'(?i)zip|postal': 'N4*{City}*{State}*{ZipCode}',
            r'(?i)phone|telephone': 'PER*IC*{ContactName}*TE*{PhoneNumber}',
            r'(?i)email': 'PER*IC*{ContactName}*EM*{EmailAddress}',
        }
    
    def extract_fields_comprehensive(self) -> Dict[str, FormField]:
        """Extract fields using multiple methods"""
        print(f"Starting comprehensive extraction from: {self.pdf_path}")
        
        # Method 1: Try PyMuPDF
        try:
            self._extract_with_pymupdf()
            print(f"PyMuPDF: Found {len(self.fields)} fields")
        except Exception as e:
            print(f"PyMuPDF failed: {e}")
        
        # Method 2: Try PyPDF2
        try:
            self._extract_with_pypdf2()
            print(f"After PyPDF2: Total {len(self.fields)} fields")
        except Exception as e:
            print(f"PyPDF2 failed: {e}")
        
        # Method 3: Text analysis for field detection
        try:
            self._extract_from_text_analysis()
            print(f"After text analysis: Total {len(self.fields)} fields")
        except Exception as e:
            print(f"Text analysis failed: {e}")
        
        # Post-processing
        self._detect_sections()
        self._map_x12_fields()
        self._detect_conditional_logic()
        self._detect_validation_rules()
        
        return self.fields
    
    def _extract_with_pymupdf(self):
        """Extract using PyMuPDF"""
        try:
            import fitz
            doc = fitz.open(self.pdf_path)
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                widgets = page.widgets()
                
                for widget in widgets:
                    field_name = widget.field_name or f"field_{len(self.fields)}"
                    
                    field = FormField(
                        name=field_name,
                        field_type=self._normalize_widget_type(widget.field_type),
                        value=widget.field_value or "",
                        required=bool(widget.field_flags & 2),
                        readonly=bool(widget.field_flags & 1),
                        page=page_num + 1
                    )
                    
                    if widget.choice_values:
                        field.options = [
                            {"value": val, "label": val} 
                            for val in widget.choice_values
                        ]
                    
                    self.fields[field_name] = field
            
            doc.close()
        except ImportError:
            print("PyMuPDF not available, skipping...")
    
    def _extract_with_pypdf2(self):
        """Extract using PyPDF2"""
        try:
            from PyPDF2 import PdfReader
            
            with open(self.pdf_path, 'rb') as file:
                reader = PdfReader(file)
                
                if reader.is_encrypted:
                    reader.decrypt("")
                
                if "/AcroForm" in reader.trailer["/Root"]:
                    form = reader.trailer["/Root"]["/AcroForm"]
                    if "/Fields" in form:
                        for field_ref in form["/Fields"]:
                            field_obj = field_ref.get_object()
                            self._process_pypdf2_field(field_obj)
        except ImportError:
            print("PyPDF2 not available, skipping...")
    
    def _process_pypdf2_field(self, field_obj: Any, parent_name: str = ""):
        """Process PyPDF2 field object"""
        try:
            field_name = str(field_obj.get("/T", ""))
            full_name = f"{parent_name}.{field_name}" if parent_name else field_name
            
            if field_name and full_name not in self.fields:
                field_type = str(field_obj.get("/FT", ""))
                field_value = str(field_obj.get("/V", ""))
                flags = field_obj.get("/Ff", 0)
                
                field = FormField(
                    name=field_name,
                    field_type=self._normalize_pypdf2_type(field_type),
                    value=field_value,
                    required=bool(flags & 2),
                    readonly=bool(flags & 1)
                )
                
                # Extract options
                if "/Opt" in field_obj:
                    opt_array = field_obj["/Opt"]
                    for opt in opt_array:
                        if isinstance(opt, list) and len(opt) >= 2:
                            field.options.append({
                                "value": str(opt[0]),
                                "label": str(opt[1])
                            })
                        else:
                            field.options.append({
                                "value": str(opt),
                                "label": str(opt)
                            })
                
                self.fields[full_name] = field
            
            # Process children
            if "/Kids" in field_obj:
                for kid_ref in field_obj["/Kids"]:
                    kid = kid_ref.get_object()
                    self._process_pypdf2_field(kid, full_name)
                    
        except Exception as e:
            print(f"Error processing field: {e}")
    
    def _extract_from_text_analysis(self):
        """Extract potential fields from text analysis"""
        try:
            import fitz
            doc = fitz.open(self.pdf_path)
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                text = page.get_text()
                
                # Look for common form patterns
                patterns = [
                    r'(\w+(?:\s+\w+)*)\s*[:\-_]\s*_+',  # Label: ____
                    r'(\w+(?:\s+\w+)*)\s*\[\s*\]',      # Label [ ]
                    r'(\w+(?:\s+\w+)*)\s*\(\s*\)',      # Label ( )
                    r'□\s*(\w+(?:\s+\w+)*)',            # □ Label
                    r'☐\s*(\w+(?:\s+\w+)*)',            # ☐ Label
                ]
                
                for pattern in patterns:
                    matches = re.finditer(pattern, text, re.IGNORECASE)
                    for match in matches:
                        label = match.group(1).strip()
                        field_name = self._normalize_field_name(label)
                        
                        if field_name not in self.fields:
                            field = FormField(
                                name=field_name,
                                field_type="text",  # Default assumption
                                label=label,
                                page=page_num + 1
                            )
                            self.fields[field_name] = field
            
            doc.close()
        except ImportError:
            print("PyMuPDF not available for text analysis, skipping...")
    
    def _normalize_field_name(self, label: str) -> str:
        """Convert label to valid field name"""
        # Remove special characters and convert to snake_case
        name = re.sub(r'[^\w\s]', '', label)
        name = re.sub(r'\s+', '_', name.strip())
        return name.lower()
    
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
    
    def _normalize_pypdf2_type(self, field_type: str) -> str:
        """Normalize PyPDF2 field types"""
        type_mapping = {
            "/Tx": "text",
            "/Ch": "choice",
            "/Btn": "button", 
            "/Sig": "signature"
        }
        return type_mapping.get(field_type, "unknown")
    
    def _detect_sections(self):
        """Detect form sections based on field names and positions"""
        sections = {
            "patient_info": [],
            "provider_info": [],
            "insurance_info": [],
            "service_info": [],
            "authorization": [],
            "other": []
        }
        
        for field_name, field in self.fields.items():
            section = self._categorize_field(field_name, field.label)
            sections[section].append(field_name)
            field.section = section
        
        self.sections = {k: v for k, v in sections.items() if v}
    
    def _categorize_field(self, field_name: str, label: str) -> str:
        """Categorize field into sections"""
        text = f"{field_name} {label}".lower()
        
        if any(keyword in text for keyword in ['patient', 'member', 'subscriber', 'beneficiary']):
            return "patient_info"
        elif any(keyword in text for keyword in ['provider', 'physician', 'doctor', 'npi']):
            return "provider_info"
        elif any(keyword in text for keyword in ['insurance', 'plan', 'coverage', 'policy']):
            return "insurance_info"
        elif any(keyword in text for keyword in ['service', 'procedure', 'diagnosis', 'treatment']):
            return "service_info"
        elif any(keyword in text for keyword in ['auth', 'approval', 'certification']):
            return "authorization"
        else:
            return "other"
    
    def _map_x12_fields(self):
        """Map fields to X12 segments"""
        for field_name, field in self.fields.items():
            text = f"{field_name} {field.label}".lower()
            
            for pattern, x12_template in self.x12_patterns.items():
                if re.search(pattern, text):
                    field.x12_mapping = x12_template
                    break
    
    def _detect_conditional_logic(self):
        """Detect conditional field relationships"""
        # This is a simplified version - could be enhanced with more sophisticated analysis
        for field_name, field in self.fields.items():
            if 'if' in field.label.lower() or 'when' in field.label.lower():
                field.conditional_logic = f"Conditional field based on: {field.label}"
    
    def _detect_validation_rules(self):
        """Detect validation rules from field properties"""
        for field_name, field in self.fields.items():
            rules = []
            
            if field.required:
                rules.append("required")
            
            if 'date' in field_name.lower() or 'date' in field.label.lower():
                rules.append("date_format")
            
            if 'email' in field_name.lower():
                rules.append("email_format")
            
            if 'phone' in field_name.lower():
                rules.append("phone_format")
            
            if 'npi' in field_name.lower():
                rules.append("npi_format")
            
            field.validation_rules = rules
    
    def generate_questionnaire_structure(self) -> Dict[str, Any]:
        """Generate questionnaire structure for the application"""
        questionnaire = {
            "title": "X12 270/271 Implementation Questionnaire",
            "description": f"Generated from {self.pdf_path.name}",
            "sections": []
        }
        
        for section_name, field_names in self.sections.items():
            section = {
                "id": section_name,
                "title": section_name.replace('_', ' ').title(),
                "questions": []
            }
            
            for field_name in field_names:
                field = self.fields[field_name]
                question = {
                    "id": field_name,
                    "text": field.label or field_name.replace('_', ' ').title(),
                    "type": self._map_to_question_type(field),
                    "required": field.required,
                    "x12_field": field.x12_mapping,
                    "validation": field.validation_rules
                }
                
                if field.options:
                    question["options"] = field.options
                
                if field.conditional_logic:
                    question["conditional"] = field.conditional_logic
                
                section["questions"].append(question)
            
            questionnaire["sections"].append(section)
        
        return questionnaire
    
    def _map_to_question_type(self, field: FormField) -> str:
        """Map PDF field type to questionnaire question type"""
        if field.field_type in ["choice", "listbox", "combobox"]:
            if len(field.options) <= 5:
                return "radio"
            else:
                return "select"
        elif field.field_type == "button":
            return "checkbox"
        else:
            return "text"
    
    def save_results(self, output_dir: str = "extracted_fields"):
        """Save extraction results in multiple formats"""
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        
        # Save raw field data
        fields_data = {name: asdict(field) for name, field in self.fields.items()}
        with open(output_path / "fields_raw.json", 'w') as f:
            json.dump(fields_data, f, indent=2)
        
        # Save questionnaire structure
        questionnaire = self.generate_questionnaire_structure()
        with open(output_path / "questionnaire_structure.json", 'w') as f:
            json.dump(questionnaire, f, indent=2)
        
        # Save markdown report
        report = self._generate_markdown_report()
        with open(output_path / "fields_analysis.md", 'w') as f:
            f.write(report)
        
        print(f"Results saved to {output_path}/")
        return output_path
    
    def _generate_markdown_report(self) -> str:
        """Generate comprehensive markdown report"""
        report = [
            f"# PDF Form Analysis: {self.pdf_path.name}",
            f"\n**Total Fields:** {len(self.fields)}",
            f"**Sections:** {len(self.sections)}",
            "\n## Sections Overview"
        ]
        
        for section, fields in self.sections.items():
            report.append(f"\n### {section.replace('_', ' ').title()} ({len(fields)} fields)")
            for field_name in fields:
                field = self.fields[field_name]
                report.append(f"- **{field_name}**: {field.field_type}")
                if field.x12_mapping:
                    report.append(f"  - X12: `{field.x12_mapping}`")
        
        report.append("\n## Detailed Field Information")
        for field_name, field in sorted(self.fields.items()):
            report.append(f"\n### {field_name}")
            report.append(f"- **Type:** {field.field_type}")
            report.append(f"- **Section:** {field.section}")
            report.append(f"- **Required:** {'Yes' if field.required else 'No'}")
            
            if field.label:
                report.append(f"- **Label:** {field.label}")
            if field.x12_mapping:
                report.append(f"- **X12 Mapping:** `{field.x12_mapping}`")
            if field.options:
                report.append("- **Options:**")
                for opt in field.options:
                    report.append(f"  - {opt['value']}: {opt['label']}")
            if field.validation_rules:
                report.append(f"- **Validation:** {', '.join(field.validation_rules)}")
        
        return "\n".join(report)


def main():
    parser = argparse.ArgumentParser(description="Advanced PDF form field extraction")
    parser.add_argument("pdf_file", help="Path to PDF file")
    parser.add_argument("--output-dir", "-o", default="extracted_fields", 
                       help="Output directory")
    parser.add_argument("--generate-questionnaire", action="store_true",
                       help="Generate questionnaire structure")
    
    args = parser.parse_args()
    
    if not Path(args.pdf_file).exists():
        print(f"Error: PDF file not found: {args.pdf_file}")
        sys.exit(1)
    
    # Extract fields
    extractor = AdvancedPDFExtractor(args.pdf_file)
    fields = extractor.extract_fields_comprehensive()
    
    if not fields:
        print("No form fields found in the PDF")
        sys.exit(1)
    
    # Save results
    output_path = extractor.save_results(args.output_dir)
    
    if args.generate_questionnaire:
        questionnaire = extractor.generate_questionnaire_structure()
        print(f"\nGenerated questionnaire with {len(questionnaire['sections'])} sections")
    
    print(f"\n✅ Successfully extracted {len(fields)} fields!")
    print(f"📁 Results saved to: {output_path}")


if __name__ == "__main__":
    main()
