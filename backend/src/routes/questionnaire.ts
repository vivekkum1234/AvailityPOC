import { Router, Request, Response } from 'express';
import { QuestionnaireService } from '../services/questionnaireService';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const questionnaireService = new QuestionnaireService();

// GET /api/questionnaires - Get all questionnaires
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const questionnaires = await questionnaireService.getAllQuestionnaires();
  return res.json({
    success: true,
    data: questionnaires
  });
}));

// GET /api/questionnaires/:id - Get specific questionnaire
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Questionnaire ID is required'
    });
  }

  const questionnaire = await questionnaireService.getQuestionnaireById(id);
  
  if (!questionnaire) {
    return res.status(404).json({
      success: false,
      error: 'Questionnaire not found'
    });
  }

  return res.json({
    success: true,
    data: questionnaire
  });
}));

// GET /api/questionnaires/:id/sections - Get questionnaire sections
router.get('/:id/sections', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Questionnaire ID is required'
    });
  }

  const { mode } = req.query;

  const sections = await questionnaireService.getQuestionnaireSections(
    id,
    mode as string
  );
  
  return res.json({
    success: true,
    data: sections
  });
}));

// GET /api/questionnaires/:id/sections/:sectionId - Get specific section
router.get('/:id/sections/:sectionId', asyncHandler(async (req: Request, res: Response) => {
  const { id, sectionId } = req.params;
  if (!id || !sectionId) {
    return res.status(400).json({
      success: false,
      error: 'Questionnaire ID and Section ID are required'
    });
  }

  const { mode } = req.query;

  const section = await questionnaireService.getQuestionnaireSection(
    id,
    sectionId,
    mode as string
  );
  
  if (!section) {
    return res.status(404).json({
      success: false,
      error: 'Section not found'
    });
  }

  return res.json({
    success: true,
    data: section
  });
}));

export default router;
