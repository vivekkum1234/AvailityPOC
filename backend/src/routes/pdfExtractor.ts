import express, { Request, Response } from 'express';
import multer from 'multer';
import { extractPDFFormFields, ExtractedField } from '../services/pdfExtractionService';
import { getQuestionIdForPDFField, transformPDFValue, allFieldMappings, getMappingsForSection } from '../config/pdfFieldMappings';

const router = express.Router();

// Configure multer for PDF file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

/**
 * Mapped field for frontend display
 */
interface MappedField {
  pdfFieldName: string;
  pdfFieldType: string;
  pdfValue: any;
  questionId: string | null;
  mappedValue: any;
  section: 'common' | 'mode2_realtime_b2b' | 'unknown';
  fieldIndex: number;
  pageNumber: number;
  yPosition?: number;
  xPosition?: number;
}

/**
 * POST /api/pdf-extractor/extract
 * Upload and extract PDF form fields
 */
router.post('/extract', upload.single('pdf'), async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('[PDF Extractor] Received PDF upload request');

    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No PDF file uploaded'
      });
      return;
    }

    console.log(`[PDF Extractor] Processing file: ${req.file.originalname} (${req.file.size} bytes)`);

    // Extract form fields from PDF
    const extractionResult = await extractPDFFormFields(req.file.buffer);

    // Helper function to get the correct section from mapping config
    const getSectionForField = (pdfFieldName: string): 'common' | 'mode2_realtime_b2b' => {
      const mapping = allFieldMappings.find(m => m.pdfFieldName === pdfFieldName);
      return mapping?.section === 'b2b' ? 'mode2_realtime_b2b' : 'common';
    };

    // Map ALL extracted fields and categorize by mapping config (not PDF extraction service)
    const allMappedFieldsRaw: MappedField[] = extractionResult.allFields.map(field => {
      const questionId = getQuestionIdForPDFField(field.name);
      const section = getSectionForField(field.name);

      return {
        pdfFieldName: field.name,
        pdfFieldType: field.type,
        pdfValue: field.value,
        questionId,
        mappedValue: transformPDFValue(field.name, field.value),
        section,
        fieldIndex: field.fieldIndex,
        pageNumber: field.pageNumber,
        yPosition: field.yPosition,
        xPosition: field.xPosition
      };
    });

    // Separate into common and B2B based on mapping config
    const mappedCommonFieldsRaw = allMappedFieldsRaw.filter(f => f.section === 'common');
    const mappedB2BFieldsRaw = allMappedFieldsRaw.filter(f => f.section === 'mode2_realtime_b2b');

    // Group multi-select checkbox fields by questionId
    const groupedByQuestionId = new Map<string, MappedField[]>();
    mappedCommonFieldsRaw.forEach(field => {
      if (field.questionId) {
        if (!groupedByQuestionId.has(field.questionId)) {
          groupedByQuestionId.set(field.questionId, []);
        }
        groupedByQuestionId.get(field.questionId)!.push(field);
      }
    });

    // Merge multi-select checkbox fields into single entries with array values
    const mappedCommonFields: MappedField[] = [];
    const processedQuestionIds = new Set<string>();

    mappedCommonFieldsRaw.forEach(field => {
      if (!field.questionId) {
        // No mapping, keep as-is
        mappedCommonFields.push(field);
        return;
      }

      if (processedQuestionIds.has(field.questionId)) {
        // Already processed this questionId
        return;
      }

      const fieldsForQuestion = groupedByQuestionId.get(field.questionId)!;

      if (fieldsForQuestion.length > 1) {
        // Multi-select: combine all checked values into an array
        const checkedValues = fieldsForQuestion
          .filter(f => f.mappedValue && f.mappedValue !== false)
          .map(f => f.mappedValue);

        mappedCommonFields.push({
          ...field,
          pdfFieldName: `[MULTI] ${field.questionId}`,
          mappedValue: checkedValues.length > 0 ? checkedValues : null
        });
        processedQuestionIds.add(field.questionId);
      } else {
        // Single field mapping
        mappedCommonFields.push(field);
        processedQuestionIds.add(field.questionId);
      }
    });

    // Process B2B fields with multi-select aggregation (same logic as common fields)
    const groupedB2BByQuestionId = new Map<string, MappedField[]>();
    mappedB2BFieldsRaw.forEach(field => {
      if (field.questionId) {
        if (!groupedB2BByQuestionId.has(field.questionId)) {
          groupedB2BByQuestionId.set(field.questionId, []);
        }
        groupedB2BByQuestionId.get(field.questionId)!.push(field);
      }
    });

    const mappedB2BFields: MappedField[] = [];
    const processedB2BQuestionIds = new Set<string>();

    mappedB2BFieldsRaw.forEach(field => {
      if (!field.questionId) {
        mappedB2BFields.push(field);
        return;
      }

      if (processedB2BQuestionIds.has(field.questionId)) {
        return;
      }

      const fieldsForQuestion = groupedB2BByQuestionId.get(field.questionId)!;

      if (fieldsForQuestion.length > 1) {
        const checkedValues = fieldsForQuestion
          .filter(f => f.mappedValue && f.mappedValue !== false)
          .map(f => f.mappedValue);

        mappedB2BFields.push({
          ...field,
          pdfFieldName: `[MULTI] ${field.questionId}`,
          mappedValue: checkedValues.length > 0 ? checkedValues : null
        });
        processedB2BQuestionIds.add(field.questionId);
      } else {
        mappedB2BFields.push(field);
        processedB2BQuestionIds.add(field.questionId);
      }
    });

    // Add static value fields to mapped common fields
    // Group static fields by questionId to handle multi-select fields
    const staticCommonFieldsRaw: MappedField[] = allFieldMappings
      .filter(m => m.pdfFieldName === null && m.staticValue !== undefined && m.section === 'common')
      .map((m, index) => ({
        pdfFieldName: `[STATIC] ${m.questionId}`,
        pdfFieldType: 'static',
        pdfValue: m.staticValue,
        questionId: m.questionId,
        mappedValue: m.staticValue,
        section: 'common' as const,
        fieldIndex: -1,
        pageNumber: -1,
        yPosition: -1,
        xPosition: -1
      }));

    // Merge static multi-select fields (e.g., supported-search-options)
    const staticCommonFieldsGrouped = new Map<string, MappedField[]>();
    staticCommonFieldsRaw.forEach(field => {
      if (field.questionId) {
        if (!staticCommonFieldsGrouped.has(field.questionId)) {
          staticCommonFieldsGrouped.set(field.questionId, []);
        }
        staticCommonFieldsGrouped.get(field.questionId)!.push(field);
      }
    });

    const staticCommonFields: MappedField[] = [];
    staticCommonFieldsGrouped.forEach((fields, questionId) => {
      if (fields.length > 1) {
        // Multi-select: combine all values into an array
        const values = fields.map(f => f.mappedValue);
        staticCommonFields.push({
          ...fields[0],
          pdfFieldName: `[STATIC-MULTI] ${questionId}`,
          mappedValue: values
        });
      } else {
        // Single value
        staticCommonFields.push(fields[0]);
      }
    });

    // Add static value fields to mapped B2B fields
    const staticB2BFields: MappedField[] = allFieldMappings
      .filter(m => m.pdfFieldName === null && m.staticValue !== undefined && m.section === 'b2b')
      .map((m, index) => ({
        pdfFieldName: `[STATIC] ${m.questionId}`,
        pdfFieldType: 'static',
        pdfValue: m.staticValue,
        questionId: m.questionId,
        mappedValue: m.staticValue,
        section: 'mode2_realtime_b2b' as const,
        fieldIndex: -1,
        pageNumber: -1,
        yPosition: -1,
        xPosition: -1
      }));

    // Combine extracted fields with static fields
    const allCommonFields = [...mappedCommonFields, ...staticCommonFields];
    const allB2BFields = [...mappedB2BFields, ...staticB2BFields];

    // All fields for debugging (use the categorized fields)
    const allMappedFields: MappedField[] = [...allMappedFieldsRaw];

    console.log(`[PDF Extractor] Extraction complete:
      - Total fields: ${extractionResult.totalFields}
      - Common fields: ${allCommonFields.length} (${staticCommonFields.length} static)
      - B2B fields: ${allB2BFields.length} (${staticB2BFields.length} static)
      - Mapped common: ${allCommonFields.filter(f => f.questionId).length}
      - Mapped B2B: ${allB2BFields.filter(f => f.questionId).length}`);

    res.json({
      success: true,
      data: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        totalFields: extractionResult.totalFields,
        totalPages: extractionResult.totalPages,
        commonFields: allCommonFields,
        b2bFields: allB2BFields,
        allFields: allMappedFields,
        summary: {
          totalExtracted: extractionResult.totalFields,
          commonExtracted: allCommonFields.length,
          b2bExtracted: allB2BFields.length,
          commonMapped: allCommonFields.filter(f => f.questionId).length,
          b2bMapped: allB2BFields.filter(f => f.questionId).length,
          unmapped: allMappedFields.filter(f => !f.questionId).length,
          staticFields: staticCommonFields.length + staticB2BFields.length
        }
      }
    });

  } catch (error) {
    console.error('[PDF Extractor] Error processing PDF:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process PDF'
    });
  }
});

/**
 * GET /api/pdf-extractor/health
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'PDF Extractor service is running',
    timestamp: new Date().toISOString()
  });
});

export default router;

