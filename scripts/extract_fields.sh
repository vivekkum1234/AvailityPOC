#!/bin/bash

# PDF Field Extraction Script
# Usage: ./extract_fields.sh <pdf_file>

set -e

PDF_FILE="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -z "$PDF_FILE" ]; then
    echo "Usage: $0 <pdf_file>"
    echo ""
    echo "This script extracts all form fields from a PDF and generates:"
    echo "  - Comprehensive field analysis (Markdown)"
    echo "  - Raw field data (JSON)"
    echo "  - Questionnaire structure (JSON)"
    echo ""
    exit 1
fi

if [ ! -f "$PDF_FILE" ]; then
    echo "Error: PDF file not found: $PDF_FILE"
    exit 1
fi

echo "🔍 Extracting fields from: $PDF_FILE"
echo ""

# Install dependencies if needed
echo "📦 Checking dependencies..."
python3 -c "import PyPDF2, fitz" 2>/dev/null || {
    echo "Installing required packages..."
    pip3 install PyPDF2 PyMuPDF
}

# Run the advanced extractor
echo "🚀 Running advanced field extraction..."
python3 "$SCRIPT_DIR/advanced_pdf_extractor.py" "$PDF_FILE" --generate-questionnaire

echo ""
echo "✅ Field extraction complete!"
echo ""
echo "📁 Check the 'extracted_fields' directory for:"
echo "   - fields_analysis.md (comprehensive report)"
echo "   - fields_raw.json (raw field data)"
echo "   - questionnaire_structure.json (for application integration)"
echo ""
echo "💡 Next steps:"
echo "   1. Review the fields_analysis.md report"
echo "   2. Use questionnaire_structure.json to update your application"
echo "   3. Map any missing X12 fields manually"
