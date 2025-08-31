# PDF Field Extraction Scripts

This directory contains scripts to automatically extract form fields from PDF documents and generate comprehensive field mappings for questionnaire development.

## 🎯 Purpose

These scripts help you:
- **Extract all form fields** from PDF documents (text fields, dropdowns, checkboxes, etc.)
- **Identify field options** and validation rules
- **Map fields to X12 segments** automatically
- **Generate questionnaire structures** for your application
- **Detect conditional logic** and field relationships

## 📁 Scripts Overview

### 1. `extract_pdf_fields.py` - Basic Extractor
Simple PDF field extraction using PyPDF2 and PyMuPDF.

**Usage:**
```bash
python extract_pdf_fields.py <pdf_file> [--output fields.md] [--format markdown|json]
```

**Features:**
- Basic field extraction
- Field type detection
- Options extraction for choice fields
- Markdown or JSON output

### 2. `advanced_pdf_extractor.py` - Comprehensive Extractor
Advanced extraction with X12 mapping and questionnaire generation.

**Usage:**
```bash
python advanced_pdf_extractor.py <pdf_file> [--output-dir extracted_fields] [--generate-questionnaire]
```

**Features:**
- Multiple extraction methods (PyMuPDF + PyPDF2 + text analysis)
- Automatic X12 field mapping
- Section detection and categorization
- Conditional logic identification
- Validation rule detection
- Questionnaire structure generation

### 3. `extract_fields.sh` - Easy Runner
Bash script that handles dependencies and runs the advanced extractor.

**Usage:**
```bash
./extract_fields.sh <pdf_file>
```

**Features:**
- Automatic dependency installation
- Progress reporting
- Comprehensive output generation

## 🚀 Quick Start

### Option 1: Use the Easy Runner (Recommended)
```bash
# Make the script executable (first time only)
chmod +x scripts/extract_fields.sh

# Extract fields from your PDF
./scripts/extract_fields.sh path/to/your/form.pdf
```

### Option 2: Use Python Directly
```bash
# Install dependencies
pip install PyPDF2 PyMuPDF

# Run advanced extraction
python scripts/advanced_pdf_extractor.py path/to/your/form.pdf --generate-questionnaire
```

## 📊 Output Files

The extraction generates several files in the `extracted_fields/` directory:

### `fields_analysis.md`
Comprehensive human-readable report including:
- Field summary by type
- Section breakdown
- Detailed field information
- X12 mappings
- Validation rules

### `fields_raw.json`
Raw field data in JSON format:
```json
{
  "field_name": {
    "name": "field_name",
    "field_type": "text",
    "label": "Field Label",
    "required": true,
    "options": [...],
    "x12_mapping": "NM1*IL*1*{LastName}*{FirstName}",
    "validation_rules": ["required", "text_format"],
    "section": "patient_info"
  }
}
```

### `questionnaire_structure.json`
Ready-to-use questionnaire structure for your application:
```json
{
  "title": "X12 270/271 Implementation Questionnaire",
  "sections": [
    {
      "id": "patient_info",
      "title": "Patient Information",
      "questions": [
        {
          "id": "patient_name",
          "text": "Patient Name",
          "type": "text",
          "required": true,
          "x12_field": "NM1*IL*1*{LastName}*{FirstName}",
          "validation": ["required"]
        }
      ]
    }
  ]
}
```

## 🔧 Dependencies

The scripts automatically install required dependencies:
- **PyPDF2**: PDF parsing and form field extraction
- **PyMuPDF (fitz)**: Advanced PDF processing and text analysis

## 🎯 X12 Field Mapping

The advanced extractor includes automatic X12 field mapping for common healthcare fields:

| Field Pattern | X12 Mapping |
|---------------|-------------|
| Patient/Member ID | `NM1*IL*1*{LastName}*{FirstName}***MI*{MemberID}` |
| Provider NPI | `NM1*PR*2*{ProviderName}***XX*{NPI}` |
| Date of Birth | `DMG*D8*{DateOfBirth}` |
| Service Date | `DTP*472*D8*{ServiceDate}` |
| Diagnosis Code | `HI*BK:{DiagnosisCode}` |
| Procedure Code | `SV1*HC:{ProcedureCode}` |
| Group Number | `REF*1L*{GroupNumber}` |
| Authorization | `REF*G1*{AuthorizationNumber}` |

## 📋 Field Categories

Fields are automatically categorized into sections:
- **patient_info**: Patient/member information
- **provider_info**: Healthcare provider details
- **insurance_info**: Insurance and coverage details
- **service_info**: Medical services and procedures
- **authorization**: Prior authorization information
- **other**: Miscellaneous fields

## 🔍 Validation Rules

The extractor detects common validation patterns:
- **required**: Mandatory fields
- **date_format**: Date fields requiring specific formatting
- **email_format**: Email address validation
- **phone_format**: Phone number formatting
- **npi_format**: NPI number validation

## 💡 Integration with Your Application

After extraction, you can:

1. **Review the analysis**: Check `fields_analysis.md` for completeness
2. **Update your questionnaire**: Use `questionnaire_structure.json` as a template
3. **Map missing fields**: Add any X12 mappings not automatically detected
4. **Implement validation**: Use the detected validation rules in your forms

## 🛠️ Troubleshooting

### Common Issues

**"No form fields found"**
- The PDF might not have interactive form fields
- Try using the text analysis method
- Check if the PDF is encrypted

**"PyPDF2/PyMuPDF not found"**
- Run: `pip install PyPDF2 PyMuPDF`
- Or use the `extract_fields.sh` script which auto-installs

**"Permission denied"**
- Make the script executable: `chmod +x scripts/extract_fields.sh`

### Getting Better Results

1. **Use high-quality PDFs**: Clear, non-scanned documents work best
2. **Check for form fields**: Ensure the PDF has interactive form elements
3. **Review and refine**: The extraction is a starting point - manual review is recommended
4. **Test with your PDF**: Different PDF creators may structure fields differently

## 🔄 Updating Your Questionnaire

To integrate extracted fields into your application:

1. **Copy the structure**: Use `questionnaire_structure.json` as a base
2. **Update the questionnaire file**: Modify `backend/src/data/x12-270-271-questionnaire.ts`
3. **Add missing mappings**: Include any X12 fields not automatically detected
4. **Test thoroughly**: Ensure all fields work correctly in your application

## 📞 Support

If you encounter issues with field extraction:
1. Check the generated `fields_analysis.md` for insights
2. Try different extraction methods
3. Review the PDF structure manually
4. Consider enhancing the X12 mapping patterns for your specific use case
