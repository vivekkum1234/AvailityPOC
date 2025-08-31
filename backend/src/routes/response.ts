import { Router, Request, Response } from 'express';
import { ResponseService } from '../services/responseService';
import { QuestionnaireResponseSchema, SectionResponseSchema } from '../types/questionnaire';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const responseService = new ResponseService();

// POST /api/responses - Create new questionnaire response
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const validatedData = QuestionnaireResponseSchema.parse(req.body);
  const response = await responseService.createResponse(validatedData);
  
  res.status(201).json({
    success: true,
    data: response
  });
}));

// GET /api/responses/:id - Get questionnaire response
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Response ID is required'
    });
  }

  const response = await responseService.getResponseById(id);
  
  if (!response) {
    return res.status(404).json({
      success: false,
      error: 'Response not found'
    });
  }

  return res.json({
    success: true,
    data: response
  });
}));

// PUT /api/responses/:id - Update questionnaire response
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Response ID is required'
    });
  }

  const validatedData = QuestionnaireResponseSchema.partial().parse(req.body);

  const response = await responseService.updateResponse(id, validatedData as any);
  
  if (!response) {
    return res.status(404).json({
      success: false,
      error: 'Response not found'
    });
  }

  return res.json({
    success: true,
    data: response
  });
}));

// PUT /api/responses/:id/sections/:sectionId - Update section response
router.put('/:id/sections/:sectionId', asyncHandler(async (req: Request, res: Response) => {
  const { id, sectionId } = req.params;
  if (!id || !sectionId) {
    return res.status(400).json({
      success: false,
      error: 'Response ID and Section ID are required'
    });
  }

  const validatedData = SectionResponseSchema.parse(req.body);

  const response = await responseService.updateSectionResponse(id, sectionId, validatedData);
  
  if (!response) {
    return res.status(404).json({
      success: false,
      error: 'Response or section not found'
    });
  }

  return res.json({
    success: true,
    data: response
  });
}));

// GET /api/responses/organization/:orgId - Get responses for organization
router.get('/organization/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  if (!orgId) {
    return res.status(400).json({
      success: false,
      error: 'Organization ID is required'
    });
  }

  const { status } = req.query;

  const responses = await responseService.getResponsesByOrganization(
    orgId,
    status as string
  );
  
  return res.json({
    success: true,
    data: responses
  });
}));

// POST /api/responses/:id/submit - Submit questionnaire response
router.post('/:id/submit', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Response ID is required'
    });
  }

  const response = await responseService.submitResponse(id);
  
  if (!response) {
    return res.status(404).json({
      success: false,
      error: 'Response not found'
    });
  }

  return res.json({
    success: true,
    data: response,
    message: 'Questionnaire submitted successfully'
  });
}));

export default router;
