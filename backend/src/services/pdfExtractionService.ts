import { PDFDocument, PDFField, PDFTextField, PDFCheckBox, PDFRadioGroup, PDFDropdown, PDFOptionList } from 'pdf-lib';

/**
 * Normalize checkbox export values
 * - Decode URL-encoded strings (e.g., "Availity%20defines" -> "Availity defines")
 * - Replace #20 with spaces (PDF encoding issue)
 * - Normalize "Yes_2", "No_2" etc. to just "Yes", "No"
 */
function normalizeCheckboxValue(value: string): string {
  let normalized = value;

  try {
    // Try to decode URL-encoded strings
    normalized = decodeURIComponent(value);
  } catch (e) {
    // If decoding fails, just use the original value
    normalized = value;
  }

  // Replace #20 with spaces (some PDFs use this encoding)
  normalized = normalized.replace(/#20/g, ' ');

  // Replace %20 with spaces (in case decodeURIComponent didn't work)
  normalized = normalized.replace(/%20/g, ' ');

  // Normalize Yes/No variants (Yes_2, No_2, etc.) to just Yes/No
  if (/^Yes(_\d+)?$/i.test(normalized)) {
    return 'Yes';
  }
  if (/^No(_\d+)?$/i.test(normalized)) {
    return 'No';
  }

  return normalized;
}

/**
 * Represents an extracted PDF form field
 */
export interface ExtractedField {
  name: string;
  type: 'text' | 'checkbox' | 'radio' | 'dropdown' | 'option_list' | 'unknown';
  value: string | boolean | string[] | null;
  rawValue?: any; // Raw value from PDF for debugging
  section: 'common' | 'mode1_realtime_web' | 'mode2_realtime_b2b' | 'mode3_edi_batch' | 'unknown';
  fieldIndex: number; // Order in which field appears in PDF (after sorting by position)
  pageNumber: number; // Page number where field is located (0-based)
  yPosition: number; // Y-coordinate on the page (for sorting top-to-bottom)
  xPosition: number; // X-coordinate on the page (for sorting left-to-right)
}

/**
 * Result of PDF extraction
 */
export interface PDFExtractionResult {
  totalFields: number;
  totalPages: number;
  commonFields: ExtractedField[];
  mode2B2BFields: ExtractedField[];
  allFields: ExtractedField[]; // All fields in extraction order
  fieldsByPage: { [pageNumber: number]: ExtractedField[] }; // Fields grouped by page
}

/**
 * Extract form fields from a PDF buffer
 */
export async function extractPDFFormFields(pdfBuffer: Buffer): Promise<PDFExtractionResult> {
  try {
    console.log('[PDF Extraction] Loading PDF document...');
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    const totalPages = pdfDoc.getPageCount();
    const pages = pdfDoc.getPages();

    console.log(`[PDF Extraction] Found ${fields.length} total form fields across ${totalPages} pages`);

    const extractedFields: ExtractedField[] = [];

    // Extract all fields with their values, types, positions, and page numbers
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      const extractedField = extractFieldData(field, form, i, pages);
      extractedFields.push(extractedField);
    }

    // Log first few fields before sorting for debugging
    console.log('[PDF Extraction] Sample fields before sorting:');
    extractedFields.slice(0, 5).forEach(f => {
      console.log(`  - ${f.name}: page=${f.pageNumber}, y=${f.yPosition.toFixed(2)}, x=${f.xPosition.toFixed(2)}`);
    });

    // Sort fields by page number, then by Y position (top to bottom), then by X position (left to right)
    // Note: PDF Y-coordinates start from bottom, so higher Y = higher on page
    extractedFields.sort((a, b) => {
      if (a.pageNumber !== b.pageNumber) {
        return a.pageNumber - b.pageNumber; // Sort by page first
      }
      if (Math.abs(a.yPosition - b.yPosition) > 5) { // Allow 5pt tolerance for same row
        return b.yPosition - a.yPosition; // Higher Y = top of page (reverse sort)
      }
      return a.xPosition - b.xPosition; // Same row, sort left to right
    });

    // Re-index fields after sorting
    extractedFields.forEach((field, index) => {
      field.fieldIndex = index;
    });

    // Log first few fields after sorting for debugging
    console.log('[PDF Extraction] Sample fields after sorting:');
    extractedFields.slice(0, 5).forEach(f => {
      console.log(`  - ${f.name}: page=${f.pageNumber}, y=${f.yPosition.toFixed(2)}, x=${f.xPosition.toFixed(2)}`);
    });

    // Categorize fields by section based on field names or patterns
    const categorizedFields = categorizeFieldsBySection(extractedFields);

    // Group fields by page
    const fieldsByPage: { [pageNumber: number]: ExtractedField[] } = {};
    for (const field of extractedFields) {
      if (field.pageNumber !== undefined) {
        if (!fieldsByPage[field.pageNumber]) {
          fieldsByPage[field.pageNumber] = [];
        }
        fieldsByPage[field.pageNumber].push(field);
      }
    }

    console.log(`[PDF Extraction] Categorized fields:
      - Common: ${categorizedFields.commonFields.length}
      - Mode 2 (B2B): ${categorizedFields.mode2B2BFields.length}
      - Total: ${categorizedFields.allFields.length}
      - Pages: ${totalPages}`);

    return {
      totalFields: fields.length,
      totalPages,
      commonFields: categorizedFields.commonFields,
      mode2B2BFields: categorizedFields.mode2B2BFields,
      allFields: categorizedFields.allFields,
      fieldsByPage
    };
  } catch (error) {
    console.error('[PDF Extraction] Error extracting PDF fields:', error);
    throw new Error(`Failed to extract PDF fields: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract data from a single PDF field including position and page number
 */
function extractFieldData(field: PDFField, form: any, fieldIndex: number, pages: any[]): ExtractedField {
  const name = field.getName();
  const type = field.constructor.name;

  let value: string | boolean | string[] | null = null;
  let fieldType: ExtractedField['type'] = 'unknown';

  try {
    if (type === 'PDFTextField') {
      const textField = form.getTextField(name);
      value = textField.getText() || null;
      fieldType = 'text';
    } else if (type === 'PDFCheckBox') {
      const checkbox = form.getCheckBox(name);
      const isChecked = checkbox.isChecked();

      // Try to get the export value (the value associated with the checkbox when checked)
      let exportValue: string | null = null;

      try {
        const widgets = field.acroField.getWidgets();
        if (widgets && widgets.length > 0) {
          const widget = widgets[0];
          const widgetDict = widget.dict;

          // Method 1: Try to get the appearance state (AS)
          const asKey = widgetDict.lookup(widgetDict.context.obj('AS'));
          if (asKey) {
            const asValue = asKey.toString().replace(/^\//, '');
            if (asValue && asValue !== 'Off') {
              exportValue = asValue;
            }
          }

          // Method 2: If Method 1 failed, try to get from appearance dictionary (AP)
          if (!exportValue) {
            const apDict = widgetDict.lookup(widgetDict.context.obj('AP'));
            if (apDict) {
              const normalDict = apDict.lookup(apDict.context.obj('N'));
              if (normalDict) {
                // Get all keys from the normal appearance dictionary
                const keys = normalDict.entries();
                for (const [key] of keys) {
                  const keyStr = key.toString().replace(/^\//, '');
                  if (keyStr && keyStr !== 'Off') {
                    exportValue = keyStr;
                    break;
                  }
                }
              }
            }
          }
        }
      } catch (exportError) {
        console.warn(`[PDF Extraction] Could not extract export value for checkbox "${name}":`, exportError);
      }

      // Set the final value and normalize it
      if (isChecked && exportValue) {
        value = normalizeCheckboxValue(exportValue); // Normalize and decode the export value
      } else {
        value = isChecked; // Fallback to boolean
      }

      fieldType = 'checkbox';
    } else if (type === 'PDFRadioGroup') {
      const radioGroup = form.getRadioGroup(name);
      const selectedValue = radioGroup.getSelected();
      // Normalize radio button values too (decode URL encoding and normalize Yes/No variants)
      value = selectedValue ? normalizeCheckboxValue(selectedValue) : null;
      fieldType = 'radio';
    } else if (type === 'PDFDropdown') {
      const dropdown = form.getDropdown(name);
      const selected = dropdown.getSelected();
      value = selected.length > 0 ? selected[0] : null;
      fieldType = 'dropdown';
    } else if (type === 'PDFOptionList') {
      const optionList = form.getOptionList(name);
      value = optionList.getSelected();
      fieldType = 'option_list';
    }
  } catch (error) {
    console.warn(`[PDF Extraction] Error extracting field "${name}":`, error);
  }

  // Get page number and position from field widget
  let pageNumber = 0;
  let yPosition = 0;
  let xPosition = 0;

  try {
    // Get the widget (visual representation) of the field
    const widgets = field.acroField.getWidgets();
    if (widgets && widgets.length > 0) {
      const widget = widgets[0]; // Use first widget if multiple

      // Get the rectangle (position) of the widget
      const rect = widget.getRectangle();
      if (rect) {
        xPosition = rect.x;
        yPosition = rect.y; // Y coordinate (bottom-left corner)
      }

      // Find which page contains this widget by checking all pages
      const widgetDict = widget.dict;
      const pRef = widgetDict.get(widgetDict.context.obj('P')); // P = Page reference

      if (pRef) {
        // Find the page index by comparing page references
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          if (page.ref.toString() === pRef.toString()) {
            pageNumber = i;
            break;
          }
        }
      } else {
        // Fallback: search through page annotations
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          const annots = page.node.Annots();

          if (annots) {
            const annotArray = annots.asArray();
            for (const annotRef of annotArray) {
              if (annotRef.toString() === widget.ref.toString()) {
                pageNumber = i;
                break;
              }
            }
            if (pageNumber === i) break;
          }
        }
      }
    }
  } catch (error) {
    // If we can't get position, use defaults (will be at top of page 0)
    console.warn(`[PDF Extraction] Could not get position for field "${name}":`, error);
  }

  return {
    name,
    type: fieldType,
    value,
    section: 'unknown', // Will be categorized later
    fieldIndex,
    pageNumber,
    yPosition,
    xPosition
  };
}

/**
 * Categorize fields by section based on naming patterns
 * 
 * Expected patterns:
 * - Common fields: No prefix or "common_" prefix
 * - Mode 1 fields: "mode1_" or "realtime_web_" prefix
 * - Mode 2 fields: "mode2_" or "realtime_b2b_" or "b2b_" prefix
 * - Mode 3 fields: "mode3_" or "edi_batch_" or "batch_" prefix
 */
function categorizeFieldsBySection(fields: ExtractedField[]): PDFExtractionResult {
  const commonFields: ExtractedField[] = [];
  const mode2B2BFields: ExtractedField[] = [];
  const allFields: ExtractedField[] = [];

  for (const field of fields) {
    const nameLower = field.name.toLowerCase();

    // Determine section based on field name patterns
    let section: ExtractedField['section'] = 'unknown';

    if (nameLower.includes('mode2_') || nameLower.includes('realtime_b2b_') || 
        nameLower.includes('b2b_') || nameLower.includes('mode_2_')) {
      section = 'mode2_realtime_b2b';
      mode2B2BFields.push({ ...field, section });
    } else if (nameLower.includes('mode1_') || nameLower.includes('realtime_web_') || 
               nameLower.includes('mode_1_')) {
      section = 'mode1_realtime_web';
      // Skip mode 1 fields - don't add to any array
    } else if (nameLower.includes('mode3_') || nameLower.includes('edi_batch_') || 
               nameLower.includes('batch_') || nameLower.includes('mode_3_')) {
      section = 'mode3_edi_batch';
      // Skip mode 3 fields - don't add to any array
    } else {
      // Common field (no mode prefix)
      section = 'common';
      commonFields.push({ ...field, section });
    }

    allFields.push({ ...field, section });
  }

  return {
    totalFields: fields.length,
    commonFields,
    mode2B2BFields,
    allFields
  };
}

